import { parseAuthCallback } from '@/lib/auth-service';

describe('Supabase auth callback parsing', () => {
  test('extracts a PKCE code from the DIR deep link', () => {
    expect(parseAuthCallback('doitright://auth/callback?code=abc123')).toEqual({ code: 'abc123' });
  });

  test('extracts legacy token fragments and reports provider errors', () => {
    expect(parseAuthCallback('doitright://auth/callback#access_token=access&refresh_token=refresh')).toEqual({ accessToken: 'access', refreshToken: 'refresh' });
    expect(() => parseAuthCallback('doitright://auth/callback?error_description=Denied')).toThrow('Denied');
  });
});
