import { router, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { BrandMark } from '@/components/ui/brand-mark';
import { COLORS, GUTTER, RADIUS } from '@/constants/theme';
import { useTasks } from '@/context/task-context';

export default function InviteScreen() {
  const { token, invitation } = useLocalSearchParams<{ token?: string; invitation?: string }>();
  const { session, acceptInvitation, syncNow } = useTasks();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  async function accept() {
    if (!token || !invitation) return setError('This invitation link is incomplete.');
    setBusy(true);
    const result = await acceptInvitation(invitation, token);
    setBusy(false);
    if (result.error || !result.spaceId) return setError(result.error ?? 'The space is unavailable.');
    await syncNow();
    router.replace({ pathname: '/space/[id]', params: { id: result.spaceId } });
  }
  return <><Stack.Screen options={{ headerShown: false }} /><View style={{ flex: 1, backgroundColor: COLORS.canvas, padding: GUTTER, alignItems: 'center', justifyContent: 'center', gap: 18 }}><View style={{ width: 68, height: 68, borderRadius: 23, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}><BrandMark size={46} color={COLORS.onAccent} /></View><Text selectable style={{ color: COLORS.ink, fontSize: 27, fontWeight: '900', textAlign: 'center' }}>You were invited to a DIR space.</Text><Text selectable style={{ color: COLORS.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' }}>{error ?? (session ? 'Join with the signed-in account that received the invitation.' : 'Sign in with the invited email. Your personal workspace stays private.')}</Text>{session ? <Pressable disabled={busy} onPress={() => void accept()} style={{ minHeight: 52, minWidth: 180, borderRadius: RADIUS.medium, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', opacity: busy ? 0.6 : 1 }}>{busy ? <ActivityIndicator color={COLORS.onAccent} /> : <Text style={{ color: COLORS.onAccent, fontWeight: '900' }}>Join space</Text>}</Pressable> : <Pressable onPress={() => router.push('/account')} style={{ minHeight: 52, minWidth: 180, borderRadius: RADIUS.medium, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: COLORS.onAccent, fontWeight: '900' }}>Sign in to join</Text></Pressable>}</View></>;
}
