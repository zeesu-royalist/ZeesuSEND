import { getDb } from '@/lib/db';
import { deleteStorageFiles } from '@/lib/storage';

/**
 * Purges all transfers that have passed their expires_at date or reached their download limit.
 * Completely deletes the files from S3 storage and deletes records from PostgreSQL.
 */
export async function purgeExpiredTransfers() {
  try {
    const sql = getDb();

    // Find all expired or limit-reached transfers
    // For limit-reached transfers, allow a 10-minute grace window so active downloads can finish
    const expiredTransfers = await sql`
      SELECT id, transfer_key, expires_at
      FROM public.transfers
      WHERE status = 'expired'
         OR (status = 'download_limit_reached' AND created_at < NOW() - INTERVAL '10 minutes')
         OR (expires_at IS NOT NULL AND expires_at <= NOW())
    `;

    if (!expiredTransfers || expiredTransfers.length === 0) {
      return { transfersDeleted: 0, filesDeleted: 0 };
    }

    let deletedFilesCount = 0;

    for (const transfer of expiredTransfers) {
      // 1. Fetch file paths
      const items = await sql`
        SELECT file_path FROM public.transfer_items WHERE transfer_id = ${transfer.id}
      `;

      const pathsToRemove = items
        .map((item: any) => item.file_path)
        .filter((path: any): path is string => Boolean(path));

      if (pathsToRemove.length > 0) {
        try {
          await deleteStorageFiles(pathsToRemove);
          deletedFilesCount += pathsToRemove.length;
        } catch (e) {
          console.error(`[Purge Warning] Failed to delete S3 files for transfer ${transfer.id}:`, e);
        }
      }

      // 2. Cascade delete database record (transfer_items deleted automatically via foreign key ON DELETE CASCADE)
      await sql`DELETE FROM public.transfers WHERE id = ${transfer.id}`;
    }

    return {
      transfersDeleted: expiredTransfers.length,
      filesDeleted: deletedFilesCount,
    };
  } catch (err) {
    console.error('[Purge Error] Error during expired transfers cleanup:', err);
    return { transfersDeleted: 0, filesDeleted: 0, error: String(err) };
  }
}

/**
 * Immediately purges a single transfer and its S3 files.
 */
export async function purgeTransferById(transferId: string) {
  try {
    const sql = getDb();
    const items = await sql`
      SELECT file_path FROM public.transfer_items WHERE transfer_id = ${transferId}
    `;

    const pathsToRemove = items
      .map((item: any) => item.file_path)
      .filter((path: any): path is string => Boolean(path));

    if (pathsToRemove.length > 0) {
      await deleteStorageFiles(pathsToRemove).catch(() => {});
    }

    await sql`DELETE FROM public.transfers WHERE id = ${transferId}`;
  } catch (err) {
    console.error(`[Purge Error] Failed to purge transfer ${transferId}:`, err);
  }
}
