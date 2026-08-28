import { Redirect, router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { AddTaskFab, TaskSection, UndoToast, WorkspaceHeader } from '@/components/workspace-list';
import { COLORS, GUTTER } from '@/constants/theme';
import { useTasks } from '@/context/task-context';
import { getInboxTasks } from '@/domain/workspace-selectors';
import type { Task } from '@/domain/types';

export default function InboxScreen() {
  const { tasks, profile, toggleTask, syncStatus, syncMessage, syncNow } = useTasks();
  const [completed, setCompleted] = React.useState<Task | null>(null);
  if (!profile.onboardingComplete) return <Redirect href="/onboarding" />;
  const inbox = getInboxTasks(tasks);
  const complete = (task: Task) => { toggleTask(task.id); setCompleted(task); };
  return <View style={{ flex: 1, backgroundColor: COLORS.canvas }}><ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 22, paddingBottom: 170, gap: 24 }}><WorkspaceHeader eyebrow={syncStatus === 'synced' ? 'Synced' : 'Saved locally'} title="Inbox" subtitle={`${inbox.length} open ${inbox.length === 1 ? 'task' : 'tasks'} without a project.`} action={{ icon: 'search', label: 'Search tasks', onPress: () => router.push('/search') }} />{syncStatus === 'error' && syncMessage ? <Pressable accessibilityRole="button" onPress={syncNow} style={({ pressed }) => [{ minHeight: 52, borderRadius: 16, paddingHorizontal: 15, backgroundColor: COLORS.coralSoft, justifyContent: 'center', gap: 3 }, pressed && { opacity: 0.68 }]}><Text selectable style={{ color: COLORS.coral, fontSize: 12, fontWeight: '900' }}>Sync paused · Tap to retry</Text><Text selectable numberOfLines={2} style={{ color: COLORS.muted, fontSize: 11, lineHeight: 16, fontWeight: '600' }}>{syncMessage}</Text></Pressable> : null}<TaskSection title="Captured" subtitle="Scheduled items stay here until you assign a project." tasks={inbox} onComplete={complete} emptyTitle="Inbox zero" emptyBody="Everything has a home. Capture the next thought when it arrives." /></ScrollView><AddTaskFab /><UndoToast task={completed} onUndo={() => { if (completed) toggleTask(completed.id); setCompleted(null); }} onDismiss={() => setCompleted(null)} /></View>;
}
