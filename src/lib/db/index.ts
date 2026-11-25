import { neon } from '@neondatabase/serverless';

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set in environment variables.');
  }
  return url;
}

export function getDb() {
  const databaseUrl = getDatabaseUrl();
  return neon(databaseUrl);
}
