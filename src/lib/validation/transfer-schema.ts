import { z } from 'zod';

export const expirationEnum = z.enum(['1h', '6h', '24h', '3d', '7d', 'never']);

export const downloadLimitEnum = z.enum(['unlimited', '1', '5', '10']);

export const createTextTransferSchema = z.object({
  textContent: z.string().min(1, 'Text content cannot be empty').max(100000, 'Text content is too long (max 100,000 characters)'),
  expiration: expirationEnum.default('24h'),
  downloadLimit: downloadLimitEnum.default('unlimited'),
});

export const transferKeySchema = z
  .string()
  .trim()
  .transform((val) => val.toUpperCase().replace(/[^A-Z0-9]/g, ''))
  .refine((val) => val.length === 6, {
    message: 'Transfer key must be exactly 6 characters',
  });

export const downloadRequestSchema = z.object({
  key: transferKeySchema,
  itemId: z.string().uuid('Invalid item ID').optional(),
});

export function calculateExpirationDate(expiration: string): Date | null {
  const now = new Date();
  switch (expiration) {
    case '1h':
      return new Date(now.getTime() + 1 * 60 * 60 * 1000);
    case '6h':
      return new Date(now.getTime() + 6 * 60 * 60 * 1000);
    case '24h':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case '3d':
      return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'never':
      return null;
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours fallback
  }
}

export function parseDownloadLimit(limit: string): number | null {
  if (limit === 'unlimited') return null;
  const parsed = parseInt(limit, 10);
  return isNaN(parsed) ? null : parsed;
}
