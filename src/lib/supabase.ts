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

export const getURL = () => {
  let url =
    process.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env vars
    process.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel
    'http://localhost:3000/';
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  return url;
};

// Server-side admin client (for API routes) using the Service Role Key
export const supabaseAdmin = typeof window === 'undefined' 
  ? createClient(
      supabaseUrl || '', 
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )
  : null;
