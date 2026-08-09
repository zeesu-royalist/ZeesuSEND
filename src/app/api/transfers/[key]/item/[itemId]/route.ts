import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/server';
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

    const supabaseAdmin = getAdminSupabase();

    // Verify transfer
    const { data: transfer, error: transferError } = await supabaseAdmin
      .from('transfers')
      .select('*')
      .eq('transfer_key', sanitizedKey)
      .maybeSingle();

    if (transferError || !transfer) {
      return NextResponse.json({ error: 'Transfer not found.' }, { status: 404 });
    }

    // Expiration & limit checks
    if (transfer.expires_at && new Date(transfer.expires_at).getTime() <= Date.now()) {
      return NextResponse.json({ error: 'This transfer has expired.' }, { status: 410 });
    }

    if (transfer.download_limit !== null && transfer.download_count >= transfer.download_limit) {
      return NextResponse.json({ error: 'Download limit reached.' }, { status: 410 });
    }

    // Retrieve item
    const { data: item, error: itemError } = await supabaseAdmin
      .from('transfer_items')
      .select('*')
      .eq('id', itemId)
      .eq('transfer_id', transfer.id)
      .maybeSingle();

    if (itemError || !item) {
      return NextResponse.json({ error: 'Item not found.' }, { status: 404 });
    }

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

    // Generate signed URL and redirect
    const { data: signedData } = await supabaseAdmin.storage
      .from('transfers')
      .createSignedUrl(item.file_path, 300, {
        download: item.file_name || 'download',
      });

    if (!signedData?.signedUrl) {
      return NextResponse.json({ error: 'Failed to generate signed download URL.' }, { status: 500 });
    }

    return NextResponse.redirect(signedData.signedUrl);
  } catch (err: any) {
    console.error('Unhandled error in GET /api/transfers/[key]/item/[itemId]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
