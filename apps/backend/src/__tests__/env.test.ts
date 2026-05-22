import { describe, it, expect, beforeEach, vi } from 'vitest';

const origEnv = process.env;

describe('env validation', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...origEnv,
      NODE_ENV: 'development',
      SUPABASE_URL: 'https://x.supabase.co',
      SUPABASE_ANON_KEY: 'anon-key',
      SUPABASE_SERVICE_KEY: 'svc-key',
      JWT_SECRET: 'this-is-a-32-character-minimum-secret-key',
    };
  });

  it('loads env with required vars', async () => {
    const { loadEnv } = await import('../config/env.js');
    const env = loadEnv();
    expect(env.PORT).toBe(3000);
    expect(env.NODE_ENV).toBe('development');
  });

  it('exits on missing required vars', async () => {
    process.env.SUPABASE_URL = '';
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    const { loadEnv } = await import('../config/env.js');
    loadEnv();
    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
  });
});
