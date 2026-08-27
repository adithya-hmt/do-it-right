import { router, Stack } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Glyph } from '@/components/ui/glyph';
import { COLORS, GUTTER, RADIUS } from '@/constants/theme';
import { useTasks } from '@/context/task-context';

function currentWeekStart() {
  const date = new Date();
  const day = date.getDay();
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  return date.toISOString().slice(0, 10);
}

export default function ReviewScreen() {
  const weekStart = currentWeekStart();
  const { weeklyReviews, saveWeeklyReview } = useTasks();
  const existing = weeklyReviews[weekStart];
  const [wins, setWins] = React.useState(existing?.wins ?? '');
  const [friction, setFriction] = React.useState(existing?.friction ?? '');
  const [nextWeekIntention, setNextWeekIntention] = React.useState(existing?.nextWeekIntention ?? '');

  function save() {
    saveWeeklyReview({ weekStart, wins: wins.trim(), friction: friction.trim(), nextWeekIntention: nextWeekIntention.trim(), completedAt: new Date().toISOString() });
    router.back();
  }

  return <><Stack.Screen options={{ title: 'Weekly review' }} /><ScrollView contentInsetAdjustmentBehavior="automatic" style={{ flex: 1, backgroundColor: COLORS.canvas }} contentContainerStyle={{ padding: GUTTER, paddingTop: 20, paddingBottom: 36, gap: 24 }}><View style={{ gap: 8 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Glyph name="spark" size={16} color={COLORS.primary} /><Text style={{ color: COLORS.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.3 }}>FIVE MINUTES</Text></View><Text selectable style={{ color: COLORS.ink, fontSize: 31, lineHeight: 36, fontWeight: '900', letterSpacing: -0.8 }}>Notice what moved.</Text><Text style={{ color: COLORS.muted, fontSize: 14, lineHeight: 20, fontWeight: '600' }}>Keep the signal. Release the pressure.</Text></View>{[{ label: 'What felt good?', value: wins, setValue: setWins, placeholder: 'A win, a moment, or something you want to remember.' }, { label: 'What created friction?', value: friction, setValue: setFriction, placeholder: 'Name the obstacle without making it your identity.' }, { label: 'What deserves space next week?', value: nextWeekIntention, setValue: setNextWeekIntention, placeholder: 'One clear intention is enough.' }].map((field) => <View key={field.label} style={{ gap: 9 }}><Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '900' }}>{field.label}</Text><TextInput multiline value={field.value} onChangeText={field.setValue} placeholder={field.placeholder} placeholderTextColor={COLORS.softMuted} style={{ minHeight: 112, backgroundColor: COLORS.surface, borderRadius: RADIUS.medium, borderWidth: 1, borderColor: COLORS.line, padding: 16, color: COLORS.ink, fontSize: 15, lineHeight: 21, fontWeight: '600' }} /></View>)}<Pressable onPress={save} style={{ minHeight: 56, borderRadius: RADIUS.medium, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: COLORS.white, fontSize: 15, fontWeight: '900' }}>Save this review</Text></Pressable></ScrollView></>;
}
