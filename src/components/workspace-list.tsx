import { router } from 'expo-router';
import React from 'react';
import { Keyboard, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TaskRow } from '@/components/task-row';
import { BrandLockup } from '@/components/ui/brand-lockup';
import { Glyph } from '@/components/ui/glyph';
import { SurfaceCard } from '@/components/ui/surface-card';
import { COLORS, DEEP_SHADOW, FONTS, RADIUS } from '@/constants/theme';
import { useTasks } from '@/context/task-context';
import { parseQuickAdd } from '@/domain/quick-add';
import type { TaskV3 } from '@/domain/types';

export function WorkspaceHeader({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: { icon: 'search' | 'settings'; label: string; onPress: () => void } }) {
  const insets = useSafeAreaInsets();
  // Tab screens already reserve 20–22dp at the top; add only the missing
  // portion of the Android status-bar inset plus a small breathing room.
  const topInset = process.env.EXPO_OS === 'android' ? Math.max(0, insets.top - 14) : 0;
  return <View style={{ gap: 10, paddingTop: topInset }}><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}><BrandLockup size={20} /><View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>{eyebrow ? <Text numberOfLines={1} style={{ color: COLORS.primary, fontFamily: FONTS.mono, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 }}>{eyebrow.toUpperCase()}</Text> : null}{action ? <Pressable accessibilityRole="button" accessibilityLabel={action.label} onPress={action.onPress} style={({ pressed }) => [{ width: 44, height: 44, borderRadius: 13, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.65, transform: [{ scale: 0.95 }] }]}><Glyph name={action.icon} size={18} color={COLORS.ink} /></Pressable> : null}</View></View><Text selectable style={{ color: COLORS.ink, fontSize: 38, lineHeight: 42, fontWeight: '900', letterSpacing: -1.4 }}>{title}</Text><Text selectable style={{ color: COLORS.muted, fontSize: 14, lineHeight: 20, fontWeight: '600' }}>{subtitle}</Text></View>;
}

export function TaskSection({ title, subtitle, tasks, onComplete, onStart, emptyTitle, emptyBody }: { title: string; subtitle?: string; tasks: TaskV3[]; onComplete: (task: TaskV3) => void; onStart?: (task: TaskV3) => void; emptyTitle: string; emptyBody: string }) {
  return <View style={{ gap: 10 }}><View style={{ gap: 4 }}><Text selectable style={{ color: COLORS.ink, fontFamily: FONTS.mono, fontSize: 11, fontWeight: '800', letterSpacing: 0.9, textTransform: 'uppercase' }}>{title}</Text>{subtitle ? <Text selectable style={{ color: COLORS.muted, fontSize: 12, lineHeight: 17, fontWeight: '600' }}>{subtitle}</Text> : null}</View><SurfaceCard style={{ paddingHorizontal: 15 }}>{tasks.length ? tasks.map((task) => <TaskRow key={task.id} task={task} onToggle={() => onComplete(task)} onStart={onStart ? () => onStart(task) : undefined} onOpen={() => router.push({ pathname: '/task/[id]', params: { id: task.id } })} />) : <EmptyState title={emptyTitle} body={emptyBody} />}</SurfaceCard></View>;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return <View style={{ alignItems: 'center', paddingVertical: 28, paddingHorizontal: 12, gap: 6 }}><View style={{ width: 38, height: 38, borderRadius: 14, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Glyph name="check" size={18} color={COLORS.primary} /></View><Text selectable style={{ color: COLORS.ink, fontSize: 14, fontWeight: '900', textAlign: 'center' }}>{title}</Text><Text selectable style={{ color: COLORS.muted, fontSize: 12, lineHeight: 18, fontWeight: '600', textAlign: 'center' }}>{body}</Text></View>;
}

export function AddTaskFab() {
  const insets = useSafeAreaInsets();
  const bottomInset = process.env.EXPO_OS === 'android' ? insets.bottom : 0;
  return <Pressable accessibilityRole="button" accessibilityLabel="Add task" onPress={() => router.push('/add-task')} style={({ pressed }) => [{ position: 'absolute', right: 20, bottom: Math.max(18, bottomInset + 10), minWidth: 74, height: 54, paddingHorizontal: 17, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7, boxShadow: DEEP_SHADOW }, pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] }]}><Glyph name="plus" size={18} color={COLORS.onAccent} /><Text style={{ color: COLORS.onAccent, fontSize: 13, fontWeight: '900' }}>Add</Text></Pressable>;
}

export function QuickCapture() {
  const { addTask } = useTasks();
  const [value, setValue] = React.useState('');
  const [addedCount, setAddedCount] = React.useState(0);
  const parsed = React.useMemo(() => parseQuickAdd(value, { projects: [], members: [] }), [value]);

  function submit() {
    if (!parsed.tasks.length) return;
    parsed.tasks.forEach((task) => addTask({ title: task.title, category: 'Personal', priority: 'medium', estimateMinutes: 25, dueDate: task.dueDate, plannedDate: task.dueDate, dueTime: task.dueTime }));
    setAddedCount(parsed.tasks.length);
    setValue('');
    Keyboard.dismiss();
  }

  React.useEffect(() => {
    if (!addedCount) return;
    const timer = setTimeout(() => setAddedCount(0), 3000);
    return () => clearTimeout(timer);
  }, [addedCount]);

  return <View style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: RADIUS.medium, padding: 15, gap: 11 }}><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><View style={{ width: 27, height: 27, borderRadius: 8, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Glyph name="plus" size={15} color={COLORS.primary} /></View><Text style={{ color: COLORS.ink, fontFamily: FONTS.mono, fontSize: 10, fontWeight: '800', letterSpacing: 0.7 }}>CAPTURE WITHOUT SORTING</Text></View><Text style={{ color: COLORS.softMuted, fontFamily: FONTS.mono, fontSize: 10, fontWeight: '700' }}>ENTER</Text></View><TextInput accessibilityLabel="Quick capture a task" value={value} onChangeText={setValue} onSubmitEditing={submit} returnKeyType="done" placeholder="Put the thought somewhere safe…" placeholderTextColor={COLORS.softMuted} style={{ minHeight: 52, borderBottomWidth: 1.5, borderBottomColor: value ? COLORS.primary : COLORS.line, color: COLORS.ink, fontSize: 17, lineHeight: 23, fontWeight: '700', paddingVertical: 8 }} /><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Text selectable style={{ flex: 1, color: addedCount ? COLORS.success : COLORS.muted, fontSize: 11, lineHeight: 16, fontWeight: '700' }}>{addedCount ? `${addedCount} ${addedCount === 1 ? 'thought' : 'thoughts'} kept in Inbox.` : 'No sorting needed. Add details later if you want.'}</Text><Pressable accessibilityRole="button" accessibilityLabel="Open detailed task add" onPress={() => router.push('/add-task')} style={({ pressed }) => [{ minHeight: 40, paddingHorizontal: 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 4 }, pressed && { opacity: 0.6 }]}><Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: '900' }}>Details</Text><Glyph name="arrow" size={13} color={COLORS.primary} /></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Keep task in Inbox" onPress={submit} disabled={!parsed.tasks.length} style={({ pressed }) => [{ minHeight: 42, paddingHorizontal: 13, borderRadius: 11, backgroundColor: parsed.tasks.length ? COLORS.primary : COLORS.line, justifyContent: 'center' }, pressed && { opacity: 0.75 }]}><Text style={{ color: parsed.tasks.length ? COLORS.onAccent : COLORS.muted, fontSize: 12, fontWeight: '900' }}>Keep</Text></Pressable></View></View>;
}

export function NextMark({ task, onComplete, onStart }: { task: TaskV3 | null; onComplete: (task: TaskV3) => void; onStart: (task: TaskV3) => void }) {
  if (!task) return <View style={{ backgroundColor: COLORS.contrast, borderRadius: RADIUS.large, padding: 19, gap: 14, boxShadow: DEEP_SHADOW }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary }} /><Text style={{ color: COLORS.primary, fontFamily: FONTS.mono, fontSize: 10, fontWeight: '800', letterSpacing: 1 }}>NEXT MARK</Text></View><Text selectable style={{ color: COLORS.contrastText, fontSize: 24, lineHeight: 29, fontWeight: '900' }}>Nothing is asking for your attention right now.</Text><Text style={{ color: COLORS.contrastMuted, fontSize: 13, lineHeight: 19, fontWeight: '600' }}>Capture one small thought below, or leave the page quiet.</Text></View>;
  return <View style={{ backgroundColor: COLORS.contrast, borderRadius: RADIUS.large, padding: 19, gap: 15, boxShadow: DEEP_SHADOW }}><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary }} /><Text style={{ color: COLORS.primary, fontFamily: FONTS.mono, fontSize: 10, fontWeight: '800', letterSpacing: 1 }}>NEXT MARK</Text></View><Text style={{ color: COLORS.contrastMuted, fontFamily: FONTS.mono, fontSize: 10, fontWeight: '700' }}>{task.estimateMinutes}M TIMEBOX</Text></View><Pressable accessibilityRole="button" accessibilityLabel={`Open ${task.title}`} onPress={() => router.push({ pathname: '/task/[id]', params: { id: task.id } })} style={({ pressed }) => [{ gap: 7 }, pressed && { opacity: 0.7 }]}><Text selectable numberOfLines={3} style={{ color: COLORS.contrastText, fontSize: 27, lineHeight: 31, fontWeight: '900', letterSpacing: -0.7 }}>{task.title}</Text><Text style={{ color: COLORS.contrastMuted, fontSize: 12, fontWeight: '700' }}>{task.project || 'Inbox'} · {task.dueDate ? task.due ?? task.dueDate : 'No date yet'}</Text></Pressable><View style={{ flexDirection: 'row', gap: 9 }}><Pressable accessibilityRole="button" accessibilityLabel={`Start focus on ${task.title}`} onPress={() => onStart(task)} style={({ pressed }) => [{ flex: 1, minHeight: 48, borderRadius: 13, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 }, pressed && { opacity: 0.75, transform: [{ scale: 0.98 }] }]}><Glyph name="play" size={13} color={COLORS.onAccent} /><Text style={{ color: COLORS.onAccent, fontSize: 13, fontWeight: '900' }}>Start {task.estimateMinutes} min</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`Complete ${task.title}`} onPress={() => onComplete(task)} style={({ pressed }) => [{ width: 48, minHeight: 48, borderRadius: 13, backgroundColor: COLORS.contrastSurface, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.75, transform: [{ scale: 0.96 }] }]}><Glyph name="check" size={17} color={COLORS.contrastText} /></Pressable></View><Text style={{ color: COLORS.contrastMuted, fontSize: 11, fontWeight: '600' }}>One mark is enough. You can choose again after this.</Text></View>;
}

export function UndoToast({ task, onUndo, onDismiss }: { task: TaskV3 | null; onUndo: () => void; onDismiss: () => void }) {
  const insets = useSafeAreaInsets();
  const bottomInset = process.env.EXPO_OS === 'android' ? insets.bottom : 0;
  React.useEffect(() => {
    if (!task) return;
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss, task]);
  if (!task) return null;
  return <View accessibilityLiveRegion="polite" style={{ position: 'absolute', left: 20, right: 20, bottom: Math.max(20, bottomInset + 12), minHeight: 54, borderRadius: RADIUS.medium, backgroundColor: COLORS.contrast, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10, boxShadow: DEEP_SHADOW }}><Glyph name="check" size={15} color={COLORS.primary} /><Text selectable numberOfLines={1} style={{ flex: 1, color: COLORS.contrastText, fontSize: 13, fontWeight: '700' }}>{task.title} completed</Text><Pressable accessibilityRole="button" accessibilityLabel={`Undo completion of ${task.title}`} onPress={onUndo} style={{ minWidth: 48, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: COLORS.primary, fontSize: 13, fontWeight: '900' }}>Undo</Text></Pressable></View>;
}
