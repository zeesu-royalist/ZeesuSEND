export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { purgeExpiredTransfers } = await import('@/lib/cleanup');

    // Run cleanup immediately on server startup
    purgeExpiredTransfers().catch(() => {});

    // Run periodic cleanup every 60 seconds (1 minute) in long-running Node/dev server
    setInterval(() => {
      purgeExpiredTransfers().catch(() => {});
    }, 60 * 1000);
  }
}
