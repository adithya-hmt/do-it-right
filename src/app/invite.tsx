import { router, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { BrandMark } from '@/components/ui/brand-mark';
import { Glyph } from '@/components/ui/glyph';
import { COLORS, GUTTER, RADIUS } from '@/constants/theme';
import { useTasks, type InvitationPreview } from '@/context/task-context';

export default function InviteScreen() {
  const { token, invitation } = useLocalSearchParams<{ token?: string; invitation?: string }>();
  const { session, acceptInvitation, previewInvitation, syncNow } = useTasks();
  const [preview, setPreview] = React.useState<InvitationPreview | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [loadingPreview, setLoadingPreview] = React.useState(Boolean(token && invitation));
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!token || !invitation) {
      return;
    }
    let active = true;
    void previewInvitation(invitation, token).then((result) => {
      if (!active) return;
      setLoadingPreview(false);
      if (result.error) setError(result.error);
      else setPreview(result.data);
    });
    return () => { active = false; };
  }, [invitation, previewInvitation, token]);

  async function accept() {
    if (!token || !invitation) return setError('This invitation link is incomplete.');
    setBusy(true);
    const result = await acceptInvitation(invitation, token);
    setBusy(false);
    if (result.error || !result.spaceId) return setError(result.error ?? 'The space is unavailable.');
    await syncNow();
    router.replace({ pathname: '/space/[id]', params: { id: result.spaceId } });
  }

  function signInToJoin() {
    if (!invitation || !token) return setError('This invitation link is incomplete.');
    router.push({ pathname: '/account', params: { invitation, token } });
  }

  const inviteError = error ?? (session ? 'Sign in with the invited account, then join this space.' : 'Sign in with the invited email. Your personal workspace stays private.');
  return <><Stack.Screen options={{ headerShown: false }} /><View style={{ flex: 1, backgroundColor: COLORS.canvas, padding: GUTTER, alignItems: 'center', justifyContent: 'center' }}><View style={{ width: '100%', maxWidth: 440, gap: 18 }}>
    <View style={{ alignItems: 'center', gap: 10 }}><View style={{ width: 68, height: 68, borderRadius: 23, backgroundColor: preview?.space.color ?? COLORS.primary, alignItems: 'center', justifyContent: 'center' }}><BrandMark size={46} color="#FFFFFF" /></View><Text selectable style={{ color: COLORS.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 }}>SPACE INVITE</Text></View>
    {preview ? <View style={{ borderRadius: RADIUS.large, backgroundColor: preview.space.color, padding: 22, gap: 15 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><View style={{ width: 43, height: 43, borderRadius: 14, backgroundColor: '#FFFFFF33', alignItems: 'center', justifyContent: 'center' }}><Glyph name="people" size={21} color="#FFFFFF" /></View><View style={{ flex: 1, gap: 3 }}><Text selectable style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '900' }}>{preview.space.name}</Text><Text selectable style={{ color: '#FFFFFFCC', fontSize: 12, fontWeight: '700' }}>{preview.space.description || 'Shared work, kept in one calm place.'}</Text></View></View><View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}><View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: preview.inviter.avatarColor, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#FFFFFF', fontWeight: '900' }}>{preview.inviter.displayName.slice(0, 1).toUpperCase()}</Text></View><Text selectable style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '800' }}>Invited by {preview.inviter.displayName} · {preview.role}</Text></View></View> : <View style={{ alignItems: 'center', gap: 10 }}><Text selectable style={{ color: COLORS.ink, fontSize: 27, lineHeight: 32, fontWeight: '900', textAlign: 'center' }}>You were invited to a DIR space.</Text>{loadingPreview ? <ActivityIndicator color={COLORS.primary} /> : null}</View>}
    <Text selectable style={{ color: error ? COLORS.coral : COLORS.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', fontWeight: '600' }}>{inviteError}</Text>
    {session ? <Pressable accessibilityRole="button" disabled={busy || loadingPreview || Boolean(error)} onPress={() => void accept()} style={({ pressed }) => [{ minHeight: 56, borderRadius: RADIUS.medium, backgroundColor: preview?.space.color ?? COLORS.primary, alignItems: 'center', justifyContent: 'center', opacity: busy || loadingPreview || error ? 0.6 : 1 }, pressed && { opacity: 0.78 }]}>{busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '900' }}>Join space</Text>}</Pressable> : <Pressable accessibilityRole="button" disabled={loadingPreview || Boolean(error)} onPress={signInToJoin} style={({ pressed }) => [{ minHeight: 56, borderRadius: RADIUS.medium, backgroundColor: preview?.space.color ?? COLORS.primary, alignItems: 'center', justifyContent: 'center', opacity: loadingPreview || error ? 0.6 : 1 }, pressed && { opacity: 0.78 }]}><Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '900' }}>Sign in to join</Text></Pressable>}
    <Text selectable style={{ color: COLORS.softMuted, fontSize: 11, lineHeight: 17, textAlign: 'center', fontWeight: '600' }}>This invitation expires in 7 days and only adds you after you choose to join.</Text>
  </View></View></>;
}
