import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { createPresignedDownloadUrl } from '@/lib/storage';
import { sanitizeTransferKey, isValidKeyFormat } from '@/lib/transfer/key-generator';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { key: string; itemId: string } }
) {
  try {
    const rawKey = params.key;
    const itemId = params.itemId;
    const sanitizedKey = sanitizeTransferKey(rawKey);

    if (!isValidKeyFormat(sanitizedKey)) {
      return NextResponse.json({ error: 'Invalid key format.' }, { status: 400 });
    }

    const sql = getDb();

    // Verify transfer
    const transferRows = await sql`
      SELECT * FROM public.transfers WHERE transfer_key = ${sanitizedKey} LIMIT 1
    `;

    if (!transferRows || transferRows.length === 0) {
      return NextResponse.json({ error: 'Transfer not found.' }, { status: 404 });
    }

    const transfer = transferRows[0];

    // Expiration & limit checks
    if (transfer.expires_at && new Date(transfer.expires_at).getTime() <= Date.now()) {
      return NextResponse.json({ error: 'This transfer has expired.' }, { status: 410 });
    }

    if (transfer.download_limit !== null && transfer.download_count >= transfer.download_limit) {
      return NextResponse.json({ error: 'Download limit reached.' }, { status: 410 });
    }

    // Retrieve item
    const itemRows = await sql`
      SELECT * FROM public.transfer_items WHERE id = ${itemId} AND transfer_id = ${transfer.id} LIMIT 1
    `;

    if (!itemRows || itemRows.length === 0) {
      return NextResponse.json({ error: 'Item not found.' }, { status: 404 });
    }

    const item = itemRows[0];

    if (item.type === 'text') {
      return new NextResponse(item.text_content || '', {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="${sanitizedKey}_text.txt"`,
        },
      });
    }

    if (!item.file_path) {
      return NextResponse.json({ error: 'File path not available.' }, { status: 404 });
    }

    // Generate signed download URL and redirect
    const signedUrl = await createPresignedDownloadUrl(
      item.file_path,
      item.file_name || 'download',
      300
    );

    return NextResponse.redirect(signedUrl);
  } catch (err: any) {
    console.error('Unhandled error in GET /api/transfers/[key]/item/[itemId]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
