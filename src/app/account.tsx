import { router, Stack } from 'expo-router';
import React from 'react';
import { Alert, KeyboardAvoidingView, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { BrandMark } from '@/components/ui/brand-mark';
import { Glyph } from '@/components/ui/glyph';
import { COLORS, GUTTER, RADIUS, SHADOW } from '@/constants/theme';
import { useTasks } from '@/context/task-context';

export default function AccountScreen() {
  const { profile, session, linkEmail, signInWithGoogle, signOut, deleteAccount } = useTasks();
  const [email, setEmail] = React.useState(profile.email ?? '');
  const [busy, setBusy] = React.useState(false);

  async function emailSignIn() {
    if (!email.trim().includes('@')) return Alert.alert('Add a valid email', 'DIR will send a one-time sign-in link.');
    setBusy(true);
    const result = await linkEmail(email);
    setBusy(false);
    Alert.alert(result.error ? 'Could not send link' : 'Check your inbox', result.error ?? 'Open the DIR sign-in link on this device. Your local workspace will be claimed after sign-in.');
  }

  async function googleSignIn() {
    setBusy(true);
    const result = await signInWithGoogle();
    setBusy(false);
    if (result.error) Alert.alert('Google sign-in stopped', result.error);
  }

  async function handleSignOut() {
    setBusy(true);
    const result = await signOut();
    setBusy(false);
    if (result.error) return Alert.alert('Could not sign out', result.error);
    router.back();
  }

  function confirmDeleteAccount() {
    Alert.alert('Delete DIR account?', 'This permanently removes your cloud account and shared access. Export first if you need a copy.', [
      { text: 'Keep account', style: 'cancel' },
      { text: 'Delete permanently', style: 'destructive', onPress: () => void (async () => {
        setBusy(true);
        const result = await deleteAccount();
        setBusy(false);
        if (result.error) return Alert.alert('Could not delete account', result.error);
        router.back();
      })() },
    ]);
  }

  return <><Stack.Screen options={{ title: session ? 'Account' : 'Sign in' }} /><KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.canvas }} behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}><ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: GUTTER, paddingBottom: 42, gap: 23 }}><View style={{ gap: 10 }}><View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}><BrandMark size={36} color={COLORS.onAccent} /></View><Text selectable style={{ color: COLORS.ink, fontSize: 30, lineHeight: 35, fontWeight: '900', letterSpacing: -0.9 }}>{session ? 'Your DIR account.' : 'Keep it. Share it.'}</Text><Text selectable style={{ color: COLORS.muted, fontSize: 14, lineHeight: 21, fontWeight: '600' }}>{session ? 'Your private and shared work can now follow you across devices.' : 'Personal work starts locally. Sign in only when you want backup or collaboration.'}</Text></View>{session ? <><View style={{ backgroundColor: COLORS.contrast, borderRadius: RADIUS.large, padding: 18, gap: 13, boxShadow: SHADOW }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><View style={{ width: 44, height: 44, borderRadius: 15, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: COLORS.onAccent, fontWeight: '900', fontSize: 18 }}>{profile.displayName.slice(0, 1).toUpperCase()}</Text></View><View style={{ flex: 1, gap: 3 }}><Text selectable style={{ color: COLORS.contrastText, fontSize: 16, fontWeight: '900' }}>{profile.displayName}</Text><Text selectable style={{ color: COLORS.contrastMuted, fontSize: 12, fontWeight: '600' }}>{session.user.email}</Text></View><Glyph name="check" size={18} color={COLORS.primary} /></View></View><Pressable disabled={busy} onPress={() => void handleSignOut()} style={({ pressed }) => [{ minHeight: 54, borderRadius: RADIUS.medium, borderWidth: 1, borderColor: COLORS.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 }, pressed && { opacity: 0.68 }]}><Glyph name="logout" size={18} color={COLORS.ink} /><Text style={{ color: COLORS.ink, fontWeight: '900' }}>Sign out on this device</Text></Pressable><Pressable disabled={busy} onPress={confirmDeleteAccount} style={({ pressed }) => [{ minHeight: 50, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.65 }]}><Text style={{ color: COLORS.coral, fontSize: 13, fontWeight: '900' }}>Delete cloud account</Text></Pressable></> : <><View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.medium, padding: 16, gap: 10, boxShadow: SHADOW }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Email</Text><TextInput autoCapitalize="none" autoComplete="email" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={COLORS.softMuted} style={{ minHeight: 52, borderBottomWidth: 1, borderBottomColor: email ? COLORS.primary : COLORS.line, color: COLORS.ink, fontSize: 17, fontWeight: '700' }} /><Pressable disabled={busy} onPress={() => void emailSignIn()} style={{ minHeight: 52, borderRadius: RADIUS.medium, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', opacity: busy ? 0.6 : 1 }}><Text style={{ color: COLORS.onAccent, fontSize: 14, fontWeight: '900' }}>Send one-time link</Text></Pressable></View><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><View style={{ height: 1, flex: 1, backgroundColor: COLORS.line }} /><Text style={{ color: COLORS.softMuted, fontSize: 11, fontWeight: '800' }}>OR</Text><View style={{ height: 1, flex: 1, backgroundColor: COLORS.line }} /></View><Pressable disabled={busy} onPress={() => void googleSignIn()} style={({ pressed }) => [{ minHeight: 54, borderRadius: RADIUS.medium, backgroundColor: COLORS.contrast, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: busy ? 0.6 : 1 }, pressed && { opacity: 0.75 }]}><Glyph name="user" size={18} color={COLORS.contrastText} /><Text style={{ color: COLORS.contrastText, fontSize: 14, fontWeight: '900' }}>Continue with Google</Text></Pressable></>}<View style={{ backgroundColor: COLORS.primarySoft, borderRadius: RADIUS.medium, padding: 16, gap: 6 }}><Text style={{ color: COLORS.primary, fontSize: 13, fontWeight: '900' }}>Human-first by design</Text><Text selectable style={{ color: COLORS.muted, fontSize: 12, lineHeight: 18, fontWeight: '600' }}>DIR does not use a generative assistant in this release. Voice capture always shows what it understood before anything is saved.</Text></View></ScrollView></KeyboardAvoidingView></>;
}
