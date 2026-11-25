import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { createPresignedDownloadUrl } from '@/lib/storage';
import { purgeTransferById } from '@/lib/cleanup';
import { rateLimit, getClientIp } from '@/lib/transfer/rate-limiter';
import { sanitizeTransferKey, isValidKeyFormat } from '@/lib/transfer/key-generator';
import { TransferItem } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { key: string } }
) {
  try {
    const rawKey = params.key;
    const sanitizedKey = sanitizeTransferKey(rawKey);

    // 1. Rate Limiting
    const clientIp = getClientIp(req);
    const rateLimitResult = await rateLimit(`lookup:${clientIp}`, { limit: 30, windowMs: 60 * 1000 });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many transfer lookups. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    if (!isValidKeyFormat(sanitizedKey)) {
      return NextResponse.json({ error: 'Invalid transfer key format.' }, { status: 400 });
    }

    const sql = getDb();

    // 2. Query Transfer by key
    const transferRows = await sql`
      SELECT * FROM public.transfers WHERE transfer_key = ${sanitizedKey} LIMIT 1
    `;

    if (!transferRows || transferRows.length === 0) {
      return NextResponse.json({ error: 'Transfer not found.' }, { status: 404 });
    }

    const transfer = transferRows[0];

    // 3. Expiration Check
    if (transfer.expires_at) {
      const expiresAt = new Date(transfer.expires_at).getTime();
      const now = Date.now();
      if (now > expiresAt) {
        // Immediately purge S3 files and delete DB record
        purgeTransferById(transfer.id).catch(() => {});
        return NextResponse.json({ error: 'This transfer has expired.' }, { status: 410 });
      }
    }

    // 4. Download Limit Check
    if (
      transfer.download_limit !== null &&
      transfer.download_count >= transfer.download_limit
    ) {
      if (transfer.status !== 'download_limit_reached') {
        await sql`
          UPDATE public.transfers SET status = 'download_limit_reached' WHERE id = ${transfer.id}
        `;
      }
      return NextResponse.json(
        { error: 'This transfer is no longer available because it has reached its download limit.' },
        { status: 410 }
      );
    }

    // 5. Fetch Transfer Items
    const items = await sql`
      SELECT * FROM public.transfer_items WHERE transfer_id = ${transfer.id} ORDER BY created_at ASC
    `;

    // 6. Generate short-lived signed URLs for preview items
    const processedItems: TransferItem[] = await Promise.all(
      items.map(async (item: any) => {
        let signedUrl: string | undefined = undefined;

        if (item.file_path && (item.type === 'image' || item.type === 'file')) {
          try {
            signedUrl = await createPresignedDownloadUrl(item.file_path, null, 3600);
          } catch (e) {
            console.error('Error generating preview signed URL:', e);
          }
        }

        return {
          id: item.id,
          transfer_id: item.transfer_id,
          type: item.type,
          file_name: item.file_name,
          file_path: item.file_path,
          mime_type: item.mime_type,
          file_size: item.file_size ? Number(item.file_size) : null,
          text_content: item.text_content,
          created_at: item.created_at,
          signed_url: signedUrl,
        };
      })
    );

    return NextResponse.json({
      success: true,
      transfer: {
        id: transfer.id,
        transfer_key: transfer.transfer_key,
        status: transfer.status,
        created_at: transfer.created_at,
        expires_at: transfer.expires_at,
        download_limit: transfer.download_limit,
        download_count: transfer.download_count,
        items: processedItems,
      },
    });
  } catch (err: any) {
    console.error('Unhandled error in GET /api/transfers/[key]:', err);
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { key: string } }
) {
  try {
    const rawKey = params.key;
    const sanitizedKey = sanitizeTransferKey(rawKey);

    if (!isValidKeyFormat(sanitizedKey)) {
      return NextResponse.json({ error: 'Invalid transfer key format.' }, { status: 400 });
    }

    const sql = getDb();
    const rows = await sql`
      SELECT id FROM public.transfers WHERE transfer_key = ${sanitizedKey} LIMIT 1
    `;

    if (rows && rows.length > 0) {
      await purgeTransferById(rows[0].id);
    }

    return NextResponse.json({ success: true, message: 'Transfer deleted successfully.' });
  } catch (err: any) {
    console.error('Unhandled error in DELETE /api/transfers/[key]:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to delete transfer.' },
      { status: 500 }
    );
  }
}
