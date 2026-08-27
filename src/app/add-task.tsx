import { router, Stack } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glyph } from '@/components/ui/glyph';
import { COLORS, GUTTER, RADIUS } from '@/constants/theme';
import { useTasks, type TaskCategory } from '@/context/task-context';

const CATEGORIES: TaskCategory[] = ['Work', 'Personal'];
const PROJECT_OPTIONS = ['Northstar', 'Launch kit', 'Field notes', 'Personal'];

export default function AddTaskScreen() {
  const insets = useSafeAreaInsets();
  const { addTask } = useTasks();
  const [title, setTitle] = React.useState('');
  const [category, setCategory] = React.useState<TaskCategory>('Work');
  const [project, setProject] = React.useState(PROJECT_OPTIONS[0]);
  const canSave = title.trim().length > 0;

  function handleSave() {
    if (!canSave) return;
    addTask({ title: title.trim(), category, project });
    router.back();
  }

  return (
    <>
      <Stack.Screen options={{ title: 'New task' }} />
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.canvas }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 18, paddingBottom: insets.bottom + 28, gap: 25 }}>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><View style={{ width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primarySoft }}><Glyph name="plus" size={17} color={COLORS.primary} /></View><Text style={{ color: COLORS.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 }}>CAPTURE THE NEXT THING</Text></View>
            <Text selectable style={{ color: COLORS.ink, fontSize: 29, lineHeight: 34, fontWeight: '900', letterSpacing: -0.7 }}>Give it a name{ '\n' }and let it breathe.</Text>
          </View>

          <View style={{ gap: 10 }}>
            <Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>What needs your attention?</Text>
            <TextInput autoFocus value={title} onChangeText={setTitle} placeholder="e.g. Sketch the new welcome state" placeholderTextColor={COLORS.softMuted} multiline style={{ minHeight: 112, borderRadius: RADIUS.medium, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: title.length > 0 ? COLORS.primary : COLORS.line, padding: 17, color: COLORS.ink, fontSize: 17, lineHeight: 24, fontWeight: '700' }} />
            <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: '600' }}>Keep it specific enough to start in one sitting.</Text>
          </View>

          <View style={{ gap: 12 }}>
            <Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Context</Text>
            <View style={{ flexDirection: 'row', gap: 9 }}>{CATEGORIES.map((item) => { const active = item === category; return <Pressable key={item} onPress={() => setCategory(item)} style={{ flex: 1, paddingVertical: 13, borderRadius: RADIUS.small, backgroundColor: active ? COLORS.ink : COLORS.surface, borderWidth: active ? 0 : 1, borderColor: COLORS.line, alignItems: 'center' }}><Text style={{ color: active ? COLORS.white : COLORS.muted, fontSize: 13, fontWeight: '800' }}>{item}</Text></Pressable>; })}</View>
          </View>

          <View style={{ gap: 12 }}>
            <Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Add to project</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{PROJECT_OPTIONS.map((item) => { const active = item === project; return <Pressable key={item} onPress={() => setProject(item)} style={{ flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 10, paddingHorizontal: 13, borderRadius: RADIUS.pill, backgroundColor: active ? COLORS.primarySoft : COLORS.surface, borderWidth: 1, borderColor: active ? '#B7D8F4' : COLORS.line }}><View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: active ? COLORS.primary : COLORS.softMuted }} /><Text style={{ color: active ? COLORS.primary : COLORS.muted, fontSize: 12, fontWeight: '800' }}>{item}</Text></Pressable>; })}</View>
          </View>

          <Pressable onPress={handleSave} disabled={!canSave} style={{ minHeight: 56, borderRadius: RADIUS.medium, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9, backgroundColor: canSave ? COLORS.primary : COLORS.line, opacity: canSave ? 1 : 0.8 }}><Text style={{ color: canSave ? COLORS.white : COLORS.muted, fontSize: 14, fontWeight: '900' }}>Add to today</Text><Glyph name="arrow" size={18} color={canSave ? COLORS.white : COLORS.muted} /></Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
