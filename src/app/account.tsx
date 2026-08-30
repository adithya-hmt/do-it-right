import { router, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { BrandLockup } from '@/components/ui/brand-lockup';
import { Glyph } from '@/components/ui/glyph';
import { COLORS, FONTS, GUTTER, RADIUS, SHADOW } from '@/constants/theme';
import { useTasks } from '@/context/task-context';
import { setPendingAuthNext } from '@/lib/auth-redirect';

export default function AccountScreen() {
  const { profile, session, linkEmail, verifyEmailOtp, signInWithGoogle, signOut, deleteAccount } = useTasks();
  const { invitation, token } = useLocalSearchParams<{ invitation?: string; token?: string }>();
  const inviteParams = typeof invitation === 'string' && typeof token === 'string' ? { invitation, token } : null;
  const { width } = useWindowDimensions();
  const desktop = process.env.EXPO_OS === 'web' && width >= 860;
  const [email, setEmail] = React.useState(profile.email ?? '');
  const [code, setCode] = React.useState('');
  const [emailStep, setEmailStep] = React.useState<'email' | 'code'>('email');
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  function finishSignIn() {
    if (inviteParams) {
      router.replace({ pathname: '/invite', params: inviteParams });
      return;
    }
    router.replace('/');
  }

  React.useEffect(() => {
    if (session && invitation && token) {
      router.replace({ pathname: '/invite', params: { invitation, token } });
    }
  }, [session, invitation, token]);

  async function emailSignIn() {
    const normalizedEmail = email.trim().toLowerCase();
    setError(null);
    if (!normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
      setError('Enter a valid email address so DIR knows where to send the link.');
      return;
    }
    setBusy(true);
    const next = inviteParams ? `/invite?invitation=${encodeURIComponent(inviteParams.invitation)}&token=${encodeURIComponent(inviteParams.token)}` : undefined;
    setPendingAuthNext(next);
    const result = await linkEmail(normalizedEmail, next);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setEmail(normalizedEmail);
    setEmailStep('code');
    setMessage('Check your inbox. Tap the link, or enter the six-digit code if your email includes one.');
  }

  async function verifyCode() {
    setError(null);
    if (!/^\d{6}$/.test(code.trim())) {
      setError('Enter the six-digit code from your email.');
      return;
    }
    setBusy(true);
    const result = await verifyEmailOtp(email, code);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    finishSignIn();
  }

  async function googleSignIn() {
    setError(null);
    setBusy(true);
    const next = inviteParams ? `/invite?invitation=${encodeURIComponent(inviteParams.invitation)}&token=${encodeURIComponent(inviteParams.token)}` : undefined;
    setPendingAuthNext(next);
    const result = await signInWithGoogle(next);
    setBusy(false);
    if (result.error) setError(result.error);
  }

  async function handleSignOut() {
    setBusy(true);
    const result = await signOut();
    setBusy(false);
    if (result.error) return setError(result.error);
    router.replace('/');
  }

  function confirmDeleteAccount() {
    Alert.alert('Delete DIR account?', 'This permanently removes your cloud account and shared access. Export first if you need a copy.', [
      { text: 'Keep account', style: 'cancel' },
      { text: 'Delete permanently', style: 'destructive', onPress: () => void (async () => {
        setBusy(true);
        const result = await deleteAccount();
        setBusy(false);
        if (result.error) return setError(result.error);
        router.replace('/');
      })() },
    ]);
  }

  const initials = (profile.displayName.trim().slice(0, 1) || 'D').toUpperCase();

  return <>
    <Stack.Screen options={{ title: session ? 'Account' : 'Sign in' }} />
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.canvas }} behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, padding: desktop ? 34 : GUTTER, paddingBottom: 42 }}>
        <View style={{ width: '100%', maxWidth: 1040, alignSelf: 'center', flex: desktop ? 1 : undefined, flexDirection: desktop ? 'row' : 'column', justifyContent: 'center', gap: desktop ? 22 : 23 }}>
          <View style={{ flex: desktop ? 1 : undefined, minHeight: desktop ? 560 : 270, borderRadius: RADIUS.large, padding: desktop ? 30 : 23, backgroundColor: COLORS.contrast, justifyContent: 'space-between', gap: 30, boxShadow: SHADOW }}>
            <View style={{ gap: 27 }}>
              <BrandLockup size={26} inverse />
              <View style={{ gap: 12 }}>
                <Text selectable style={{ color: COLORS.contrastText, fontSize: desktop ? 34 : 28, lineHeight: desktop ? 39 : 34, fontWeight: '900', letterSpacing: -1 }}>A quieter way to return to what matters.</Text>
                <Text selectable style={{ color: COLORS.contrastMuted, fontSize: 14, lineHeight: 21, fontWeight: '600' }}>Keep the workspace local. Add an account when your work needs to travel, sync, or become shared.</Text>
              </View>
            </View>
            <View style={{ gap: 14 }}>
              {[['check', 'Fast capture, calm review'], ['cloud', 'Private backup across devices'], ['people', 'Shared work by invitation']].map(([icon, label]) => <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}><View style={{ width: 26, height: 26, borderRadius: 9, backgroundColor: COLORS.contrastSurface, alignItems: 'center', justifyContent: 'center' }}><Glyph name={icon as 'check'} size={14} color={COLORS.primary} /></View><Text style={{ color: COLORS.contrastMuted, fontFamily: FONTS.mono, fontSize: 11, fontWeight: '800' }}>{label}</Text></View>)}
            </View>
          </View>

          <View style={{ flex: desktop ? 1 : undefined, justifyContent: 'center', gap: 22, paddingVertical: desktop ? 22 : 0 }}>
            <View style={{ gap: 8 }}>
              <Text selectable style={{ color: COLORS.ink, fontSize: desktop ? 32 : 29, lineHeight: 36, fontWeight: '900', letterSpacing: -0.9 }}>{session ? 'Your workspace is connected.' : 'Keep your workspace close.'}</Text>
              <Text selectable style={{ color: COLORS.muted, fontSize: 14, lineHeight: 21, fontWeight: '600' }}>{session ? 'Your private and shared work can now follow you across devices.' : 'Use an email link or a six-digit code. There is no password to remember.'}</Text>
            </View>

            {session ? <View style={{ gap: 14 }}>
              <View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.medium, padding: 18, gap: 16, boxShadow: SHADOW }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: COLORS.onAccent, fontWeight: '900', fontSize: 19 }}>{initials}</Text></View>
                  <View style={{ flex: 1, gap: 3 }}><Text selectable style={{ color: COLORS.ink, fontSize: 16, fontWeight: '900' }}>{profile.displayName}</Text><Text selectable style={{ color: COLORS.muted, fontSize: 12, fontWeight: '600' }}>{session.user.email}</Text></View>
                  <Glyph name="check" size={18} color={COLORS.success} />
                </View>
                <View style={{ backgroundColor: COLORS.primarySoft, borderRadius: RADIUS.small, padding: 12, gap: 3 }}><Text style={{ color: COLORS.primary, fontFamily: FONTS.mono, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 }}>SYNC READY</Text><Text style={{ color: COLORS.muted, fontSize: 12, lineHeight: 18, fontWeight: '600' }}>New work is saved locally first, then backed up when DIR can reach the cloud.</Text></View>
              </View>
              <Pressable accessibilityRole="button" disabled={busy} onPress={() => void handleSignOut()} style={({ pressed }) => [{ minHeight: 54, borderRadius: RADIUS.medium, borderWidth: 1, borderColor: COLORS.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, opacity: busy ? 0.6 : 1 }, pressed && { opacity: 0.7 }]}><Glyph name="logout" size={18} color={COLORS.ink} /><Text style={{ color: COLORS.ink, fontWeight: '900' }}>{busy ? 'Signing out…' : 'Sign out on this device'}</Text></Pressable>
              <Pressable accessibilityRole="button" disabled={busy} onPress={confirmDeleteAccount} style={({ pressed }) => [{ minHeight: 48, alignItems: 'center', justifyContent: 'center', opacity: busy ? 0.6 : 1 }, pressed && { opacity: 0.65 }]}><Text style={{ color: COLORS.coral, fontSize: 13, fontWeight: '900' }}>Delete cloud account</Text></Pressable>
            </View> : <View style={{ gap: 14 }}>
              {message ? <View style={{ backgroundColor: COLORS.primarySoft, borderRadius: RADIUS.small, padding: 13, gap: 4 }}><Text style={{ color: COLORS.primary, fontFamily: FONTS.mono, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 }}>CHECK YOUR INBOX</Text><Text selectable style={{ color: COLORS.muted, fontSize: 12, lineHeight: 18, fontWeight: '600' }}>{message}</Text></View> : null}
              {error ? <View accessibilityRole="alert" style={{ backgroundColor: COLORS.coralSoft, borderRadius: RADIUS.small, padding: 13 }}><Text selectable style={{ color: COLORS.coral, fontSize: 13, lineHeight: 19, fontWeight: '700' }}>{error}</Text></View> : null}
              {emailStep === 'email' ? <View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.medium, padding: 17, gap: 11, boxShadow: SHADOW }}>
                <Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Email address</Text>
                <TextInput accessibilityLabel="Email address" autoCapitalize="none" autoComplete="email" keyboardType="email-address" value={email} onChangeText={setEmail} onSubmitEditing={() => void emailSignIn()} placeholder="you@example.com" placeholderTextColor={COLORS.softMuted} style={{ minHeight: 52, borderBottomWidth: 1, borderBottomColor: email ? COLORS.primary : COLORS.line, color: COLORS.ink, fontSize: 16, fontWeight: '700' }} />
                <Pressable accessibilityRole="button" disabled={busy} onPress={() => void emailSignIn()} style={({ pressed }) => [{ minHeight: 54, borderRadius: RADIUS.medium, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', opacity: busy ? 0.65 : 1 }, pressed && { opacity: 0.8 }]}>{busy ? <ActivityIndicator color={COLORS.onAccent} /> : <Text style={{ color: COLORS.onAccent, fontSize: 14, fontWeight: '900' }}>Send sign-in link</Text>}</Pressable>
              </View> : <View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.medium, padding: 17, gap: 11, boxShadow: SHADOW }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Six-digit code</Text><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '700' }}>{email}</Text></View>
                <TextInput accessibilityLabel="Six-digit email code" autoCapitalize="none" autoComplete="one-time-code" keyboardType="number-pad" maxLength={6} value={code} onChangeText={setCode} onSubmitEditing={() => void verifyCode()} placeholder="000000" placeholderTextColor={COLORS.softMuted} style={{ minHeight: 58, borderWidth: 1, borderColor: code ? COLORS.primary : COLORS.line, borderRadius: RADIUS.small, paddingHorizontal: 15, color: COLORS.ink, fontFamily: FONTS.mono, fontSize: 25, fontWeight: '900', letterSpacing: 6, textAlign: 'center' }} />
                <Pressable accessibilityRole="button" disabled={busy} onPress={() => void verifyCode()} style={({ pressed }) => [{ minHeight: 54, borderRadius: RADIUS.medium, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', opacity: busy ? 0.65 : 1 }, pressed && { opacity: 0.8 }]}>{busy ? <ActivityIndicator color={COLORS.onAccent} /> : <Text style={{ color: COLORS.onAccent, fontSize: 14, fontWeight: '900' }}>Verify code</Text>}</Pressable>
                <Pressable accessibilityRole="button" disabled={busy} onPress={() => { setEmailStep('email'); setMessage(null); setError(null); }} style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: COLORS.primary, fontSize: 13, fontWeight: '900' }}>Use a different email</Text></Pressable>
              </View>}
              {emailStep === 'email' ? <><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><View style={{ height: 1, flex: 1, backgroundColor: COLORS.line }} /><Text style={{ color: COLORS.softMuted, fontFamily: FONTS.mono, fontSize: 10, fontWeight: '900' }}>OR</Text><View style={{ height: 1, flex: 1, backgroundColor: COLORS.line }} /></View><Pressable accessibilityRole="button" disabled={busy} onPress={() => void googleSignIn()} style={({ pressed }) => [{ minHeight: 54, borderRadius: RADIUS.medium, backgroundColor: COLORS.contrast, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: busy ? 0.65 : 1 }, pressed && { opacity: 0.78 }]}><Glyph name="user" size={18} color={COLORS.contrastText} /><Text style={{ color: COLORS.contrastText, fontSize: 14, fontWeight: '900' }}>Continue with Google</Text></Pressable></> : null}
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 3 }}><Glyph name="link" size={14} color={COLORS.muted} /><Text selectable style={{ flex: 1, color: COLORS.muted, fontSize: 11, lineHeight: 17, fontWeight: '600' }}>Your workspace stays usable without an account. Sign in only when you want backup or collaboration.</Text></View>
            </View>}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </>;
}
