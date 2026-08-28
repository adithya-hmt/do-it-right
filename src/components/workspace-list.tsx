import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TaskRow } from '@/components/task-row';
import { Glyph } from '@/components/ui/glyph';
import { SurfaceCard } from '@/components/ui/surface-card';
import { COLORS, DEEP_SHADOW, RADIUS } from '@/constants/theme';
import type { Task } from '@/domain/types';

export function WorkspaceHeader({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: { icon: 'search' | 'settings'; label: string; onPress: () => void } }) {
  const insets = useSafeAreaInsets();
  // Tab screens already reserve 20–22dp at the top; add only the missing
  // portion of the Android status-bar inset plus a small breathing room.
  const topInset = process.env.EXPO_OS === 'android' ? Math.max(0, insets.top - 14) : 0;
  return <View style={{ gap: 7, paddingTop: topInset }}><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={{ color: COLORS.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.25 }}>{eyebrow.toUpperCase()}</Text>{action ? <Pressable accessibilityRole="button" accessibilityLabel={action.label} onPress={action.onPress} style={({ pressed }) => [{ width: 44, height: 44, borderRadius: 15, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.65 }]}><Glyph name={action.icon} size={18} color={COLORS.ink} /></Pressable> : null}</View><Text selectable style={{ color: COLORS.ink, fontSize: 31, lineHeight: 36, fontWeight: '900', letterSpacing: -0.9 }}>{title}</Text><Text selectable style={{ color: COLORS.muted, fontSize: 13, lineHeight: 19, fontWeight: '600' }}>{subtitle}</Text></View>;
}

export function TaskSection({ title, subtitle, tasks, onComplete, emptyTitle, emptyBody }: { title: string; subtitle?: string; tasks: Task[]; onComplete: (task: Task) => void; emptyTitle: string; emptyBody: string }) {
  return <View style={{ gap: 10 }}><View style={{ gap: 3 }}><Text selectable style={{ color: COLORS.ink, fontSize: 17, fontWeight: '900' }}>{title}</Text>{subtitle ? <Text selectable style={{ color: COLORS.muted, fontSize: 12, fontWeight: '600' }}>{subtitle}</Text> : null}</View><SurfaceCard style={{ paddingHorizontal: 15 }}>{tasks.length ? tasks.map((task) => <TaskRow key={task.id} task={task} onToggle={() => onComplete(task)} onOpen={() => router.push({ pathname: '/task/[id]', params: { id: task.id } })} />) : <EmptyState title={emptyTitle} body={emptyBody} />}</SurfaceCard></View>;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return <View style={{ alignItems: 'center', paddingVertical: 28, paddingHorizontal: 12, gap: 6 }}><View style={{ width: 38, height: 38, borderRadius: 14, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Glyph name="check" size={18} color={COLORS.primary} /></View><Text selectable style={{ color: COLORS.ink, fontSize: 14, fontWeight: '900', textAlign: 'center' }}>{title}</Text><Text selectable style={{ color: COLORS.muted, fontSize: 12, lineHeight: 18, fontWeight: '600', textAlign: 'center' }}>{body}</Text></View>;
}

export function AddTaskFab() {
  const insets = useSafeAreaInsets();
  const bottomInset = process.env.EXPO_OS === 'android' ? insets.bottom : 0;
  return <Pressable accessibilityRole="button" accessibilityLabel="Add task" onPress={() => router.push('/add-task')} style={({ pressed }) => [{ position: 'absolute', right: 20, bottom: bottomInset + 96, width: 58, height: 58, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', boxShadow: DEEP_SHADOW }, pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] }]}><Glyph name="plus" size={24} color={COLORS.white} /></Pressable>;
}

export function UndoToast({ task, onUndo, onDismiss }: { task: Task | null; onUndo: () => void; onDismiss: () => void }) {
  const insets = useSafeAreaInsets();
  const bottomInset = process.env.EXPO_OS === 'android' ? insets.bottom : 0;
  React.useEffect(() => {
    if (!task) return;
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss, task]);
  if (!task) return null;
  return <View accessibilityLiveRegion="polite" style={{ position: 'absolute', left: 20, right: 20, bottom: bottomInset + 98, minHeight: 54, borderRadius: RADIUS.medium, backgroundColor: COLORS.contrast, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10, boxShadow: DEEP_SHADOW }}><Glyph name="check" size={15} color={COLORS.primary} /><Text selectable numberOfLines={1} style={{ flex: 1, color: COLORS.contrastText, fontSize: 13, fontWeight: '700' }}>{task.title} completed</Text><Pressable accessibilityRole="button" accessibilityLabel={`Undo completion of ${task.title}`} onPress={onUndo} style={{ minWidth: 48, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: COLORS.primary, fontSize: 13, fontWeight: '900' }}>Undo</Text></Pressable></View>;
}
