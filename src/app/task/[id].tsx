import { router, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Glyph } from '@/components/ui/glyph';
import { COLORS, GUTTER, RADIUS } from '@/constants/theme';
import { useTasks, type TaskPriority } from '@/context/task-context';

const PRIORITIES: TaskPriority[] = ['high', 'medium', 'low'];
const ESTIMATES = [15, 25, 50, 90];

function Choice({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [{ flex: 1, minHeight: 44, paddingHorizontal: 12, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? COLORS.primarySoft : COLORS.surface, borderWidth: 1, borderColor: active ? COLORS.primary : COLORS.line }, pressed && { opacity: 0.65 }]}><Text style={{ color: active ? COLORS.primary : COLORS.muted, fontSize: 12, fontWeight: '900' }}>{label}</Text></Pressable>;
}

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, projects, updateTask, toggleTask, setTaskStatus } = useTasks();
  const task = tasks.find((item) => item.id === id);
  const [title, setTitle] = React.useState(task?.title ?? '');
  const [notes, setNotes] = React.useState(task?.notes ?? '');
  const [dueDate, setDueDate] = React.useState(task?.dueDate ?? '');
  const [dueTime, setDueTime] = React.useState(task?.dueTime ?? '');

  if (!task) return <View style={{ flex: 1, backgroundColor: COLORS.canvas, alignItems: 'center', justifyContent: 'center' }}><Text selectable style={{ color: COLORS.ink, fontWeight: '800' }}>Task not found.</Text></View>;

  function save() {
    const date = dueDate.trim() || null;
    updateTask(task!.id, { title: title.trim() || task!.title, notes: notes.trim(), dueDate: date, plannedDate: date, dueTime: dueTime.trim() || null, due: dueTime.trim() || 'Anytime', status: date || task!.projectId ? 'planned' : 'inbox' });
    router.back();
  }

  return <><Stack.Screen options={{ title: 'Task details' }} /><KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.canvas }} behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}><ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: GUTTER, paddingBottom: 42, gap: 20 }}><View style={{ gap: 8 }}><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '900', letterSpacing: 1.1 }}>TASK</Text><TextInput value={title} onChangeText={setTitle} multiline style={{ color: COLORS.ink, fontSize: 25, lineHeight: 31, fontWeight: '900', minHeight: 62 }} /><TextInput value={notes} onChangeText={setNotes} placeholder="Add notes" placeholderTextColor={COLORS.softMuted} multiline style={{ minHeight: 86, borderRadius: RADIUS.medium, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, padding: 15, color: COLORS.ink, fontSize: 14, lineHeight: 20 }} /></View><View style={{ gap: 10 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Schedule</Text><View style={{ flexDirection: 'row', gap: 9 }}><TextInput accessibilityLabel="Due date" value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.softMuted} style={{ flex: 1, minHeight: 48, borderRadius: 14, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, paddingHorizontal: 13, color: COLORS.ink, fontWeight: '700' }} /><TextInput accessibilityLabel="Due time" value={dueTime} onChangeText={setDueTime} placeholder="HH:MM" placeholderTextColor={COLORS.softMuted} style={{ width: 100, minHeight: 48, borderRadius: 14, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, paddingHorizontal: 13, color: COLORS.ink, fontWeight: '700' }} /></View></View><View style={{ gap: 10 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Project</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{[{ id: null, name: 'Inbox' }, ...projects.filter((project) => project.status === 'active')].map((project) => <Choice key={project.id ?? 'inbox'} active={task.projectId === project.id} label={project.name} onPress={() => updateTask(task.id, { projectId: project.id, project: project.name, status: project.id || dueDate ? 'planned' : 'inbox' })} />)}</ScrollView></View><View style={{ gap: 10 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Priority</Text><View style={{ flexDirection: 'row', gap: 8 }}>{PRIORITIES.map((priority) => <Choice key={priority} active={task.priority === priority} label={priority[0].toUpperCase() + priority.slice(1)} onPress={() => updateTask(task.id, { priority })} />)}</View></View><View style={{ gap: 10 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Estimate</Text><View style={{ flexDirection: 'row', gap: 8 }}>{ESTIMATES.map((minutes) => <Choice key={minutes} active={task.estimateMinutes === minutes} label={`${minutes}m`} onPress={() => updateTask(task.id, { estimateMinutes: minutes })} />)}</View></View><Pressable onPress={save} style={({ pressed }) => [{ minHeight: 54, borderRadius: RADIUS.medium, backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, pressed && { opacity: 0.72 }]}><Text style={{ color: COLORS.white, fontSize: 14, fontWeight: '900' }}>Save changes</Text><Glyph name="check" size={16} color={COLORS.white} /></Pressable><Pressable onPress={() => toggleTask(task.id)} style={({ pressed }) => [{ minHeight: 50, borderRadius: RADIUS.medium, borderWidth: 1, borderColor: COLORS.line, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.65 }]}><Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '800' }}>{task.completed ? 'Undo completion' : 'Complete task'}</Text></Pressable><Pressable onPress={() => { setTaskStatus(task.id, 'cancelled'); router.back(); }} style={({ pressed }) => [{ minHeight: 48, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.6 }]}><Text style={{ color: COLORS.coral, fontSize: 13, fontWeight: '900' }}>Cancel task</Text></Pressable></ScrollView></KeyboardAvoidingView></>;
}
