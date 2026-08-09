import { createClient } from '@supabase/supabase-js';

function clean(val: string | undefined, fallback: string): string {
  if (!val) return fallback;
  return val.trim().replace(/^["']|["']$/g, '');
}

const supabaseUrl = clean(process.env.NEXT_PUBLIC_SUPABASE_URL, 'https://placeholder.supabase.co');
const supabaseAnonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'placeholder-anon-key');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
