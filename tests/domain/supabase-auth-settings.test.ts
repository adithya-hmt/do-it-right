import { getSupabaseAuthSettings, parseSupabaseAuthSettings } from '@/lib/supabase-auth-settings';

describe('Supabase auth provider settings', () => {
  afterEach(() => {
    delete process.env.EXPO_PUBLIC_SUPABASE_EMAIL_ENABLED;
    delete process.env.EXPO_PUBLIC_SUPABASE_GOOGLE_ENABLED;
  });

  test('reads only enabled email and Google providers from Auth settings', () => {
    expect(parseSupabaseAuthSettings({ external: { email: true, google: false, github: true } })).toEqual({ email: true, google: false });
    expect(parseSupabaseAuthSettings({ external: { email: 'true', google: 1 } })).toBeNull();
  });

  test('returns null when Supabase settings are unavailable', () => {
    expect(parseSupabaseAuthSettings(null)).toBeNull();
    expect(parseSupabaseAuthSettings({})).toBeNull();
  });

  test('honors explicit provider overrides without opening a network request', async () => {
    process.env.EXPO_PUBLIC_SUPABASE_GOOGLE_ENABLED = 'false';
    const fetchSpy = jest.spyOn(globalThis, 'fetch');

    await expect(getSupabaseAuthSettings()).resolves.toEqual({ email: true, google: false });
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
