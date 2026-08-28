import { router, Stack } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Glyph } from '@/components/ui/glyph';
import { COLORS, GUTTER, RADIUS } from '@/constants/theme';
import { useTasks } from '@/context/task-context';

export default function NewProjectScreen() {
  const { areas, addProject } = useTasks();
  const [name, setName] = React.useState('');
  const [outcome, setOutcome] = React.useState('');
  const [areaId, setAreaId] = React.useState(areas[0]?.id ?? '');
  const canSave = name.trim().length > 1;

  function save() {
    if (!canSave) return;
    addProject({ name: name.trim(), outcome: outcome.trim() || 'A direction worth making visible.', areaId });
    router.back();
  }

  return <><Stack.Screen options={{ title: 'New project' }} /><KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.canvas }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: GUTTER, paddingTop: 18, paddingBottom: 38, gap: 23 }}><View style={{ gap: 8 }}><View style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}><Glyph name="projects" size={18} color={COLORS.ink} /></View><Text selectable style={{ color: COLORS.ink, fontSize: 30, lineHeight: 35, fontWeight: '900', letterSpacing: -0.8 }}>Give the work a home.</Text><Text style={{ color: COLORS.muted, fontSize: 14, lineHeight: 20, fontWeight: '600' }}>A project is a direction, not another place to feel behind.</Text></View><View style={{ gap: 9 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Project name</Text><TextInput autoFocus value={name} onChangeText={setName} placeholder="e.g. Autumn launch" placeholderTextColor={COLORS.softMuted} style={{ minHeight: 56, borderRadius: RADIUS.medium, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: name ? COLORS.primary : COLORS.line, paddingHorizontal: 16, color: COLORS.ink, fontSize: 17, fontWeight: '800' }} /></View><View style={{ gap: 9 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>What does done look like?</Text><TextInput value={outcome} onChangeText={setOutcome} placeholder="A clear outcome for this direction" placeholderTextColor={COLORS.softMuted} multiline style={{ minHeight: 100, borderRadius: RADIUS.medium, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, padding: 16, color: COLORS.ink, fontSize: 15, lineHeight: 21, fontWeight: '700' }} /></View><View style={{ gap: 10 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Life area</Text><View style={{ gap: 8 }}>{areas.filter((area) => !area.archivedAt).map((area) => { const active = area.id === areaId; return <Pressable key={area.id} onPress={() => setAreaId(area.id)} style={{ minHeight: 52, borderRadius: 14, backgroundColor: active ? COLORS.primarySoft : COLORS.surface, borderWidth: 1, borderColor: active ? COLORS.primary : COLORS.line, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 11 }}><View style={{ width: 26, height: 26, borderRadius: 9, backgroundColor: `${area.color}22`, alignItems: 'center', justifyContent: 'center' }}><Glyph name={area.icon === 'heart' ? 'heart' : area.icon === 'briefcase' ? 'briefcase' : 'spark'} size={14} color={area.color} /></View><Text style={{ flex: 1, color: active ? COLORS.ink : COLORS.muted, fontSize: 13, fontWeight: '800' }}>{area.name}</Text>{active ? <Glyph name="check" size={15} color={COLORS.ink} /> : null}</Pressable>; })}</View></View><Pressable disabled={!canSave} onPress={save} style={{ minHeight: 57, borderRadius: 17, backgroundColor: canSave ? COLORS.primary : COLORS.line, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9 }}><Text style={{ color: canSave ? COLORS.ink : COLORS.muted, fontSize: 14, fontWeight: '900' }}>Create project</Text><Glyph name="arrow" size={17} color={canSave ? COLORS.ink : COLORS.muted} /></Pressable></ScrollView></KeyboardAvoidingView></>;
}
