/**
 * Cleanup Script for Expired Transfers
 * 
 * This script identifies all expired transfers in PostgreSQL,
 * removes their associated storage objects from private Supabase Storage,
 * and deletes the database records.
 * 
 * Usage:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/cleanup-expired.ts
 * 
 * Or trigger via Supabase pg_cron or Vercel Cron.
 */

import { getAdminSupabase } from '../src/lib/supabase/server';

async function cleanupExpiredTransfers() {
  console.log('[Cleanup] Starting expired transfers cleanup...');
  const supabase = getAdminSupabase();

  const nowISO = new Date().toISOString();

  // Find all expired transfers
  const { data: expiredTransfers, error } = await supabase
    .from('transfers')
    .select('id, transfer_key, expires_at')
    .or(`status.eq.expired,expires_at.lte.${nowISO}`);

  if (error) {
    console.error('[Cleanup Error] Failed to fetch expired transfers:', error);
    return;
  }

  if (!expiredTransfers || expiredTransfers.length === 0) {
    console.log('[Cleanup] No expired transfers found.');
    return;
  }

  console.log(`[Cleanup] Found ${expiredTransfers.length} expired transfers to purge.`);

  for (const transfer of expiredTransfers) {
    // 1. Fetch item file paths
    const { data: items } = await supabase
      .from('transfer_items')
      .select('file_path')
      .eq('transfer_id', transfer.id);

    if (items && items.length > 0) {
      const pathsToRemove = items
        .map((item) => item.file_path)
        .filter((path): path is string => Boolean(path));

      if (pathsToRemove.length > 0) {
        console.log(`[Cleanup] Removing ${pathsToRemove.length} storage files for key ${transfer.transfer_key}...`);
        const { error: storageErr } = await supabase.storage.from('transfers').remove(pathsToRemove);
        if (storageErr) {
          console.error(`[Cleanup Warning] Failed to delete storage paths for transfer ${transfer.id}:`, storageErr);
        }
      }
    }

    // 2. Delete database record (cascade deletes transfer_items)
    const { error: deleteErr } = await supabase.from('transfers').delete().eq('id', transfer.id);
    if (deleteErr) {
      console.error(`[Cleanup Error] Failed to delete transfer record ${transfer.id}:`, deleteErr);
    } else {
      console.log(`[Cleanup] Deleted transfer ${transfer.transfer_key} (${transfer.id}).`);
    }
  }

  console.log('[Cleanup] Finished expired transfers cleanup successfully.');
}

cleanupExpiredTransfers().catch((err) => {
  console.error('[Cleanup Fatal Error]', err);
});
