import { Redirect, router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { AddTaskFab, NextMark, QuickCapture, TaskSection, UndoToast, WorkspaceHeader } from '@/components/workspace-list';
import { Glyph } from '@/components/ui/glyph';
import { COLORS, GUTTER } from '@/constants/theme';
import { useTasks } from '@/context/task-context';
import { getInboxTasks, getOverdueTasks, getTodayTasks } from '@/domain/workspace-selectors';
import { getDayKey } from '@/domain/workspace';
import type { TaskV3 } from '@/domain/types';

export default function InboxScreen() {
  const { tasks, profile, toggleTask, syncStatus, syncMessage, syncNow } = useTasks();
  const [completed, setCompleted] = React.useState<TaskV3 | null>(null);
  const today = getDayKey(new Date());
  const inbox = getInboxTasks(tasks);
  const focusTask = React.useMemo(() => inbox[0] ?? getOverdueTasks(tasks, today)[0] ?? getTodayTasks(tasks, today)[0] ?? null, [inbox, tasks, today]);
  if (!profile.onboardingComplete) return <Redirect href="/onboarding" />;
  const complete = (task: TaskV3) => { toggleTask(task.id); setCompleted(task); };
  return <View style={{ flex: 1, backgroundColor: COLORS.canvas }}><ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 22, paddingBottom: 170, gap: 22 }}><WorkspaceHeader eyebrow={syncStatus === 'synced' ? 'Synced' : 'Saved locally'} title="Inbox" subtitle="Put it down. Pick one. Keep moving." action={{ icon: 'search', label: 'Search tasks', onPress: () => router.push('/search') }} />{syncStatus === 'error' && syncMessage ? <Pressable accessibilityRole="button" onPress={syncNow} style={({ pressed }) => [{ minHeight: 52, borderRadius: 13, paddingHorizontal: 15, backgroundColor: COLORS.coralSoft, justifyContent: 'center', gap: 3, borderWidth: 1, borderColor: COLORS.coral }, pressed && { opacity: 0.68 }]}><Text selectable style={{ color: COLORS.coral, fontSize: 12, fontWeight: '900' }}>Sync paused · Tap to retry</Text><Text selectable numberOfLines={2} style={{ color: COLORS.muted, fontSize: 11, lineHeight: 16, fontWeight: '600' }}>{syncMessage}</Text></Pressable> : null}<NextMark task={focusTask} onComplete={complete} onStart={(task) => router.push({ pathname: '/focus', params: { taskId: task.id } })} /><QuickCapture />{inbox.length > 1 ? <TaskSection title="Other open loops" subtitle={`${inbox.length - 1} more ${inbox.length - 1 === 1 ? 'thought' : 'thoughts'} waiting for a home.`} tasks={inbox.filter((task) => task.id !== focusTask?.id)} onComplete={complete} onStart={(task) => router.push({ pathname: '/focus', params: { taskId: task.id } })} emptyTitle="Nothing else is waiting" emptyBody="That is enough for this pass." /> : null}<Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/today')} style={({ pressed }) => [{ minHeight: 54, paddingHorizontal: 15, borderWidth: 1, borderColor: COLORS.line, borderRadius: 13, backgroundColor: COLORS.surface, flexDirection: 'row', alignItems: 'center', gap: 10 }, pressed && { opacity: 0.68 }]}><View style={{ width: 31, height: 31, borderRadius: 10, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Glyph name="arrow" size={14} color={COLORS.primary} /></View><View style={{ flex: 1, gap: 2 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>See today’s short list</Text><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '600' }}>Daily Three and scheduled work live there.</Text></View><Glyph name="chevron" size={16} color={COLORS.primary} /></Pressable></ScrollView><AddTaskFab /><UndoToast task={completed} onUndo={() => { if (completed) toggleTask(completed.id); setCompleted(null); }} onDismiss={() => setCompleted(null)} /></View>;
}
