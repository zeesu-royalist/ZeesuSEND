import { createClient } from '@supabase/supabase-js';

function clean(val: string | undefined, fallback: string): string {
  if (!val) return fallback;
  return val.trim().replace(/^["']|["']$/g, '');
}

const supabaseUrl = clean(process.env.NEXT_PUBLIC_SUPABASE_URL, 'https://placeholder.supabase.co');
const supabaseServiceRoleKey = clean(process.env.SUPABASE_SERVICE_ROLE_KEY, 'placeholder-service-role-key');

/**
 * Administrative Supabase client using Service Role Key.
 * MUST ONLY BE USED ON THE SERVER (API routes, Server Actions, Server Components).
 * NEVER expose this client or SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function getAdminSupabase() {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }),
    },
  });
}
