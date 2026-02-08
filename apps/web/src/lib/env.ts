export const env = {
  supabaseUrl: (import.meta.env.VITE_SUPABASE_URL as string).trim(),
  supabaseAnonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string).trim(),
} as const;

if (!env.supabaseUrl || !env.supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env.local');
}
