import * as Linking from 'expo-linking';
import { router, Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { BrandMark } from '@/components/ui/brand-mark';
import { COLORS, GUTTER, RADIUS } from '@/constants/theme';
import { useTasks } from '@/context/task-context';
import { consumePendingAuthNext } from '@/lib/auth-redirect';

function returnFromAuth(url: string | null) {
  if (url) {
    try {
      const next = new URL(url).searchParams.get('next') ?? consumePendingAuthNext();
      if (next) {
        const destination = new URL(next, 'https://dir.local');
        if (destination.pathname === '/invite') {
          const invitation = destination.searchParams.get('invitation');
          const token = destination.searchParams.get('token');
          if (invitation && token) {
            router.replace({ pathname: '/invite', params: { invitation, token } });
            return;
          }
        }
      }
    } catch {
      // Fall through to the workspace if the optional return target is malformed.
    }
  }
  router.replace('/');
}

export default function AuthCallbackScreen() {
  const linkingUrl = Linking.useLinkingURL();
  const url = process.env.EXPO_OS === 'web' && typeof window !== 'undefined' ? window.location.href : linkingUrl;
  const { session, completeAuthUrl } = useTasks();
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (session) {
      returnFromAuth(url);
      return;
    }
    if (!url || !url.includes('/auth/callback')) return;
    void completeAuthUrl(url).then((result) => {
      if (result.error) setError(result.error);
      else returnFromAuth(url);
    });
  }, [completeAuthUrl, session, url]);
  return <><Stack.Screen options={{ headerShown: false }} /><View style={{ flex: 1, backgroundColor: COLORS.canvas, padding: GUTTER, alignItems: 'center', justifyContent: 'center' }}><View style={{ width: '100%', maxWidth: 460, gap: 18, alignItems: 'center' }}><View style={{ width: 68, height: 68, borderRadius: 24, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}><BrandMark size={46} color={COLORS.onAccent} /></View><Text selectable style={{ color: COLORS.ink, fontSize: 25, lineHeight: 31, fontWeight: '900', textAlign: 'center' }}>{error ? 'Sign-in link stopped' : 'Bringing your workspace with you…'}</Text>{error ? <><Text selectable style={{ color: COLORS.muted, fontSize: 14, lineHeight: 21, textAlign: 'center' }}>{error}</Text><Pressable accessibilityRole="button" onPress={() => router.replace('/account')} style={({ pressed }) => [{ minHeight: 52, paddingHorizontal: 22, borderRadius: RADIUS.medium, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.78 }]}><Text style={{ color: COLORS.onAccent, fontWeight: '900' }}>Back to sign in</Text></Pressable></> : <><ActivityIndicator color={COLORS.primary} size="large" /><Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: '700' }}>Verifying your sign-in…</Text></>}</View></View></>;
}
