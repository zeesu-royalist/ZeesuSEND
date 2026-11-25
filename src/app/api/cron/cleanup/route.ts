import { NextResponse } from 'next/server';
import { purgeExpiredTransfers } from '@/lib/cleanup';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Optional secret check if CRON_SECRET is set in environment variables
    if (cronSecret) {
      const isAuthorized =
        authHeader === `Bearer ${cronSecret}` ||
        searchParams.get('key') === cronSecret;

      if (!isAuthorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const result = await purgeExpiredTransfers();
    return NextResponse.json({
      success: true,
      message: 'Expired transfers cleanup completed.',
      result,
    });
  } catch (err: any) {
    console.error('Cron cleanup error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error during cleanup' },
      { status: 500 }
    );
  }
}
