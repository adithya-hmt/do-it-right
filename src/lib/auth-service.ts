import type { Session, SupabaseClient } from '@supabase/supabase-js';

export type AuthCallback = { code: string } | { accessToken: string; refreshToken: string };

export function formatAuthError(error: unknown, fallback = 'DIR could not complete sign-in.', provider?: 'email' | 'google') {
  const message = error instanceof Error ? error.message : (typeof error === 'object' && error && 'message' in error ? String(error.message) : String(error ?? ''));
  const normalized = message.toLowerCase();
  if (normalized.includes('unsupported provider') || normalized.includes('provider is not enabled')) {
    if (provider === 'email') return 'Email sign-in is not enabled for this Supabase project. Enable Email in Supabase Auth.';
    if (provider === 'google') return 'Google sign-in is not enabled for this Supabase project. Use the email link or enable Google in Supabase Auth.';
    return 'This sign-in method is not enabled for this Supabase project. Enable it in Supabase Auth.';
  }
  if (normalized.includes('redirect') && (normalized.includes('not allowed') || normalized.includes('whitelist') || normalized.includes('allow list'))) {
    return 'This sign-in link is not allow-listed in Supabase Auth. Add doitright://auth/callback to the redirect URLs.';
  }
  if (normalized.includes('code verifier') || normalized.includes('pkce')) {
    return 'This sign-in session expired. Start sign-in again from DIR on this device.';
  }
  return message || fallback;
}

export function parseAuthCallback(url: string): AuthCallback {
  const parsed = new URL(url);
  const fragment = new URLSearchParams(parsed.hash.replace(/^#/, ''));
  const error = parsed.searchParams.get('error_description') ?? fragment.get('error_description');
  if (error) throw new Error(error);
  const code = parsed.searchParams.get('code');
  if (code) return { code };
  const accessToken = fragment.get('access_token') ?? parsed.searchParams.get('access_token');
  const refreshToken = fragment.get('refresh_token') ?? parsed.searchParams.get('refresh_token');
  if (accessToken && refreshToken) return { accessToken, refreshToken };
  throw new Error('DIR could not read the sign-in response.');
}

export type AuthService = {
  getSession(): Promise<Session | null>;
  observeSession(listener: (session: Session | null) => void): () => void;
  signInWithEmailOtp(email: string, redirectTo: string): Promise<void>;
  signInWithGoogle(redirectTo: string, openAuthSession: (url: string, redirectTo: string) => Promise<string | null>): Promise<Session | null>;
  completeAuthUrl(url: string): Promise<Session | null>;
  signOut(): Promise<void>;
  deleteAccount(): Promise<void>;
};

export function createAuthService(client: SupabaseClient): AuthService {
  let callbackInFlight: { url: string; promise: Promise<Session | null> } | null = null;
  let callbackCompleted: { url: string; session: Session | null } | null = null;

  const completeAuthUrl = (url: string) => {
    if (callbackCompleted?.url === url) return Promise.resolve(callbackCompleted.session);
    if (callbackInFlight?.url === url) return callbackInFlight.promise;

    const request = (async () => {
      const callback = parseAuthCallback(url);
      if ('code' in callback) {
        const { data, error } = await client.auth.exchangeCodeForSession(callback.code);
        if (error) throw error;
        return data.session;
      }
      const { data, error } = await client.auth.setSession({ access_token: callback.accessToken, refresh_token: callback.refreshToken });
      if (error) throw error;
      return data.session;
    })();
    const tracked = request.then(
      (session) => {
        callbackCompleted = { url, session };
        if (callbackInFlight?.url === url) callbackInFlight = null;
        return session;
      },
      (error) => {
        if (callbackInFlight?.url === url) callbackInFlight = null;
        throw error;
      },
    );
    callbackInFlight = { url, promise: tracked };
    return tracked;
  };
  return {
    async getSession() {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      return data.session;
    },
    observeSession(listener) {
      const { data } = client.auth.onAuthStateChange((_event, session) => listener(session));
      return () => data.subscription.unsubscribe();
    },
    async signInWithEmailOtp(email, redirectTo) {
      const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo, shouldCreateUser: true } });
      if (error) throw error;
    },
    async signInWithGoogle(redirectTo, openAuthSession) {
      const { data, error } = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo, skipBrowserRedirect: true } });
      if (error) throw error;
      const callbackUrl = await openAuthSession(data.url, redirectTo);
      return callbackUrl ? completeAuthUrl(callbackUrl) : null;
    },
    completeAuthUrl,
    async signOut() {
      const { error } = await client.auth.signOut({ scope: 'local' });
      if (error) throw error;
    },
    async deleteAccount() {
      const { error } = await client.functions.invoke('delete-account');
      if (error) throw error;
      const { error: signOutError } = await client.auth.signOut({ scope: 'local' });
      if (signOutError) throw signOutError;
    },
  };
}
