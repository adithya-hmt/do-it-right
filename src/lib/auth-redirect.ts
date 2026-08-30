import { Platform } from 'react-native';

export const NATIVE_AUTH_REDIRECT_URL = 'doitright://auth/callback';
export const AUTH_CALLBACK_PATH = '/auth/callback';

function callbackUrlFromOrigin(origin: string | undefined) {
  if (!origin) return 'http://localhost:8081/auth/callback';
  try {
    const url = new URL(origin);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return 'http://localhost:8081/auth/callback';
    return `${url.origin}${AUTH_CALLBACK_PATH}`;
  } catch {
    return 'http://localhost:8081/auth/callback';
  }
}

export function resolveWebAuthRedirect(configured: string | undefined, origin: string | undefined) {
  return normalizeWebAuthRedirect(configured) ?? callbackUrlFromOrigin(origin);
}

export function normalizeWebAuthRedirect(value: string | undefined) {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (url.username || url.password || url.search || url.hash) return null;
    const path = url.pathname === '/' ? AUTH_CALLBACK_PATH : url.pathname.replace(/\/$/, '');
    if (!path.endsWith(AUTH_CALLBACK_PATH)) return null;
    return `${url.origin}${path}`;
  } catch {
    return null;
  }
}

export function getAuthRedirectUrl() {
  if (Platform.OS !== 'web') return NATIVE_AUTH_REDIRECT_URL;
  const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
  return resolveWebAuthRedirect(process.env.EXPO_PUBLIC_WEB_AUTH_REDIRECT_URL, origin);
}
