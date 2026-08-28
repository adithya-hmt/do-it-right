import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { AddTaskFab, TaskSection, UndoToast, WorkspaceHeader } from '@/components/workspace-list';
import { COLORS, GUTTER, RADIUS } from '@/constants/theme';
import { useTasks } from '@/context/task-context';
import { getDayKey } from '@/domain/workspace';
import { getUpcomingTasks, groupTasksByDate } from '@/domain/workspace-selectors';
import type { Task } from '@/domain/types';

function dateAfter(days: number) { const date = new Date(); date.setDate(date.getDate() + days); return date; }

export default function UpcomingScreen() {
  const today = getDayKey(new Date());
  const { tasks, toggleTask } = useTasks();
  const dates = React.useMemo(() => Array.from({ length: 14 }, (_, index) => dateAfter(index + 1)), []);
  const [selected, setSelected] = React.useState(getDayKey(dates[0]));
  const [completed, setCompleted] = React.useState<Task | null>(null);
  const groups = groupTasksByDate(getUpcomingTasks(tasks, today).filter((task) => (task.dueDate ?? '') >= selected));
  const complete = (task: Task) => { toggleTask(task.id); setCompleted(task); };
  return <View style={{ flex: 1, backgroundColor: COLORS.canvas }}><ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingTop: 22, paddingBottom: 170, gap: 22 }}><View style={{ paddingHorizontal: GUTTER }}><WorkspaceHeader eyebrow="Next 14 days" title="Upcoming" subtitle="See what is coming before it becomes urgent." /></View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 8 }}>{dates.map((date) => { const key = getDayKey(date); const active = selected === key; return <Pressable key={key} accessibilityRole="button" accessibilityState={{ selected: active }} accessibilityLabel={date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })} onPress={() => setSelected(key)} style={({ pressed }) => [{ width: 58, minHeight: 68, borderRadius: RADIUS.medium, backgroundColor: active ? COLORS.contrast : COLORS.surface, borderWidth: 1, borderColor: active ? COLORS.contrast : COLORS.line, alignItems: 'center', justifyContent: 'center', gap: 3 }, pressed && { opacity: 0.7 }]}><Text style={{ color: active ? COLORS.contrastMuted : COLORS.muted, fontSize: 10, fontWeight: '900' }}>{date.toLocaleDateString([], { weekday: 'short' }).toUpperCase()}</Text><Text style={{ color: active ? COLORS.primary : COLORS.ink, fontSize: 20, fontWeight: '900', fontVariant: ['tabular-nums'] }}>{date.getDate()}</Text></Pressable>; })}</ScrollView><View style={{ paddingHorizontal: GUTTER, gap: 22 }}>{Object.keys(groups).sort().map((date) => <TaskSection key={date} title={new Date(`${date}T12:00:00`).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })} tasks={groups[date]} onComplete={complete} emptyTitle="Nothing scheduled" emptyBody="This day has room." />)}{Object.keys(groups).length === 0 ? <TaskSection title="Schedule" tasks={[]} onComplete={complete} emptyTitle="The horizon is clear" emptyBody="Future tasks will appear here in chronological groups." /> : null}</View></ScrollView><AddTaskFab /><UndoToast task={completed} onUndo={() => { if (completed) toggleTask(completed.id); setCompleted(null); }} onDismiss={() => setCompleted(null)} /></View>;
}
