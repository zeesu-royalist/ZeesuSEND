import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { createPresignedDownloadUrl } from '@/lib/storage';
import { rateLimit, getClientIp } from '@/lib/transfer/rate-limiter';
import { sanitizeTransferKey, isValidKeyFormat } from '@/lib/transfer/key-generator';

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: { key: string } }
) {
  try {
    const rawKey = params.key;
    const sanitizedKey = sanitizeTransferKey(rawKey);

    // 1. Rate Limiting
    const clientIp = getClientIp(req);
    const rateLimitResult = await rateLimit(`download:${clientIp}`, { limit: 20, windowMs: 60 * 1000 });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many download requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    if (!isValidKeyFormat(sanitizedKey)) {
      return NextResponse.json({ error: 'Invalid transfer key format.' }, { status: 400 });
    }

    const sql = getDb();

    // 2. Fetch transfer record
    const transferRows = await sql`
      SELECT * FROM public.transfers WHERE transfer_key = ${sanitizedKey} LIMIT 1
    `;

    if (!transferRows || transferRows.length === 0) {
      return NextResponse.json({ error: 'Transfer not found.' }, { status: 404 });
    }

    const transfer = transferRows[0];

    // 3. Expiration Check
    if (transfer.expires_at && new Date(transfer.expires_at).getTime() <= Date.now()) {
      await sql`
        UPDATE public.transfers SET status = 'expired' WHERE id = ${transfer.id}
      `;
      return NextResponse.json({ error: 'This transfer has expired.' }, { status: 410 });
    }

    // 4. Download Limit Check
    if (
      transfer.download_limit !== null &&
      transfer.download_count >= transfer.download_limit
    ) {
      await sql`
        UPDATE public.transfers SET status = 'download_limit_reached' WHERE id = ${transfer.id}
      `;
      return NextResponse.json(
        { error: 'This transfer has reached its download limit.' },
        { status: 410 }
      );
    }

    // 5. ATOMIC Increment of Download Count
    const updatedRows = await sql`
      UPDATE public.transfers
      SET download_count = download_count + 1,
          status = CASE
            WHEN download_limit IS NOT NULL AND download_count + 1 >= download_limit THEN 'download_limit_reached'
            ELSE status
          END
      WHERE id = ${transfer.id}
        AND (download_limit IS NULL OR download_count < download_limit)
      RETURNING *
    `;

    if (!updatedRows || updatedRows.length === 0) {
      return NextResponse.json(
        { error: 'Download denied. Transfer may be expired or limit reached.' },
        { status: 403 }
      );
    }

    const updatedTransfer = updatedRows[0];

    // 6. Fetch items and generate short-lived signed URLs for storage files
    const items = await sql`
      SELECT * FROM public.transfer_items WHERE transfer_id = ${transfer.id} ORDER BY created_at ASC
    `;

    const downloadLinks = await Promise.all(
      items.map(async (item: any) => {
        if (item.type === 'text') {
          return {
            id: item.id,
            type: 'text',
            textContent: item.text_content,
          };
        }

        let signedUrl = '';
        if (item.file_path) {
          // Generate 5-minute signed URL with attachment download header
          signedUrl = await createPresignedDownloadUrl(
            item.file_path,
            item.file_name || 'download',
            300
          );
        }

        return {
          id: item.id,
          type: item.type,
          fileName: item.file_name,
          mimeType: item.mime_type,
          fileSize: item.file_size ? Number(item.file_size) : null,
          signedUrl,
        };
      })
    );

    return NextResponse.json({
      success: true,
      downloadCount: updatedTransfer.download_count,
      items: downloadLinks,
    });
  } catch (err: any) {
    console.error('Unhandled error in POST /api/transfers/[key]/download:', err);
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
