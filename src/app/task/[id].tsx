import { router, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glyph } from '@/components/ui/glyph';
import { COLORS, GUTTER, RADIUS } from '@/constants/theme';
import { useTasks, type TaskPriority } from '@/context/task-context';

const PRIORITIES: TaskPriority[] = ['high', 'medium', 'low'];
const ESTIMATES = [15, 25, 50, 90];

function Choice({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={({ pressed }) => [{ minHeight: 44, paddingHorizontal: 13, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? COLORS.primarySoft : COLORS.surface, borderWidth: 1, borderColor: active ? COLORS.primary : COLORS.line }, pressed && { opacity: 0.65 }]}><Text style={{ color: active ? COLORS.primary : COLORS.muted, fontSize: 12, fontWeight: '900' }}>{label}</Text></Pressable>;
}

export default function TaskDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, projects, memberships, comments, updateTask, toggleTask, setTaskStatus, addComment } = useTasks();
  const task = tasks.find((item) => item.id === id);
  const [title, setTitle] = React.useState(task?.title ?? '');
  const [notes, setNotes] = React.useState(task?.notes ?? '');
  const [dueDate, setDueDate] = React.useState(task?.dueDate ?? '');
  const [dueTime, setDueTime] = React.useState(task?.dueTime ?? '');
  const [comment, setComment] = React.useState('');

  if (!task) return <View style={{ flex: 1, backgroundColor: COLORS.canvas, alignItems: 'center', justifyContent: 'center' }}><Text selectable style={{ color: COLORS.ink, fontWeight: '800' }}>Task not found.</Text></View>;

  const scopedProjects = projects.filter((project) => project.status === 'active' && project.spaceId === task.spaceId);
  const scopedMembers = memberships.filter((member) => member.status === 'active' && member.spaceId === task.spaceId);
  const taskComments = comments.filter((item) => item.taskId === task.id && !item.deletedAt);
  const spaceLabel = task.spaceId ? 'Shared task' : 'Personal task';

  function save() {
    const date = dueDate.trim() || null;
    updateTask(task!.id, { title: title.trim() || task!.title, notes: notes.trim(), dueDate: date, plannedDate: date, dueTime: dueTime.trim() || null, due: dueTime.trim() || 'Anytime', status: date || task!.projectId ? 'planned' : 'inbox' });
    router.back();
  }

  function sendComment() {
    if (!comment.trim()) return;
    addComment(task!.id, comment);
    setComment('');
  }

  return <>
    <Stack.Screen options={{ title: task.spaceId ? 'Shared task' : 'Task details' }} />
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.canvas }} behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: GUTTER, paddingBottom: insets.bottom + 34, gap: 21 }}>
        <View style={{ gap: 8 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}><Glyph name={task.spaceId ? 'people' : 'user'} size={14} color={COLORS.primary} /><Text style={{ color: COLORS.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.1 }}>{spaceLabel.toLocaleUpperCase()}</Text></View><TextInput accessibilityLabel="Task title" value={title} onChangeText={setTitle} multiline style={{ color: COLORS.ink, fontSize: 25, lineHeight: 31, fontWeight: '900', minHeight: 62 }} /><TextInput accessibilityLabel="Task notes" value={notes} onChangeText={setNotes} placeholder="Add context that makes starting easier" placeholderTextColor={COLORS.softMuted} multiline style={{ minHeight: 86, borderRadius: RADIUS.medium, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, padding: 15, color: COLORS.ink, fontSize: 14, lineHeight: 20 }} /></View>

        <View style={{ gap: 10 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Schedule</Text><View style={{ flexDirection: 'row', gap: 9 }}><TextInput accessibilityLabel="Due date" value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.softMuted} style={{ flex: 1, minHeight: 48, borderRadius: 14, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, paddingHorizontal: 13, color: COLORS.ink, fontWeight: '700' }} /><TextInput accessibilityLabel="Due time" value={dueTime} onChangeText={setDueTime} placeholder="HH:MM" placeholderTextColor={COLORS.softMuted} style={{ width: 105, minHeight: 48, borderRadius: 14, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, paddingHorizontal: 13, color: COLORS.ink, fontWeight: '700' }} /></View></View>

        <View style={{ gap: 10 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Project</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}><Choice active={!task.projectId} label="Inbox" onPress={() => updateTask(task.id, { projectId: null, project: 'Inbox', status: dueDate ? 'planned' : 'inbox' })} />{scopedProjects.map((project) => <Choice key={project.id} active={task.projectId === project.id} label={project.name} onPress={() => updateTask(task.id, { projectId: project.id, project: project.name, status: 'planned' })} />)}</ScrollView></View>

        {task.spaceId ? <View style={{ gap: 10 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Assigned to</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}><Choice active={!task.assigneeId} label="Anyone" onPress={() => updateTask(task.id, { assigneeId: null })} />{scopedMembers.map((member) => <Choice key={member.id} active={task.assigneeId === member.userId} label={member.displayName} onPress={() => updateTask(task.id, { assigneeId: member.userId })} />)}</ScrollView></View> : null}

        <View style={{ gap: 10 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Importance</Text><View style={{ flexDirection: 'row', gap: 8 }}>{PRIORITIES.map((priority) => <Choice key={priority} active={task.priority === priority} label={priority === 'high' ? 'Must' : priority === 'medium' ? 'Should' : 'Could'} onPress={() => updateTask(task.id, { priority })} />)}</View></View>
        <View style={{ gap: 10 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Timebox</Text><View style={{ flexDirection: 'row', gap: 8 }}>{ESTIMATES.map((minutes) => <Choice key={minutes} active={task.estimateMinutes === minutes} label={`${minutes}m`} onPress={() => updateTask(task.id, { estimateMinutes: minutes })} />)}</View></View>

        {task.spaceId ? <View style={{ gap: 11 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}><Glyph name="comment" size={16} color={COLORS.primary} /><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Conversation</Text></View>{taskComments.length ? taskComments.map((item) => { const author = scopedMembers.find((member) => member.userId === item.authorId); return <View key={item.id} style={{ padding: 13, borderRadius: RADIUS.small, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, gap: 4 }}><Text style={{ color: COLORS.primary, fontSize: 11, fontWeight: '900' }}>{author?.displayName ?? 'Teammate'}</Text><Text selectable style={{ color: COLORS.ink, fontSize: 14, lineHeight: 20, fontWeight: '600' }}>{item.body}</Text></View>; }) : <Text style={{ color: COLORS.muted, fontSize: 13, lineHeight: 19 }}>Keep decisions beside the work, not scattered across chats.</Text>}<View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}><TextInput accessibilityLabel="Add a comment" value={comment} onChangeText={setComment} placeholder="Write a helpful update…" placeholderTextColor={COLORS.softMuted} multiline style={{ flex: 1, minHeight: 48, maxHeight: 110, borderRadius: 16, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, paddingHorizontal: 14, paddingVertical: 12, color: COLORS.ink, fontSize: 14 }} /><Pressable accessibilityRole="button" accessibilityLabel="Send comment" disabled={!comment.trim()} onPress={sendComment} style={({ pressed }) => [{ width: 48, height: 48, borderRadius: 16, backgroundColor: comment.trim() ? COLORS.primary : COLORS.line, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.7 }]}><Glyph name="send" size={18} color={comment.trim() ? COLORS.white : COLORS.muted} /></Pressable></View></View> : null}

        <Pressable accessibilityRole="button" onPress={save} style={({ pressed }) => [{ minHeight: 56, borderRadius: RADIUS.medium, backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, pressed && { opacity: 0.72 }]}><Text style={{ color: COLORS.white, fontSize: 14, fontWeight: '900' }}>Save changes</Text><Glyph name="check" size={16} color={COLORS.white} /></Pressable>
        <Pressable accessibilityRole="button" onPress={() => toggleTask(task.id)} style={({ pressed }) => [{ minHeight: 50, borderRadius: RADIUS.medium, borderWidth: 1, borderColor: COLORS.line, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.65 }]}><Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '800' }}>{task.completed ? 'Put task back' : 'Mark complete'}</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Cancel task" onPress={() => { setTaskStatus(task.id, 'cancelled'); router.back(); }} style={({ pressed }) => [{ minHeight: 48, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.6 }]}><Text style={{ color: COLORS.coral, fontSize: 13, fontWeight: '900' }}>Cancel task</Text></Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  </>;
}
