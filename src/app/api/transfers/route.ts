import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/server';
import { generateTransferKey } from '@/lib/transfer/key-generator';
import { rateLimit, getClientIp } from '@/lib/transfer/rate-limiter';
import { calculateExpirationDate, parseDownloadLimit } from '@/lib/validation/transfer-schema';
import { TransferItemType } from '@/types';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '100', 10);
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface FileMetadata {
  name: string;
  size: number;
  type: string;
}

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting
    const clientIp = getClientIp(req);
    const rateLimitResult = await rateLimit(`create:${clientIp}`, { limit: 20, windowMs: 60 * 1000 });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before creating more transfers.' },
        { status: 429 }
      );
    }

    const json = await req.json();
    const {
      type = 'file',
      expiration = '24h',
      downloadLimit = 'unlimited',
      textContent = '',
      files = [],
    } = json as {
      type: 'file' | 'text';
      expiration: string;
      downloadLimit: string;
      textContent?: string;
      files?: FileMetadata[];
    };

    const supabaseAdmin = getAdminSupabase();

    // 2. Validation
    if (type === 'text') {
      if (!textContent || !textContent.trim()) {
        return NextResponse.json({ error: 'Text content cannot be empty.' }, { status: 400 });
      }
      if (textContent.length > 100000) {
        return NextResponse.json({ error: 'Text content is too long (max 100,000 characters).' }, { status: 400 });
      }
    } else {
      if (!files || files.length === 0) {
        return NextResponse.json({ error: 'Please select at least one file to transfer.' }, { status: 400 });
      }

      for (const file of files) {
        if (file.size > MAX_FILE_SIZE_BYTES) {
          return NextResponse.json(
            { error: `File "${file.name}" exceeds maximum allowed size of ${MAX_FILE_SIZE_MB}MB.` },
            { status: 400 }
          );
        }
      }
    }

    const expiresAt = calculateExpirationDate(expiration);
    const parsedDownloadLimit = parseDownloadLimit(downloadLimit);

    // 3. Generate key with collision retry
    let transferKey = '';
    let isKeyUnique = false;
    let attempts = 0;

    while (!isKeyUnique && attempts < 5) {
      attempts++;
      transferKey = generateTransferKey();

      const { data: existing, error: checkError } = await supabaseAdmin
        .from('transfers')
        .select('id')
        .eq('transfer_key', transferKey)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking transfer_key uniqueness:', checkError);
        if (
          checkError.code === 'PGRST205' ||
          checkError.code === '42P01' ||
          checkError.message.includes("Could not find the table 'public.transfers'") ||
          checkError.message.includes('relation "transfers" does not exist')
        ) {
          return NextResponse.json(
            {
              error:
                'Table "public.transfers" was not found in project "nuscmkmukautghlgdcaa". Please run the SQL migration query in your Supabase SQL Editor and run `NOTIFY pgrst, \'reload schema\';`.',
            },
            { status: 500 }
          );
        }
      }

      if (!existing) {
        isKeyUnique = true;
      }
    }

    if (!isKeyUnique) {
      return NextResponse.json(
        { error: 'Failed to generate a unique transfer key. Please try again.' },
        { status: 500 }
      );
    }

    // 4. Create Transfer record in PostgreSQL
    const { data: transferRecord, error: transferError } = await supabaseAdmin
      .from('transfers')
      .insert({
        transfer_key: transferKey,
        status: 'active',
        expires_at: expiresAt ? expiresAt.toISOString() : null,
        download_limit: parsedDownloadLimit,
      })
      .select()
      .single();

    if (transferError || !transferRecord) {
      console.error('Database transfer creation error:', transferError);
      const detail = transferError?.message || transferError?.details || 'Unknown database error';
      if (
        transferError?.code === 'PGRST205' ||
        transferError?.code === '42P01' ||
        detail.includes("Could not find the table 'public.transfers'") ||
        detail.includes('relation "transfers" does not exist')
      ) {
        return NextResponse.json(
          {
            error:
              'Table "public.transfers" is not in Supabase schema cache. Please run the SQL query in Supabase SQL Editor and run: NOTIFY pgrst, \'reload schema\';',
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: `Failed to create transfer record in database: ${detail}` },
        { status: 500 }
      );
    }

    const transferId = transferRecord.id;
    const itemsToInsert = [];
    const uploadTargets = [];

    // 5. Handle Items & Create Presigned Upload URLs
    if (type === 'text') {
      itemsToInsert.push({
        transfer_id: transferId,
        type: 'text' as TransferItemType,
        text_content: textContent,
      });
    } else {
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const ext = getFileExtension(file.name);
        const randomStorageName = `${crypto.randomUUID()}.${ext}`;
        const storagePath = `${transferId}/${randomStorageName}`;

        // Create Presigned Signed Upload URL directly to Supabase Storage
        const { data: signedUploadData, error: signedUploadError } =
          await supabaseAdmin.storage
            .from('transfers')
            .createSignedUploadUrl(storagePath);

        if (signedUploadError || !signedUploadData) {
          console.error('Failed to create signed upload URL:', signedUploadError);
          // Rollback transfer row
          await supabaseAdmin.from('transfers').delete().eq('id', transferId);

          const storageDetail = signedUploadError?.message || 'Storage bucket error';
          if (storageDetail.includes('Bucket not found') || storageDetail.includes('not_found')) {
            return NextResponse.json(
              {
                error:
                  'Supabase storage bucket "transfers" was not found. Please create a private storage bucket named "transfers" in your Supabase Dashboard.',
              },
              { status: 500 }
            );
          }

          return NextResponse.json(
            { error: `Failed to prepare storage upload: ${storageDetail}` },
            { status: 500 }
          );
        }

        const isImage = file.type.startsWith('image/');
        itemsToInsert.push({
          transfer_id: transferId,
          type: (isImage ? 'image' : 'file') as TransferItemType,
          file_name: file.name,
          file_path: storagePath,
          mime_type: file.type || 'application/octet-stream',
          file_size: file.size,
        });

        uploadTargets.push({
          fileIndex: index,
          fileName: file.name,
          filePath: storagePath,
          signedUrl: signedUploadData.signedUrl,
          token: signedUploadData.token,
        });
      }
    }

    // Insert items into PostgreSQL
    const { data: insertedItems, error: itemsError } = await supabaseAdmin
      .from('transfer_items')
      .insert(itemsToInsert)
      .select();

    if (itemsError || !insertedItems) {
      console.error('Database items insertion error:', itemsError);
      await supabaseAdmin.from('transfers').delete().eq('id', transferId);
      return NextResponse.json(
        { error: `Failed to record transfer items in database: ${itemsError?.message || ''}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transfer: {
        id: transferRecord.id,
        key: transferKey,
        expiresAt: transferRecord.expires_at,
        downloadLimit: transferRecord.download_limit,
        itemCount: insertedItems.length,
      },
      uploadTargets,
    });
  } catch (err: any) {
    console.error('Unhandled error in POST /api/transfers:', err);
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred while creating the transfer.' },
      { status: 500 }
    );
  }
}

function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length > 1) {
    return parts.pop() || 'bin';
  }
  return 'bin';
}
