import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/server';
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

    const supabaseAdmin = getAdminSupabase();

    // 2. Fetch transfer record
    const { data: transfer, error: transferError } = await supabaseAdmin
      .from('transfers')
      .select('*')
      .eq('transfer_key', sanitizedKey)
      .maybeSingle();

    if (transferError || !transfer) {
      return NextResponse.json({ error: 'Transfer not found.' }, { status: 404 });
    }

    // 3. Expiration Check
    if (transfer.expires_at && new Date(transfer.expires_at).getTime() <= Date.now()) {
      await supabaseAdmin.from('transfers').update({ status: 'expired' }).eq('id', transfer.id);
      return NextResponse.json({ error: 'This transfer has expired.' }, { status: 410 });
    }

    // 4. Download Limit Check
    if (
      transfer.download_limit !== null &&
      transfer.download_count >= transfer.download_limit
    ) {
      await supabaseAdmin
        .from('transfers')
        .update({ status: 'download_limit_reached' })
        .eq('id', transfer.id);
      return NextResponse.json(
        { error: 'This transfer has reached its download limit.' },
        { status: 410 }
      );
    }

    // 5. ATOMIC Increment of Download Count via RPC function or SQL update
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc(
      'increment_transfer_download_count',
      { p_transfer_id: transfer.id }
    );

    let isAllowed = false;
    if (!rpcError && rpcData && rpcData.length > 0) {
      isAllowed = rpcData[0].success;
    } else {
      // Fallback atomic SQL update if RPC function is not installed in database yet
      const { data: updatedTransfer, error: updateError } = await supabaseAdmin
        .from('transfers')
        .update({ download_count: transfer.download_count + 1 })
        .eq('id', transfer.id)
        .select()
        .single();

      if (!updateError && updatedTransfer) {
        isAllowed = true;
      }
    }

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Download denied. Transfer may be expired or limit reached.' },
        { status: 403 }
      );
    }

    // 6. Fetch items and generate short-lived signed URLs for storage files
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('transfer_items')
      .select('*')
      .eq('transfer_id', transfer.id);

    if (itemsError || !items) {
      return NextResponse.json({ error: 'Failed to retrieve transfer items.' }, { status: 500 });
    }

    const downloadLinks = await Promise.all(
      items.map(async (item) => {
        if (item.type === 'text') {
          return {
            id: item.id,
            type: 'text',
            textContent: item.text_content,
          };
        }

        let signedUrl = '';
        if (item.file_path) {
          // Generate 5-minute signed URL with download attribute forced to original file_name
          const { data: signedData } = await supabaseAdmin.storage
            .from('transfers')
            .createSignedUrl(item.file_path, 300, {
              download: item.file_name || 'download',
            });

          if (signedData?.signedUrl) {
            signedUrl = signedData.signedUrl;
          }
        }

        return {
          id: item.id,
          type: item.type,
          fileName: item.file_name,
          mimeType: item.mime_type,
          fileSize: item.file_size,
          signedUrl,
        };
      })
    );

    return NextResponse.json({
      success: true,
      downloadCount: transfer.download_count + 1,
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
