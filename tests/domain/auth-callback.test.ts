import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { createAuthService, formatAuthError, parseAuthCallback } from '@/lib/auth-service';

describe('Supabase auth callback parsing', () => {
  test('extracts a PKCE code from the DIR deep link', () => {
    expect(parseAuthCallback('doitright://auth/callback?code=abc123')).toEqual({ code: 'abc123' });
  });

  test('extracts legacy token fragments and reports provider errors', () => {
    expect(parseAuthCallback('doitright://auth/callback#access_token=access&refresh_token=refresh')).toEqual({ accessToken: 'access', refreshToken: 'refresh' });
    expect(() => parseAuthCallback('doitright://auth/callback?error_description=Denied')).toThrow('Denied');
  });

  test('shares one PKCE exchange when the same callback is delivered twice', async () => {
    const session = { user: { id: 'user-1' } } as unknown as Session;
    let resolveExchange!: (value: { data: { session: Session }; error: null }) => void;
    const exchange = jest.fn(() => new Promise<{ data: { session: Session }; error: null }>((resolve) => { resolveExchange = resolve; }));
    const client = { auth: { exchangeCodeForSession: exchange } } as unknown as SupabaseClient;
    const service = createAuthService(client);

    const first = service.completeAuthUrl('doitright://auth/callback?code=one');
    const second = service.completeAuthUrl('doitright://auth/callback?code=one');
    resolveExchange({ data: { session }, error: null });

    await expect(Promise.all([first, second])).resolves.toEqual([session, session]);
    expect(exchange).toHaveBeenCalledTimes(1);
  });

  test('maps a disabled OAuth provider to an actionable message', () => {
    expect(formatAuthError(new Error('Unsupported provider: provider is not enabled'), undefined, 'google')).toBe('Google sign-in is not enabled for this Supabase project. Use the email link or enable Google in Supabase Auth.');
    expect(formatAuthError(new Error('Unsupported provider: provider is not enabled'), undefined, 'email')).toBe('Email sign-in is not enabled for this Supabase project. Enable Email in Supabase Auth.');
  });
});
