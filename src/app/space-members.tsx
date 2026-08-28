import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, KeyboardAvoidingView, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Glyph } from '@/components/ui/glyph';
import { SurfaceCard } from '@/components/ui/surface-card';
import { COLORS, GUTTER, RADIUS } from '@/constants/theme';
import { useTasks } from '@/context/task-context';

export default function SpaceMembersScreen() {
  const { spaceId } = useLocalSearchParams<{ spaceId: string }>();
  const { spaces, memberships, session, inviteMember } = useTasks();
  const space = spaces.find((item) => item.id === spaceId);
  const members = memberships.filter((member) => member.spaceId === spaceId && member.status === 'active');
  const currentRole = members.find((member) => member.userId === session?.user.id)?.role;
  const canInvite = currentRole === 'owner' || currentRole === 'admin';
  const [email, setEmail] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  async function invite() {
    if (!email.includes('@')) return;
    setBusy(true);
    const result = await inviteMember(spaceId, email);
    setBusy(false);
    if (result.error) return Alert.alert('Invitation not sent', result.error);
    setEmail('');
    Alert.alert('Invitation sent', 'They can join this space after signing in to DIR.');
  }
  return <><Stack.Screen options={{ title: 'People' }} /><KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.canvas }} behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}><ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: GUTTER, paddingBottom: 44, gap: 22 }}><View style={{ gap: 6 }}><Text selectable style={{ color: COLORS.ink, fontSize: 28, fontWeight: '900', letterSpacing: -0.7 }}>{space?.name ?? 'Space'} people</Text><Text selectable style={{ color: COLORS.muted, fontSize: 13, lineHeight: 19, fontWeight: '600' }}>Members can work on shared tasks. Owners and admins can invite people.</Text></View><SurfaceCard style={{ paddingHorizontal: 15 }}>{members.map((member) => <View key={member.id} style={{ minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: COLORS.line }}><View style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: member.avatarColor, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#FFFFFF', fontWeight: '900' }}>{member.displayName.slice(0, 1).toUpperCase()}</Text></View><View style={{ flex: 1, gap: 3 }}><Text selectable style={{ color: COLORS.ink, fontSize: 14, fontWeight: '900' }}>{member.displayName}</Text><Text selectable style={{ color: COLORS.muted, fontSize: 11, fontWeight: '700' }}>{member.email ?? 'DIR member'}</Text></View><Text style={{ color: COLORS.primary, fontSize: 11, fontWeight: '900', textTransform: 'capitalize' }}>{member.role}</Text></View>)}</SurfaceCard>{canInvite ? <View style={{ gap: 10 }}><Text style={{ color: COLORS.ink, fontSize: 16, fontWeight: '900' }}>Invite someone</Text><TextInput autoCapitalize="none" autoComplete="email" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="person@example.com" placeholderTextColor={COLORS.softMuted} style={{ minHeight: 54, borderRadius: RADIUS.medium, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: email ? COLORS.primary : COLORS.line, paddingHorizontal: 15, color: COLORS.ink, fontSize: 15, fontWeight: '700' }} /><Pressable disabled={busy || !email.includes('@')} onPress={() => void invite()} style={({ pressed }) => [{ minHeight: 52, borderRadius: RADIUS.medium, backgroundColor: email.includes('@') ? COLORS.primary : COLORS.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, opacity: busy ? 0.6 : 1 }, pressed && { opacity: 0.72 }]}><Glyph name="send" size={17} color={email.includes('@') ? COLORS.onAccent : COLORS.muted} /><Text style={{ color: email.includes('@') ? COLORS.onAccent : COLORS.muted, fontWeight: '900' }}>{busy ? 'Sending…' : 'Send invitation'}</Text></Pressable></View> : <View style={{ backgroundColor: COLORS.primarySoft, borderRadius: RADIUS.medium, padding: 16 }}><Text selectable style={{ color: COLORS.muted, fontSize: 12, lineHeight: 18, fontWeight: '600' }}>Ask a space owner or admin to invite another person.</Text></View>}</ScrollView></KeyboardAvoidingView></>;
}
