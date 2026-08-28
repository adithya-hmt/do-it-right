import { router, Stack } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';

import { Glyph } from '@/components/ui/glyph';
import { COLORS, GUTTER, RADIUS, SHADOW } from '@/constants/theme';
import { useTasks } from '@/context/task-context';
import { requestCalendarAccess } from '@/platform/calendar';
import { requestReminderAccess, scheduleAnchorReminders } from '@/platform/reminders';

const THEMES = ['system', 'light', 'dark'] as const;
const PALETTES = [
  { id: 'warm', label: 'Warm', color: '#C44F2B' },
  { id: 'forest', label: 'Forest', color: '#3F7352' },
  { id: 'ocean', label: 'Ocean', color: '#1976D2' },
  { id: 'berry', label: 'Berry', color: '#9C3F67' },
  { id: 'gold', label: 'Gold', color: '#8A6416' },
] as const;

export default function SettingsScreen() {
  const { profile, updateProfile, syncStatus, syncNow, exportData } = useTasks();
  const [name, setName] = React.useState(profile.displayName);
  const [customAccent, setCustomAccent] = React.useState(profile.appearance.customAccent ?? '#C44F2B');
  const [busy, setBusy] = React.useState(false);

  function saveName() {
    if (name.trim()) updateProfile({ displayName: name.trim() });
  }

  async function connectCalendar() {
    setBusy(true);
    const granted = await requestCalendarAccess();
    setBusy(false);
    Alert.alert(granted ? 'Calendar connected' : 'Calendar not connected', granted ? 'DIR will only read today’s commitments to give your plan useful context.' : 'Calendar access is unavailable or was declined. Your planning still works without it.');
  }

  async function enableReminders() {
    setBusy(true);
    const granted = await requestReminderAccess();
    const scheduled = granted && await scheduleAnchorReminders(profile.morningTime, profile.eveningTime);
    setBusy(false);
    Alert.alert(scheduled ? 'Anchors are on' : 'Reminders not enabled', scheduled ? `You’ll get a morning plan at ${profile.morningTime} and an evening reset at ${profile.eveningTime}.` : 'Notifications are unavailable or were declined.');
  }

  async function handleExport() {
    setBusy(true);
    const exported = await exportData();
    setBusy(false);
    Alert.alert(exported ? 'Export ready' : 'Export unavailable', exported ? 'Your workspace is ready to save or share.' : 'The system share sheet is unavailable here.');
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <View style={{ flex: 1, backgroundColor: COLORS.canvas }}><ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 20, paddingBottom: 42, gap: 25 }}>
        <View style={{ gap: 6 }}><Text selectable style={{ color: COLORS.ink, fontSize: 30, lineHeight: 35, fontWeight: '900', letterSpacing: -0.8 }}>Make DIR yours.</Text><Text style={{ color: COLORS.muted, fontSize: 14, lineHeight: 20, fontWeight: '600' }}>Choose the energy that makes it easiest to come back.</Text></View>

        <View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.medium, padding: 17, gap: 10, boxShadow: SHADOW }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Profile name</Text><TextInput value={name} onChangeText={setName} onBlur={saveName} placeholder="Your name" placeholderTextColor={COLORS.softMuted} style={{ minHeight: 48, color: COLORS.ink, fontSize: 17, fontWeight: '700', borderBottomWidth: 1, borderBottomColor: COLORS.line }} /></View>

        <View style={{ gap: 11 }}><Text style={{ color: COLORS.ink, fontSize: 18, fontWeight: '900' }}>Appearance</Text><View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.medium, padding: 7, flexDirection: 'row', gap: 6, boxShadow: SHADOW }}>{THEMES.map((theme) => { const active = profile.appearance.mode === theme; return <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} key={theme} onPress={() => updateProfile({ theme, appearance: { ...profile.appearance, mode: theme } })} style={{ flex: 1, minHeight: 44, borderRadius: RADIUS.small, backgroundColor: active ? COLORS.contrast : COLORS.surface, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: active ? COLORS.contrastText : COLORS.muted, fontSize: 12, fontWeight: '800', textTransform: 'capitalize' }}>{theme}</Text></Pressable>; })}</View><View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.medium, padding: 16, gap: 14, boxShadow: SHADOW }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Glyph name="palette" size={17} color={COLORS.primary} /><Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '900' }}>Accent colour</Text></View><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 11 }}>{PALETTES.map((palette) => { const active = profile.appearance.paletteId === palette.id; return <Pressable accessibilityRole="button" accessibilityLabel={`${palette.label} colour`} accessibilityState={{ selected: active }} key={palette.id} onPress={() => updateProfile({ appearance: { ...profile.appearance, paletteId: palette.id, customAccent: null } })} style={{ minWidth: 76, minHeight: 48, borderRadius: 15, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 2, borderColor: active ? palette.color : COLORS.line }}><View style={{ width: 19, height: 19, borderRadius: 10, backgroundColor: palette.color }} /><Text style={{ color: COLORS.ink, fontSize: 11, fontWeight: '800' }}>{palette.label}</Text></Pressable>; })}</View><View style={{ flexDirection: 'row', gap: 8 }}><TextInput accessibilityLabel="Custom accent hex colour" autoCapitalize="characters" value={customAccent} onChangeText={setCustomAccent} placeholder="#C44F2B" placeholderTextColor={COLORS.softMuted} style={{ flex: 1, minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: COLORS.line, paddingHorizontal: 13, color: COLORS.ink, fontWeight: '800' }} /><Pressable accessibilityRole="button" onPress={() => /^#[0-9a-f]{6}$/i.test(customAccent) && updateProfile({ appearance: { ...profile.appearance, paletteId: 'custom', customAccent } })} style={{ minWidth: 76, minHeight: 48, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: COLORS.white, fontWeight: '900' }}>Apply</Text></Pressable></View></View><View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.medium, paddingHorizontal: 16, boxShadow: SHADOW }}><View style={{ minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 12 }}><Glyph name="spark" size={18} color={COLORS.primary} /><View style={{ flex: 1, gap: 3 }}><Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '800' }}>Reduced motion</Text><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '600' }}>Keep transitions calm and brief.</Text></View><Switch value={profile.reducedMotion} onValueChange={(reducedMotion) => updateProfile({ reducedMotion })} trackColor={{ false: COLORS.line, true: COLORS.primarySoft }} thumbColor={profile.reducedMotion ? COLORS.primary : COLORS.softMuted} /></View></View></View>

        <View style={{ gap: 10 }}><Text style={{ color: COLORS.ink, fontSize: 18, fontWeight: '900' }}>Your anchors</Text><View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.medium, paddingHorizontal: 16, boxShadow: SHADOW }}><View style={{ minHeight: 61, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: COLORS.line }}><Glyph name="sun" size={18} color={COLORS.amber} /><View style={{ flex: 1, gap: 3 }}><Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '800' }}>Morning plan</Text><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '600' }}>A gentle start to the day</Text></View><Text style={{ color: COLORS.primary, fontSize: 13, fontWeight: '900' }}>{profile.morningTime}</Text></View><View style={{ minHeight: 61, flexDirection: 'row', alignItems: 'center', gap: 12 }}><Glyph name="moon" size={18} color={COLORS.lavenderInk} /><View style={{ flex: 1, gap: 3 }}><Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '800' }}>Evening reset</Text><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '600' }}>Close loops without self-judgment</Text></View><Text style={{ color: COLORS.primary, fontSize: 13, fontWeight: '900' }}>{profile.eveningTime}</Text></View></View></View>

        <View style={{ gap: 10 }}><Text style={{ color: COLORS.ink, fontSize: 18, fontWeight: '900' }}>Data & access</Text><View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.medium, paddingHorizontal: 16, boxShadow: SHADOW }}><Pressable disabled={busy} onPress={() => void syncNow()} style={{ minHeight: 59, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: COLORS.line, opacity: busy ? 0.6 : 1 }}><Glyph name="cloud" size={18} color={COLORS.primary} /><View style={{ flex: 1, gap: 3 }}><Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '800' }}>Sync workspace</Text><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '600' }}>{syncStatus === 'synced' ? 'Everything is up to date' : 'Try cloud sync again'}</Text></View><Glyph name="arrow" size={16} color={COLORS.primary} /></Pressable><Pressable onPress={() => router.push('/account')} style={{ minHeight: 59, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: COLORS.line }}><Glyph name="link" size={18} color={COLORS.muted} /><View style={{ flex: 1, gap: 3 }}><Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '800' }}>Keep your workspace</Text><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '600' }}>{profile.email ? `Linked to ${profile.email}` : 'Link an account when you’re ready'}</Text></View><Glyph name="chevron" size={16} color={COLORS.softMuted} /></Pressable><Pressable disabled={busy} onPress={() => void handleExport()} style={{ minHeight: 59, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: busy ? 0.6 : 1 }}><Glyph name="download" size={18} color={COLORS.muted} /><View style={{ flex: 1, gap: 3 }}><Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '800' }}>Export your data</Text><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '600' }}>A portable copy of your workspace</Text></View><Glyph name="chevron" size={16} color={COLORS.softMuted} /></Pressable></View></View>

        <View style={{ gap: 10 }}><Text style={{ color: COLORS.ink, fontSize: 18, fontWeight: '900' }}>Device context</Text><View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.medium, paddingHorizontal: 16, boxShadow: SHADOW }}><Pressable disabled={busy} onPress={() => void connectCalendar()} style={{ minHeight: 61, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: COLORS.line, opacity: busy ? 0.6 : 1 }}><Glyph name="calendar" size={18} color={COLORS.lavenderInk} /><View style={{ flex: 1, gap: 3 }}><Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '800' }}>Read-only calendar</Text><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '600' }}>Show commitments around your plan</Text></View><Glyph name="chevron" size={16} color={COLORS.softMuted} /></Pressable><Pressable disabled={busy} onPress={() => void enableReminders()} style={{ minHeight: 61, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: busy ? 0.6 : 1 }}><Glyph name="bell" size={18} color={COLORS.amber} /><View style={{ flex: 1, gap: 3 }}><Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '800' }}>Anchor reminders</Text><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '600' }}>Morning plan + evening reset</Text></View><Glyph name="chevron" size={16} color={COLORS.softMuted} /></Pressable></View></View>

        <Pressable onPress={() => router.back()} style={{ alignItems: 'center', padding: 8 }}><Text style={{ color: COLORS.muted, fontSize: 13, fontWeight: '800' }}>Done</Text></Pressable>
      </ScrollView></View>
    </>
  );
}
