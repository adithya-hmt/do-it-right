import { normalizeWebAuthRedirect, resolveWebAuthRedirect } from '@/lib/auth-redirect';

describe('Supabase auth redirect URLs', () => {
  test('normalizes a web origin to the callback route', () => {
    expect(normalizeWebAuthRedirect('https://dir.example/')).toBe('https://dir.example/auth/callback');
  });

  test('accepts the callback route and removes a trailing slash', () => {
    expect(normalizeWebAuthRedirect('https://dir.example/auth/callback/')).toBe('https://dir.example/auth/callback');
  });

  test('rejects native schemes, credentials, query strings, and unrelated paths', () => {
    expect(normalizeWebAuthRedirect('doitright://auth/callback')).toBeNull();
    expect(normalizeWebAuthRedirect('https://user:pass@dir.example/auth/callback')).toBeNull();
    expect(normalizeWebAuthRedirect('https://dir.example/auth/callback?next=/')).toBeNull();
    expect(normalizeWebAuthRedirect('https://dir.example/sign-in')).toBeNull();
  });

  test('prefers an explicit deployed callback and otherwise follows the browser origin', () => {
    expect(resolveWebAuthRedirect('https://app.example/auth/callback', 'http://localhost:8081')).toBe('https://app.example/auth/callback');
    expect(resolveWebAuthRedirect(undefined, 'http://localhost:8081')).toBe('http://localhost:8081/auth/callback');
  });
});
