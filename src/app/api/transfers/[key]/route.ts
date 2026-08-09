import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/server';
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

    const supabaseAdmin = getAdminSupabase();

    // 2. Query Transfer by key
    const { data: transfer, error: transferError } = await supabaseAdmin
      .from('transfers')
      .select('*')
      .eq('transfer_key', sanitizedKey)
      .maybeSingle();

    if (transferError) {
      console.error('Error querying transfer key:', transferError);
      return NextResponse.json({ error: 'Database query failed.' }, { status: 500 });
    }

    if (!transfer) {
      return NextResponse.json({ error: 'Transfer not found.' }, { status: 404 });
    }

    // 3. Expiration Check
    if (transfer.expires_at) {
      const expiresAt = new Date(transfer.expires_at).getTime();
      const now = Date.now();
      if (now > expiresAt) {
        // Mark as expired in DB if not already marked
        if (transfer.status !== 'expired') {
          await supabaseAdmin.from('transfers').update({ status: 'expired' }).eq('id', transfer.id);
        }
        return NextResponse.json({ error: 'This transfer has expired.' }, { status: 410 });
      }
    }

    // 4. Download Limit Check
    if (
      transfer.download_limit !== null &&
      transfer.download_count >= transfer.download_limit
    ) {
      if (transfer.status !== 'download_limit_reached') {
        await supabaseAdmin
          .from('transfers')
          .update({ status: 'download_limit_reached' })
          .eq('id', transfer.id);
      }
      return NextResponse.json(
        { error: 'This transfer is no longer available because it has reached its download limit.' },
        { status: 410 }
      );
    }

    // 5. Fetch Transfer Items
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('transfer_items')
      .select('*')
      .eq('transfer_id', transfer.id);

    if (itemsError || !items) {
      console.error('Error fetching transfer items:', itemsError);
      return NextResponse.json({ error: 'Failed to retrieve transfer items.' }, { status: 500 });
    }

    // 6. Generate short-lived signed URLs for preview items (images, media, safe files)
    const processedItems: TransferItem[] = await Promise.all(
      items.map(async (item) => {
        let signedUrl: string | undefined = undefined;

        if (item.file_path && (item.type === 'image' || item.type === 'file')) {
          // Generate 1-hour signed URL for browser preview display
          const { data: signedData } = await supabaseAdmin.storage
            .from('transfers')
            .createSignedUrl(item.file_path, 3600);

          if (signedData?.signedUrl) {
            signedUrl = signedData.signedUrl;
          }
        }

        return {
          id: item.id,
          transfer_id: item.transfer_id,
          type: item.type,
          file_name: item.file_name,
          file_path: item.file_path,
          mime_type: item.mime_type,
          file_size: item.file_size,
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
