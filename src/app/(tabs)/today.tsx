import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { AddTaskFab, TaskSection, UndoToast, WorkspaceHeader } from '@/components/workspace-list';
import { Glyph } from '@/components/ui/glyph';
import { COLORS, GUTTER, RADIUS } from '@/constants/theme';
import { useTasks } from '@/context/task-context';
import { getDayKey } from '@/domain/workspace';
import { getOverdueTasks, getTodayTasks } from '@/domain/workspace-selectors';
import type { Task } from '@/domain/types';

export default function TodayScreen() {
  const today = getDayKey(new Date());
  const { tasks, todayPlan, toggleTask } = useTasks();
  const [completed, setCompleted] = React.useState<Task | null>(null);
  const overdue = getOverdueTasks(tasks, today);
  const dueToday = getTodayTasks(tasks, today);
  const dailyThree = todayPlan.dailyThree.map((id) => tasks.find((task) => task.id === id)).filter((task): task is Task => Boolean(task && !task.completed));
  const complete = (task: Task) => { toggleTask(task.id); setCompleted(task); };
  return <View style={{ flex: 1, backgroundColor: COLORS.canvas }}><ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 22, paddingBottom: 170, gap: 24 }}><WorkspaceHeader eyebrow={new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })} title="Today" subtitle={todayPlan.intention || 'Choose less. Finish what matters.'} /><View style={{ backgroundColor: COLORS.contrast, borderRadius: RADIUS.large, padding: 18, gap: 14, borderCurve: 'continuous' }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ color: COLORS.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.1 }}>DAILY THREE</Text><Text style={{ color: COLORS.contrastMuted, fontSize: 11, fontWeight: '800' }}>{dailyThree.length}/3 selected</Text></View>{dailyThree.map((task, index) => <Pressable key={task.id} onPress={() => router.push({ pathname: '/task/[id]', params: { id: task.id } })} style={({ pressed }) => [{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 11 }, pressed && { opacity: 0.65 }]}><View style={{ width: 28, height: 28, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: COLORS.white, fontSize: 12, fontWeight: '900' }}>{index + 1}</Text></View><Text selectable numberOfLines={1} style={{ flex: 1, color: COLORS.contrastText, fontSize: 14, fontWeight: '800' }}>{task.title}</Text></Pressable>)}<View style={{ flexDirection: 'row', gap: 9 }}><Pressable onPress={() => router.push('/focus')} style={({ pressed }) => [{ flex: 1, minHeight: 46, borderRadius: 14, backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, pressed && { opacity: 0.72 }]}><Glyph name="play" size={12} color={COLORS.white} /><Text style={{ color: COLORS.white, fontWeight: '900' }}>Focus</Text></Pressable><Pressable onPress={() => router.push('/daily-three')} style={({ pressed }) => [{ flex: 1, minHeight: 46, borderRadius: 14, backgroundColor: COLORS.contrastSurface, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.72 }]}><Text style={{ color: COLORS.contrastText, fontWeight: '900' }}>Plan three</Text></Pressable></View></View>{overdue.length ? <TaskSection title="Overdue" subtitle="Still open from before today" tasks={overdue} onComplete={complete} emptyTitle="No overdue tasks" emptyBody="Nothing is trailing behind." /> : null}<TaskSection title="Due today" subtitle={`${dueToday.length} tasks · ${dueToday.reduce((sum, task) => sum + task.estimateMinutes, 0)} minutes estimated`} tasks={dueToday} onComplete={complete} emptyTitle="Today is clear" emptyBody="Schedule a task here when you want to make room for it." /></ScrollView><AddTaskFab /><UndoToast task={completed} onUndo={() => { if (completed) toggleTask(completed.id); setCompleted(null); }} onDismiss={() => setCompleted(null)} /></View>;
}
