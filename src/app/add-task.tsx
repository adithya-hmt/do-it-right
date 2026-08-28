import { router, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glyph } from '@/components/ui/glyph';
import { COLORS, GUTTER, RADIUS } from '@/constants/theme';
import { useTasks, type TaskCategory, type TaskPriority } from '@/context/task-context';
import { getDayKey } from '@/domain/workspace';
import { parseNaturalLanguageDate } from '@/domain/natural-language-date';

const CATEGORIES: TaskCategory[] = ['Work', 'Personal'];
const PRIORITIES: TaskPriority[] = ['high', 'medium', 'low'];
const TIMEBOXES = [15, 25, 50, 90];

export default function AddTaskScreen() {
  const insets = useSafeAreaInsets();
  const { projectId } = useLocalSearchParams<{ projectId?: string }>();
  const { addTask, projects } = useTasks();
  const initialProject = projects.find((project) => project.id === projectId);
  const [title, setTitle] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [category, setCategory] = React.useState<TaskCategory>('Work');
  const [priority, setPriority] = React.useState<TaskPriority>('medium');
  const [estimateMinutes, setEstimateMinutes] = React.useState(25);
  const [destination, setDestination] = React.useState(initialProject?.name ?? 'Inbox');
  const parsedSchedule = React.useMemo(() => parseNaturalLanguageDate(title), [title]);
  const [dueDate, setDueDate] = React.useState<string | null>(null);
  const [dueTime, setDueTime] = React.useState<string | null>(null);
  const [quickDates] = React.useState(() => {
    const today = new Date();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    return [{ label: 'No date', value: null }, { label: 'Today', value: getDayKey(today) }, { label: 'Tomorrow', value: getDayKey(tomorrow) }];
  });
  const canSave = title.trim().length > 0;

  function handleTitleChange(value: string) {
    setTitle(value);
    const parsed = parseNaturalLanguageDate(value);
    if (!parsed.tokens.length) return;
    setDueDate(parsed.dueDate);
    setDueTime(parsed.dueTime);
  }

  function handleSave() {
    if (!canSave) return;
    addTask({ title: parsedSchedule.tokens.length && dueDate ? parsedSchedule.title : title.trim(), notes: notes.trim(), category, priority, estimateMinutes, project: destination === 'Inbox' ? undefined : destination, projectId: destination === 'Inbox' ? null : projects.find((project) => project.name === destination)?.id, dueDate, dueTime, plannedDate: dueDate });
    router.back();
  }

  return (
    <>
      <Stack.Screen options={{ title: 'New task' }} />
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.canvas }} behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 18, paddingBottom: insets.bottom + 28, gap: 23 }}>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><View style={{ width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primarySoft }}><Glyph name="plus" size={17} color={COLORS.primary} /></View><Text style={{ color: COLORS.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 }}>CAPTURE THE NEXT THING</Text></View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}><Text selectable style={{ flex: 1, color: COLORS.ink, fontSize: 29, lineHeight: 34, fontWeight: '900', letterSpacing: -0.7 }}>Quick Add</Text><Pressable disabled accessibilityRole="button" accessibilityLabel="Voice capture coming soon" accessibilityHint="Microphone is voice-ready but recording is not enabled in this release" style={{ width: 44, height: 44, borderRadius: 15, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center', opacity: 0.72 }}><Glyph name="mic" size={18} color={COLORS.primary} /></Pressable></View>
          </View>

          <View style={{ gap: 10 }}>
            <Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>What needs your attention?</Text>
            <TextInput autoFocus value={title} onChangeText={handleTitleChange} placeholder="Send draft today 3pm" placeholderTextColor={COLORS.softMuted} multiline style={{ minHeight: 104, borderRadius: RADIUS.medium, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: title.length > 0 ? COLORS.primary : COLORS.line, padding: 17, color: COLORS.ink, fontSize: 17, lineHeight: 24, fontWeight: '700' }} />
            <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: '600' }}>Try “today 3pm”, “tomorrow”, or “next Monday”. Unrecognized text stays in the title.</Text>
            {parsedSchedule.tokens.length ? <View accessibilityLabel="Recognized schedule" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{dueDate ? <Pressable onPress={() => setDueDate(null)} style={{ minHeight: 40, paddingHorizontal: 13, borderRadius: RADIUS.pill, backgroundColor: COLORS.primarySoft, flexDirection: 'row', alignItems: 'center', gap: 7 }}><Glyph name="calendar" size={14} color={COLORS.primary} /><Text selectable style={{ color: COLORS.primary, fontSize: 12, fontWeight: '900' }}>{dueDate}</Text><Glyph name="close" size={11} color={COLORS.primary} /></Pressable> : null}{dueTime ? <Pressable onPress={() => setDueTime(null)} style={{ minHeight: 40, paddingHorizontal: 13, borderRadius: RADIUS.pill, backgroundColor: COLORS.coralSoft, flexDirection: 'row', alignItems: 'center', gap: 7 }}><Glyph name="clock" size={14} color={COLORS.coral} /><Text selectable style={{ color: COLORS.coral, fontSize: 12, fontWeight: '900' }}>{dueTime}</Text><Glyph name="close" size={11} color={COLORS.coral} /></Pressable> : null}</View> : null}
          </View>

          <View style={{ gap: 9 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Optional note</Text><TextInput value={notes} onChangeText={setNotes} placeholder="A little context for future you" placeholderTextColor={COLORS.softMuted} multiline style={{ minHeight: 68, borderRadius: RADIUS.medium, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, padding: 14, color: COLORS.ink, fontSize: 14, lineHeight: 20, fontWeight: '600' }} /></View>

          <View style={{ gap: 12 }}>
            <Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Context</Text>
            <View style={{ flexDirection: 'row', gap: 9 }}>{CATEGORIES.map((item) => { const active = item === category; return <Pressable key={item} onPress={() => setCategory(item)} style={({ pressed }) => [{ flex: 1, paddingVertical: 13, borderRadius: RADIUS.small, backgroundColor: active ? COLORS.contrast : COLORS.surface, borderWidth: active ? 0 : 1, borderColor: COLORS.line, alignItems: 'center' }, pressed && { opacity: 0.72 }]}><Text style={{ color: active ? COLORS.contrastText : COLORS.muted, fontSize: 13, fontWeight: '800' }}>{item}</Text></Pressable>; })}</View>
          </View>

          <View style={{ gap: 12 }}>
            <Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Priority</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>{PRIORITIES.map((item) => { const active = item === priority; return <Pressable key={item} onPress={() => setPriority(item)} style={({ pressed }) => [{ flex: 1, paddingVertical: 11, borderRadius: RADIUS.pill, backgroundColor: active ? COLORS.primarySoft : COLORS.surface, borderWidth: 1, borderColor: active ? COLORS.primary : COLORS.line, alignItems: 'center' }, pressed && { opacity: 0.72 }]}><Text style={{ color: active ? COLORS.primary : COLORS.muted, fontSize: 12, fontWeight: '900', textTransform: 'capitalize' }}>{item}</Text></Pressable>; })}</View>
          </View>

          <View style={{ gap: 12 }}>
            <Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Timebox</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>{TIMEBOXES.map((minutes) => { const active = estimateMinutes === minutes; return <Pressable key={minutes} onPress={() => setEstimateMinutes(minutes)} style={({ pressed }) => [{ flex: 1, minHeight: 42, borderRadius: 12, backgroundColor: active ? COLORS.contrast : COLORS.surface, borderWidth: active ? 0 : 1, borderColor: COLORS.line, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.72 }]}><Text style={{ color: active ? COLORS.contrastText : COLORS.muted, fontSize: 12, fontWeight: '900' }}>{minutes}m</Text></Pressable>; })}</View>
          </View>

          <View style={{ gap: 12 }}>
            <Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Where should it live?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{['Inbox', ...projects.filter((project) => project.status === 'active').map((project) => project.name)].map((item) => { const active = item === destination; return <Pressable key={item} onPress={() => setDestination(item)} style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 10, paddingHorizontal: 13, borderRadius: RADIUS.pill, backgroundColor: active ? COLORS.primarySoft : COLORS.surface, borderWidth: 1, borderColor: active ? COLORS.primary : COLORS.line }, pressed && { opacity: 0.72 }]}><View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: active ? COLORS.primary : COLORS.softMuted }} /><Text style={{ color: active ? COLORS.ink : COLORS.muted, fontSize: 12, fontWeight: '800' }}>{item}</Text></Pressable>; })}</ScrollView>
          </View>

          <View style={{ gap: 12 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Due date</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{quickDates.map((option) => { const active = dueDate === option.value; return <Pressable key={option.label} onPress={() => setDueDate(option.value)} style={({ pressed }) => [{ minHeight: 44, paddingHorizontal: 14, borderRadius: RADIUS.pill, backgroundColor: active ? COLORS.contrast : COLORS.surface, borderWidth: 1, borderColor: active ? COLORS.contrast : COLORS.line, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.7 }]}><Text style={{ color: active ? COLORS.contrastText : COLORS.muted, fontSize: 12, fontWeight: '900' }}>{option.label}</Text></Pressable>; })}</ScrollView><TextInput accessibilityLabel="Custom due date" value={dueDate ?? ''} onChangeText={(value) => setDueDate(value.trim() || null)} placeholder="Custom date · YYYY-MM-DD" placeholderTextColor={COLORS.softMuted} style={{ minHeight: 48, borderRadius: RADIUS.medium, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, paddingHorizontal: 14, color: COLORS.ink, fontSize: 13, fontWeight: '700' }} /><TextInput accessibilityLabel="Due time" value={dueTime ?? ''} onChangeText={(value) => setDueTime(value.trim() || null)} placeholder="Optional time · HH:MM" placeholderTextColor={COLORS.softMuted} style={{ minHeight: 48, borderRadius: RADIUS.medium, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, paddingHorizontal: 14, color: COLORS.ink, fontSize: 13, fontWeight: '700' }} /></View>

          <Pressable onPress={handleSave} disabled={!canSave} style={({ pressed }) => [{ minHeight: 56, borderRadius: RADIUS.medium, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9, backgroundColor: canSave ? COLORS.primary : COLORS.line, opacity: canSave ? 1 : 0.8 }, pressed && { opacity: 0.75 }]}><Text style={{ color: canSave ? COLORS.contrastText : COLORS.muted, fontSize: 14, fontWeight: '900' }}>Capture task</Text><Glyph name="arrow" size={18} color={canSave ? COLORS.contrastText : COLORS.muted} /></Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
