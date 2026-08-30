import * as Linking from 'expo-linking';
import { router, Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { BrandMark } from '@/components/ui/brand-mark';
import { COLORS, GUTTER, RADIUS } from '@/constants/theme';
import { useTasks } from '@/context/task-context';

export default function AuthCallbackScreen() {
  const url = Linking.useLinkingURL();
  const { session, completeAuthUrl } = useTasks();
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (session) {
      router.replace('/');
      return;
    }
    if (!url) return;
    void completeAuthUrl(url).then((result) => {
      if (result.error) setError(result.error);
      else router.replace('/');
    });
  }, [completeAuthUrl, session, url]);
  return <><Stack.Screen options={{ headerShown: false }} /><View style={{ flex: 1, backgroundColor: COLORS.canvas, padding: GUTTER, alignItems: 'center', justifyContent: 'center', gap: 18 }}><View style={{ width: 64, height: 64, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}><BrandMark size={44} color={COLORS.onAccent} /></View><Text selectable style={{ color: COLORS.ink, fontSize: 24, fontWeight: '900', textAlign: 'center' }}>{error ? 'Sign-in link stopped' : 'Bringing your workspace with you…'}</Text>{error ? <><Text selectable style={{ color: COLORS.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' }}>{error}</Text><Pressable onPress={() => router.replace('/account')} style={{ minHeight: 50, paddingHorizontal: 20, borderRadius: RADIUS.medium, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: COLORS.onAccent, fontWeight: '900' }}>Try again</Text></Pressable></> : <ActivityIndicator color={COLORS.primary} size="large" />}</View></>;
}
