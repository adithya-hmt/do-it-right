import { router, Stack } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { BrandMark } from '@/components/ui/brand-mark';
import { Glyph } from '@/components/ui/glyph';
import { COLORS, GUTTER, RADIUS } from '@/constants/theme';
import { useTasks } from '@/context/task-context';

const COLORS_PICKER = ['#E06A3D', '#2E7D5B', '#3F82F6', '#9C3F67', '#D8B98C'];

export default function NewSpaceScreen() {
  const { session, createSpace } = useTasks();
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [color, setColor] = React.useState('#E06A3D');
  function save() {
    if (!session || !name.trim()) return;
    const id = createSpace({ name, description, color });
    router.replace({ pathname: '/space/[id]', params: { id } });
  }
  return <><Stack.Screen options={{ title: 'New space' }} /><KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.canvas }} behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}><ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: GUTTER, paddingBottom: 42, gap: 22 }}><View style={{ gap: 10, alignItems: 'flex-start' }}><View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}><BrandMark size={36} color={COLORS.onAccent} /></View><Text selectable style={{ color: COLORS.ink, fontSize: 29, lineHeight: 34, fontWeight: '900', letterSpacing: -0.8 }}>Make room for something shared.</Text><Text selectable style={{ color: COLORS.muted, fontSize: 13, lineHeight: 20, fontWeight: '600' }}>A space keeps its people, projects, tasks, and conversation together.</Text></View>{session ? <><View style={{ gap: 9 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Space name</Text><TextInput autoFocus value={name} onChangeText={setName} placeholder="Design studio, Home, Study group…" placeholderTextColor={COLORS.softMuted} style={{ minHeight: 56, borderRadius: RADIUS.medium, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: name ? color : COLORS.line, paddingHorizontal: 16, color: COLORS.ink, fontSize: 17, fontWeight: '800' }} /></View><View style={{ gap: 9 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>What belongs here?</Text><TextInput value={description} onChangeText={setDescription} placeholder="A short shared purpose" placeholderTextColor={COLORS.softMuted} multiline style={{ minHeight: 84, borderRadius: RADIUS.medium, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, padding: 15, color: COLORS.ink, fontSize: 14, lineHeight: 20 }} /></View><View style={{ gap: 10 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Color</Text><View style={{ flexDirection: 'row', gap: 12 }}>{COLORS_PICKER.map((item) => <Pressable key={item} accessibilityRole="radio" accessibilityState={{ selected: color === item }} accessibilityLabel={`Use ${item}`} onPress={() => setColor(item)} style={{ width: 46, height: 46, borderRadius: 16, backgroundColor: item, borderWidth: color === item ? 3 : 0, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center' }}>{color === item ? <Glyph name="check" size={17} color="#FFFFFF" /> : null}</Pressable>)}</View></View><Pressable accessibilityRole="button" disabled={!name.trim()} onPress={save} style={({ pressed }) => [{ minHeight: 56, borderRadius: RADIUS.medium, backgroundColor: name.trim() ? color : COLORS.line, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.72 }]}><Text style={{ color: name.trim() ? '#FFFFFF' : COLORS.muted, fontSize: 14, fontWeight: '900' }}>Create space</Text></Pressable></> : <Pressable onPress={() => router.replace('/account')} style={{ minHeight: 54, borderRadius: RADIUS.medium, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: COLORS.onAccent, fontWeight: '900' }}>Sign in first</Text></Pressable>}</ScrollView></KeyboardAvoidingView></>;
}
