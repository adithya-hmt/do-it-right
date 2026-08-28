import { Redirect, router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { AppHeader } from '@/components/app-header';
import { ProjectCard } from '@/components/project-card';
import { SectionHeading } from '@/components/section-heading';
import { SurfaceCard } from '@/components/ui/surface-card';
import { TaskRow } from '@/components/task-row';
import { Glyph } from '@/components/ui/glyph';
import { COLORS, DEEP_SHADOW, GUTTER, RADIUS } from '@/constants/theme';
import { useTasks } from '@/context/task-context';
import { useCalendarCommitments } from '@/hooks/use-calendar-commitments';
import { getDayKey } from '@/domain/workspace';

const FILTERS = ['All', 'Next', 'Inbox', 'Done'] as const;

export default function TodayScreen() {
  const { width } = useWindowDimensions();
  const today = getDayKey(new Date());
  const { tasks, projects, profile, todayPlan, toggleTask, syncStatus } = useTasks();
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>('All');
  const { commitments, loading: calendarLoading } = useCalendarCommitments();

  if (!profile.onboardingComplete) return <Redirect href="/onboarding" />;

  const openTasks = tasks.filter((task) => !task.completed);
  const completed = tasks.filter((task) => task.completed).length;
  const plannedToday = tasks.filter((task) => !task.completed && task.plannedDate === today);
  const dailyThree = todayPlan.dailyThree.map((id) => tasks.find((task) => task.id === id)).filter((task) => task && !task.completed);
  const visibleTasks = tasks.filter((task) => {
    if (filter === 'Next') return !task.completed && task.plannedDate === today;
    if (filter === 'Inbox') return !task.completed && task.status === 'inbox';
    if (filter === 'Done') return task.completed;
    return task.plannedDate === today || task.status === 'inbox' || task.completed;
  });
  const completionPercent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const projectWidth = Math.min(Math.max(width - 72, 250), 310);
  const syncLabel = syncStatus === 'synced' ? 'synced' : syncStatus === 'loading' ? 'syncing' : 'local only';

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.canvas }}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 20, paddingBottom: 158, gap: 25 }}>
        <Animated.View entering={FadeInDown.duration(420)}>
          <AppHeader eyebrow={`${new Date().toLocaleDateString([], { weekday: 'long' })} · ${syncLabel}`} title={`Good morning, ${profile.displayName}.`} subtitle={todayPlan.intention || 'Pick one clear thing and let the rest wait.'} profileInitial={profile.displayName.slice(0, 1).toUpperCase()} actionIcon="search" onAction={() => router.push('../search')} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(60).duration(450)} style={{ backgroundColor: COLORS.contrast, borderRadius: RADIUS.large, padding: 20, gap: 18, boxShadow: DEEP_SHADOW }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary }} /><Text style={{ color: COLORS.contrastText, fontSize: 11, fontWeight: '900', letterSpacing: 1.15 }}>TODAY IN MOTION</Text></View><Text style={{ color: COLORS.contrastMuted, fontSize: 11, fontWeight: '800' }}>{completed}/{tasks.length} done</Text></View>
          <View style={{ gap: 7 }}><Text selectable style={{ color: COLORS.contrastText, fontSize: 23, lineHeight: 27, fontWeight: '900', letterSpacing: -0.5 }}>{plannedToday.length ? `${plannedToday.length} open things on your plan.` : 'Your plan has room to breathe.'}</Text><Text style={{ color: COLORS.contrastMuted, fontSize: 13, lineHeight: 19, fontWeight: '600' }}>{profile.focusIntent}. Keep the next move visible.</Text></View>
          <View style={{ gap: 8 }}><View style={{ height: 6, backgroundColor: COLORS.contrastSurface, borderRadius: 3, overflow: 'hidden' }}><View style={{ width: `${Math.max(4, completionPercent)}%`, height: 6, borderRadius: 3, backgroundColor: COLORS.primary }} /></View><Text style={{ color: COLORS.contrastMuted, fontSize: 11, fontWeight: '700' }}>{completionPercent}% of the workspace wrapped</Text></View>
          <View style={{ flexDirection: 'row', gap: 9 }}><Pressable onPress={() => router.push('/focus')} style={({ pressed }) => [{ flex: 1, minHeight: 44, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 }, pressed && { opacity: 0.75 }]}><Glyph name="play" size={11} color={COLORS.ink} /><Text style={{ color: COLORS.ink, fontSize: 12, fontWeight: '900' }}>Start focus</Text></Pressable><Pressable onPress={() => router.push('/plan')} style={({ pressed }) => [{ width: 104, minHeight: 44, borderRadius: 14, backgroundColor: COLORS.contrastSurface, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.75 }]}><Text style={{ color: COLORS.contrastText, fontSize: 12, fontWeight: '900' }}>Open plan</Text></Pressable></View>
        </Animated.View>

        <View style={{ flexDirection: 'row', gap: 9 }}>{[{ value: String(openTasks.length), label: 'open', icon: 'inbox' as const }, { value: `${plannedToday.reduce((sum, task) => sum + task.estimateMinutes, 0)}m`, label: 'planned', icon: 'clock' as const }, { value: String(completed), label: 'finished', icon: 'check' as const }].map((stat) => <SurfaceCard key={stat.label} style={{ flex: 1, padding: 14, gap: 11 }}><Glyph name={stat.icon} size={15} color={COLORS.ink} /><Text selectable style={{ color: COLORS.ink, fontSize: 22, fontWeight: '900', fontVariant: ['tabular-nums'] }}>{stat.value}</Text><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '800' }}>{stat.label}</Text></SurfaceCard>)}</View>

        <View style={{ gap: 12 }}><SectionHeading title="Next up" subtitle={dailyThree.length ? `${dailyThree.length} priorities chosen for today` : 'Choose a few things worth your attention'} action="Shape plan" onAction={() => router.push('/plan')} /><SurfaceCard style={{ paddingHorizontal: 16 }}>{dailyThree.length ? dailyThree.map((task) => task ? <Pressable key={task.id} onPress={() => router.push({ pathname: '/focus', params: { taskId: task.id } })} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.line }}><View style={{ width: 29, height: 29, borderRadius: 10, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Glyph name="play" size={10} color={COLORS.ink} /></View><View style={{ flex: 1, gap: 3 }}><Text selectable style={{ color: COLORS.ink, fontSize: 14, fontWeight: '900' }}>{task.title}</Text><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '700' }}>{task.project} · {task.estimateMinutes} min</Text></View><Glyph name="chevron" size={14} color={COLORS.softMuted} /></Pressable> : null) : <Pressable onPress={() => router.push('/plan')} style={{ alignItems: 'center', padding: 21, gap: 6 }}><Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '900' }}>Give the day a shape</Text><Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: '600' }}>Choose up to three starts in Plan.</Text></Pressable>}</SurfaceCard></View>

        <View style={{ gap: 12 }}><SectionHeading title="Around you" subtitle="A little context from your calendar" action="Settings" onAction={() => router.push('/settings')} /><SurfaceCard style={{ backgroundColor: COLORS.lavender, padding: 16, gap: 11 }}>{calendarLoading ? <Text style={{ color: COLORS.lavenderInk, fontSize: 13, fontWeight: '700' }}>Checking your calendar…</Text> : commitments.length ? commitments.slice(0, 3).map((commitment) => <View key={commitment.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: commitment.calendarColor ?? COLORS.lavenderInk }} /><Text style={{ flex: 1, color: COLORS.ink, fontSize: 13, fontWeight: '800' }}>{commitment.title}</Text><Text style={{ color: COLORS.lavenderInk, fontSize: 11, fontWeight: '900' }}>{new Date(commitment.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text></View>) : <View style={{ gap: 5 }}><Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '900' }}>No commitments imported.</Text><Text style={{ color: COLORS.lavenderInk, fontSize: 12, lineHeight: 18, fontWeight: '600' }}>Connect a read-only calendar when you want your plan to see the shape of the day.</Text></View>}</SurfaceCard></View>

        <View style={{ gap: 12 }}><SectionHeading title="Your list" subtitle={`${visibleTasks.length} tasks in this view`} action="Capture" onAction={() => router.push('/add-task')} /><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7 }}>{FILTERS.map((item) => { const active = filter === item; return <Pressable key={item} onPress={() => setFilter(item)} style={({ pressed }) => [{ paddingVertical: 9, paddingHorizontal: 13, borderRadius: 12, backgroundColor: active ? COLORS.ink : COLORS.surface, borderWidth: active ? 0 : 1, borderColor: COLORS.line }, pressed && { opacity: 0.7 }]}><Text style={{ color: active ? COLORS.contrastText : COLORS.muted, fontSize: 11, fontWeight: '900' }}>{item}</Text></Pressable>; })}</ScrollView><SurfaceCard style={{ paddingHorizontal: 16 }}>{visibleTasks.length ? visibleTasks.map((task) => <TaskRow key={task.id} task={task} onToggle={() => toggleTask(task.id)} onStart={() => router.push({ pathname: '/focus', params: { taskId: task.id } })} />) : <View style={{ alignItems: 'center', padding: 26, gap: 7 }}><Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '900' }}>Nothing here yet.</Text><Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: '600' }}>Capture a task and make the next move visible.</Text></View>}</SurfaceCard></View>

        <View style={{ gap: 12 }}><SectionHeading title="Projects" subtitle="The bigger picture, kept close" action="See all" onAction={() => router.push('/(tabs)/projects')} /><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>{projects.filter((project) => project.status === 'active').slice(0, 3).map((project) => <View key={project.id} style={{ width: projectWidth }}><ProjectCard project={project} compact onPress={() => router.push({ pathname: '/project/[id]', params: { id: project.id } })} /></View>)}</ScrollView></View>

        <Pressable accessibilityRole="button" onPress={() => router.push('/add-task')} style={({ pressed }) => [{ minHeight: 58, borderRadius: 17, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9, boxShadow: DEEP_SHADOW }, pressed && { opacity: 0.8, transform: [{ scale: 0.99 }] }]}><View style={{ width: 24, height: 24, borderRadius: 8, backgroundColor: 'rgba(21,24,20,0.12)', alignItems: 'center', justifyContent: 'center' }}><Glyph name="plus" size={17} color={COLORS.ink} /></View><Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '900' }}>Capture a task</Text></Pressable>
      </ScrollView>
    </View>
  );
}
