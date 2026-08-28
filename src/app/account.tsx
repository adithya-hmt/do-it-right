import { router, Stack } from 'expo-router';
import React from 'react';
import { Alert, KeyboardAvoidingView, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Glyph } from '@/components/ui/glyph';
import { COLORS, GUTTER, RADIUS, SHADOW } from '@/constants/theme';
import { useTasks } from '@/context/task-context';

export default function AccountScreen() {
  const { profile, linkEmail } = useTasks();
  const [email, setEmail] = React.useState(profile.email ?? '');
  const [saving, setSaving] = React.useState(false);

  async function save() {
    const value = email.trim();
    if (!value || !value.includes('@')) {
      Alert.alert('Add a valid email', 'We’ll send a confirmation link to this address.');
      return;
    }
    setSaving(true);
    const result = await linkEmail(value);
    setSaving(false);
    if (result.error) {
      Alert.alert('Could not link email', result.error);
      return;
    }
    Alert.alert('Check your inbox', 'Your workspace is still available here. Confirm the email to keep it across devices.');
  }

  return <><Stack.Screen options={{ title: 'Keep your workspace' }} /><KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.canvas }} behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}><ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: GUTTER, paddingTop: 22, paddingBottom: 40, gap: 24 }}><View style={{ gap: 9 }}><View style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Glyph name="link" size={19} color={COLORS.primary} /></View><Text selectable style={{ color: COLORS.ink, fontSize: 31, lineHeight: 36, fontWeight: '900', letterSpacing: -0.8 }}>Keep it with you.</Text><Text style={{ color: COLORS.muted, fontSize: 14, lineHeight: 21, fontWeight: '600' }}>You started privately and anonymously. Link an email when you want your workspace on another device.</Text></View><View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.medium, padding: 17, gap: 9, boxShadow: SHADOW }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Your email</Text><TextInput autoCapitalize="none" autoComplete="email" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={COLORS.softMuted} style={{ minHeight: 52, borderBottomWidth: 1, borderBottomColor: email ? COLORS.primary : COLORS.line, color: COLORS.ink, fontSize: 17, fontWeight: '700' }} /><Text style={{ color: COLORS.muted, fontSize: 12, lineHeight: 18, fontWeight: '600' }}>Supabase sends a confirmation link. No password is stored in this app.</Text></View><Pressable disabled={saving} onPress={() => void save()} style={{ minHeight: 56, borderRadius: RADIUS.medium, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', opacity: saving ? 0.6 : 1 }}><Text style={{ color: COLORS.white, fontSize: 15, fontWeight: '900' }}>{saving ? 'Sending…' : 'Send confirmation link'}</Text></Pressable><View style={{ backgroundColor: COLORS.lavender, borderRadius: RADIUS.medium, padding: 17, gap: 8 }}><Text style={{ color: COLORS.lavenderInk, fontSize: 13, fontWeight: '900' }}>Private by default</Text><Text style={{ color: COLORS.ink, fontSize: 13, lineHeight: 19, fontWeight: '600' }}>Your profile is not public and there are no social features. Linking only protects your own workspace.</Text></View><Pressable onPress={() => router.back()} style={{ alignItems: 'center', padding: 8 }}><Text style={{ color: COLORS.muted, fontSize: 13, fontWeight: '800' }}>Not now</Text></Pressable></ScrollView></KeyboardAvoidingView></>;
}
