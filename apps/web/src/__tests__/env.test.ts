import { describe, it, expect, vi } from 'vitest';

describe('env.ts', () => {
  it('trims whitespace and newlines from VITE_SUPABASE_URL', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '  https://example.supabase.co\n');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');

    // Re-import to pick up new env values
    vi.resetModules();
    const { env } = await import('@/lib/env');
    expect(env.supabaseUrl).toBe('https://example.supabase.co');
  });

  it('trims trailing %0A newline from VITE_SUPABASE_ANON_KEY', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiJ9.test\n');

    vi.resetModules();
    const { env } = await import('@/lib/env');
    expect(env.supabaseAnonKey).toBe('eyJhbGciOiJIUzI1NiJ9.test');
  });

  it('throws when VITE_SUPABASE_URL is empty', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'key');

    vi.resetModules();
    await expect(import('@/lib/env')).rejects.toThrow('Missing Supabase environment variables');
  });

  it('throws when VITE_SUPABASE_ANON_KEY is empty', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

    vi.resetModules();
    await expect(import('@/lib/env')).rejects.toThrow('Missing Supabase environment variables');
  });
});
