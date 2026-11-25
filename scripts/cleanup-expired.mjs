/**
 * Cleanup Script for Expired Transfers
 * 
 * Identifies expired transfers in Neon PostgreSQL,
 * removes their associated storage objects from S3 Storage,
 * and deletes database records.
 * 
 * Usage:
 *   node scripts/cleanup-expired.mjs
 */

import { neon } from '@neondatabase/serverless';
import { S3Client, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function cleanupExpiredTransfers() {
  console.log('[Cleanup] Starting expired transfers cleanup...');
  const sql = neon(process.env.DATABASE_URL);

  const s3 = new S3Client({
    endpoint: process.env.AWS_ENDPOINT_URL_S3,
    region: process.env.AWS_REGION || 'ap-southeast-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });

  const bucket = process.env.S3_BUCKET_NAME || 'transfers';

  // Find all expired transfers
  const expiredTransfers = await sql`
    SELECT id, transfer_key, expires_at
    FROM public.transfers
    WHERE status = 'expired'
       OR (expires_at IS NOT NULL AND expires_at <= NOW())
  `;

  if (!expiredTransfers || expiredTransfers.length === 0) {
    console.log('[Cleanup] No expired transfers found.');
    return;
  }

  console.log(`[Cleanup] Found ${expiredTransfers.length} expired transfers to purge.`);

  for (const transfer of expiredTransfers) {
    // 1. Fetch item file paths
    const items = await sql`
      SELECT file_path FROM public.transfer_items WHERE transfer_id = ${transfer.id}
    `;

    const pathsToRemove = items
      .map((item) => item.file_path)
      .filter((path) => Boolean(path));

    if (pathsToRemove.length > 0) {
      console.log(`[Cleanup] Removing ${pathsToRemove.length} storage files for key ${transfer.transfer_key}...`);
      try {
        await s3.send(new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: pathsToRemove.map((key) => ({ Key: key })),
            Quiet: true,
          },
        }));
      } catch (storageErr) {
        console.error(`[Cleanup Warning] Failed to delete storage paths for transfer ${transfer.id}:`, storageErr);
      }
    }

    // 2. Delete database record (cascade deletes transfer_items)
    await sql`DELETE FROM public.transfers WHERE id = ${transfer.id}`;
    console.log(`[Cleanup] Deleted transfer ${transfer.transfer_key} (${transfer.id}).`);
  }

  console.log('[Cleanup] Finished expired transfers cleanup successfully.');
}

cleanupExpiredTransfers().catch((err) => {
  console.error('[Cleanup Fatal Error]', err);
});
