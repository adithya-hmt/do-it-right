import { router, Stack } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Glyph } from '@/components/ui/glyph';
import { COLORS, GUTTER, RADIUS } from '@/constants/theme';
import { useTasks } from '@/context/task-context';

const INTENTS = [
  'Make space for meaningful work',
  'Clear the mental noise',
  'Build a steadier week',
];

export default function OnboardingScreen() {
  const { profile, updateProfile, finishOnboarding } = useTasks();
  const [step, setStep] = React.useState(0);
  const [name, setName] = React.useState(profile.displayName === 'Alex' ? '' : profile.displayName);
  const [intent, setIntent] = React.useState(profile.focusIntent);
  const [morningTime, setMorningTime] = React.useState(profile.morningTime);

  React.useEffect(() => {
    if (profile.onboardingComplete) router.replace('/');
  }, [profile.onboardingComplete]);

  function next() {
    if (step < 2) {
      setStep((current) => current + 1);
      return;
    }
    updateProfile({ displayName: name.trim() || 'Friend', focusIntent: intent, morningTime });
    finishOnboarding();
    router.replace('/');
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Welcome', headerShown: false }} />
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.canvas }} behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ flexGrow: 1, padding: GUTTER, paddingTop: 64, paddingBottom: 32, justifyContent: 'space-between', gap: 48 }}>
          <View style={{ gap: 28 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}><Glyph name="check" size={20} color={COLORS.white} /></View>
              <Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900', letterSpacing: 1.5 }}>FOCUSFLOW</Text>
            </View>
            <View style={{ gap: 12 }}>
              <Text selectable style={{ color: COLORS.ink, fontSize: 38, lineHeight: 42, fontWeight: '900', letterSpacing: -1.5 }}>{step === 0 ? 'A little more room\nfor what matters.' : step === 1 ? 'What do you want\nmore space for?' : 'Give your day\na gentle shape.'}</Text>
              <Text style={{ color: COLORS.muted, fontSize: 15, lineHeight: 22, fontWeight: '600' }}>{step === 0 ? 'FocusFlow starts locally. Your tasks stay on this device, and no account is required.' : step === 1 ? 'This helps the app keep your plan human when the week gets noisy.' : 'Choose a starting point. Optional account linking stays in Settings.'}</Text>
            </View>

            {step === 0 ? (
              <View style={{ gap: 10 }}>
                <Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>What should we call you?</Text>
                <TextInput autoFocus value={name} onChangeText={setName} placeholder="Your first name" placeholderTextColor={COLORS.softMuted} returnKeyType="next" onSubmitEditing={next} style={{ minHeight: 58, backgroundColor: COLORS.surface, borderRadius: RADIUS.medium, borderWidth: 1, borderColor: name.length ? COLORS.primary : COLORS.line, paddingHorizontal: 17, color: COLORS.ink, fontSize: 18, fontWeight: '700' }} />
              </View>
            ) : null}

            {step === 1 ? <View style={{ gap: 10 }}>{INTENTS.map((item) => { const active = intent === item; return <Pressable key={item} onPress={() => setIntent(item)} style={{ minHeight: 58, borderRadius: RADIUS.medium, backgroundColor: active ? COLORS.primarySoft : COLORS.surface, borderWidth: 1, borderColor: active ? COLORS.primary : COLORS.line, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', gap: 13 }}><View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: active ? COLORS.primary : COLORS.softMuted, backgroundColor: active ? COLORS.primary : COLORS.surface, alignItems: 'center', justifyContent: 'center' }}>{active ? <Glyph name="check" size={14} color={COLORS.white} /> : null}</View><Text style={{ color: active ? COLORS.primary : COLORS.ink, fontSize: 15, fontWeight: '800' }}>{item}</Text></Pressable>; })}</View> : null}

            {step === 2 ? <View style={{ gap: 20 }}><View style={{ gap: 10 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Morning plan</Text><View style={{ flexDirection: 'row', gap: 9 }}>{['07:30', '08:00', '09:00'].map((item) => { const active = morningTime === item; return <Pressable key={item} onPress={() => setMorningTime(item)} style={{ flex: 1, minHeight: 50, borderRadius: RADIUS.medium, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? COLORS.contrast : COLORS.surface, borderWidth: active ? 0 : 1, borderColor: COLORS.line }}><Text style={{ color: active ? COLORS.contrastText : COLORS.muted, fontSize: 14, fontWeight: '800' }}>{item}</Text></Pressable>; })}</View></View><View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.medium, padding: 18, gap: 10 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}><Glyph name="spark" size={16} color={COLORS.primary} /><Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '900' }}>Start small</Text></View><Text style={{ color: COLORS.muted, fontSize: 13, lineHeight: 19, fontWeight: '600' }}>You can skip calendar and notifications for now. The core plan works without either.</Text></View></View> : null}
          </View>

          <View style={{ gap: 17 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>{[0, 1, 2].map((item) => <View key={item} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: item <= step ? COLORS.primary : COLORS.line }} />)}</View>
            <Pressable onPress={next} style={{ minHeight: 58, borderRadius: RADIUS.medium, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 }}><Text style={{ color: COLORS.white, fontSize: 15, fontWeight: '900' }}>{step === 2 ? 'Start locally' : 'Continue'}</Text><Glyph name="arrow" size={18} color={COLORS.white} /></Pressable>
            {step > 0 ? <Pressable onPress={() => setStep((current) => current - 1)} style={{ alignItems: 'center', padding: 7 }}><Text style={{ color: COLORS.muted, fontSize: 13, fontWeight: '800' }}>Back</Text></Pressable> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
