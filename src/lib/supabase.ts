import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Check your environment variables.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Server-side admin client (for API routes) using the Service Role Key
export const supabaseAdmin = typeof window === 'undefined' 
  ? createClient(
      supabaseUrl || '', 
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )
  : null;
