import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { createPresignedUploadUrl } from '@/lib/storage';
import { purgeExpiredTransfers } from '@/lib/cleanup';
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

    const sql = getDb();

    // Trigger lazy background cleanup of any expired transfers
    purgeExpiredTransfers().catch(() => {});

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

      const existing = await sql`
        SELECT id FROM public.transfers WHERE transfer_key = ${transferKey} LIMIT 1
      `;

      if (existing.length === 0) {
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
    const transferRows = await sql`
      INSERT INTO public.transfers (
        transfer_key,
        status,
        expires_at,
        download_limit
      ) VALUES (
        ${transferKey},
        'active',
        ${expiresAt ? expiresAt.toISOString() : null},
        ${parsedDownloadLimit}
      )
      RETURNING id, transfer_key, status, created_at, expires_at, download_limit, download_count
    `;

    if (!transferRows || transferRows.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create transfer record in database.' },
        { status: 500 }
      );
    }

    const transferRecord = transferRows[0];
    const transferId = transferRecord.id;
    const itemsToInsert: {
      transfer_id: string;
      type: TransferItemType;
      file_name: string | null;
      file_path: string | null;
      mime_type: string | null;
      file_size: number | null;
      text_content: string | null;
    }[] = [];
    const uploadTargets = [];

    // 5. Handle Items & Create Presigned Upload URLs
    if (type === 'text') {
      itemsToInsert.push({
        transfer_id: transferId,
        type: 'text' as TransferItemType,
        file_name: null,
        file_path: null,
        mime_type: 'text/plain',
        file_size: Buffer.byteLength(textContent, 'utf-8'),
        text_content: textContent,
      });
    } else {
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const ext = getFileExtension(file.name);
        const randomStorageName = `${crypto.randomUUID()}.${ext}`;
        const storagePath = `${transferId}/${randomStorageName}`;
        const contentType = file.type || 'application/octet-stream';

        // Create Presigned Upload URL for direct browser-to-S3 upload
        const signedUploadUrl = await createPresignedUploadUrl(storagePath, contentType);

        const isImage = file.type.startsWith('image/');
        itemsToInsert.push({
          transfer_id: transferId,
          type: (isImage ? 'image' : 'file') as TransferItemType,
          file_name: file.name,
          file_path: storagePath,
          mime_type: contentType,
          file_size: file.size,
          text_content: null,
        });

        uploadTargets.push({
          fileIndex: index,
          fileName: file.name,
          filePath: storagePath,
          signedUrl: signedUploadUrl,
        });
      }
    }

    // Insert items into PostgreSQL
    const insertedItems = [];
    for (const item of itemsToInsert) {
      const rows = await sql`
        INSERT INTO public.transfer_items (
          transfer_id,
          type,
          file_name,
          file_path,
          mime_type,
          file_size,
          text_content
        ) VALUES (
          ${item.transfer_id},
          ${item.type},
          ${item.file_name},
          ${item.file_path},
          ${item.mime_type},
          ${item.file_size},
          ${item.text_content}
        )
        RETURNING id
      `;
      insertedItems.push(rows[0]);
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
