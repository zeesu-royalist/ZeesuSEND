import { createClient } from '@supabase/supabase-js';

function clean(val: string | undefined, fallback: string): string {
  if (!val) return fallback;
  return val.trim().replace(/^["']|["']$/g, '');
}

/**
 * Gets the best matching key for the configured Supabase URL.
 * Prevents mixing keys from different Supabase projects.
 */
function getMatchingKey(): string {
  const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL, '');
  const publishableKey = clean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, '');
  const anonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, '');
  const serviceKey = clean(process.env.SUPABASE_SERVICE_ROLE_KEY, '');

  // Extract project ref from URL (e.g., https://nuscmkmukautghlgdcaa.supabase.co -> nuscmkmukautghlgdcaa)
  const urlProjectRef = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

  // If serviceKey is a JWT, check if its project ref matches urlProjectRef
  if (serviceKey && serviceKey.startsWith('eyJ') && urlProjectRef) {
    try {
      const parts = serviceKey.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        if (payload.ref && payload.ref !== urlProjectRef) {
          console.warn(
            `[Supabase Warning] SUPABASE_SERVICE_ROLE_KEY belongs to project "${payload.ref}" but URL is for "${urlProjectRef}". Using matching publishable/anon key instead.`
          );
          return publishableKey || anonKey || serviceKey;
        }
      }
    } catch (e) {
      // Ignore parse error
    }
  }

  return serviceKey || publishableKey || anonKey || 'placeholder-key';
}

export function getAdminSupabase() {
  const supabaseUrl = clean(process.env.NEXT_PUBLIC_SUPABASE_URL, 'https://placeholder.supabase.co');
  const apiKey = getMatchingKey();

  return createClient(supabaseUrl, apiKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }),
    },
  });
}
