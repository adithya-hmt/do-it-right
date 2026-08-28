import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { AppHeader } from '@/components/app-header';
import { SectionHeading } from '@/components/section-heading';
import { TaskRow } from '@/components/task-row';
import { Glyph } from '@/components/ui/glyph';
import { SurfaceCard } from '@/components/ui/surface-card';
import { COLORS, GUTTER, RADIUS } from '@/constants/theme';
import { useTasks } from '@/context/task-context';
import { getDayKey } from '@/domain/workspace';

export default function PlanScreen() {
  const today = getDayKey(new Date());
  const { tasks, profile, todayPlan, setDailyThree, setIntention, toggleTask, routines, completeRoutine, isRoutineComplete, inboxCount } = useTasks();
  const [intention, setLocalIntention] = React.useState(todayPlan.intention);
  const [selected, setSelected] = React.useState(todayPlan.dailyThree);
  const candidates = tasks.filter((task) => !task.completed && (task.plannedDate === today || task.status === 'inbox'));
  const dailyThree = selected.map((id) => tasks.find((task) => task.id === id)).filter(Boolean);
  const plannedMinutes = candidates.filter((task) => selected.includes(task.id)).reduce((sum, task) => sum + task.estimateMinutes, 0);
  const planProgress = Math.min(100, Math.round((selected.length / 3) * 100));

  function toggleDailyThree(id: string) {
    const next = selected.includes(id) ? selected.filter((item) => item !== id) : selected.length < 3 ? [...selected, id] : selected;
    setSelected(next);
    setDailyThree(next);
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.canvas }}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 20, paddingBottom: 158, gap: 24 }}>
        <Animated.View entering={FadeInDown.duration(420)}>
          <AppHeader eyebrow="Plan your attention" title="Make the day usable." subtitle="Choose less, then give the important things somewhere to land." profileInitial={profile.displayName.slice(0, 1).toUpperCase()} actionIcon="plus" onAction={() => router.push('/add-task')} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(60).duration(430)} style={{ backgroundColor: COLORS.primarySoft, borderRadius: RADIUS.large, padding: 19, gap: 15 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Glyph name="calendar" size={16} color={COLORS.primary} /><Text style={{ color: COLORS.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.1 }}>TODAY · SHAPE</Text></View>
            <Text style={{ color: COLORS.lavenderInk, fontSize: 11, fontWeight: '900' }}>{plannedMinutes}m planned</Text>
          </View>
          <TextInput value={intention} onChangeText={setLocalIntention} onBlur={() => setIntention(intention.trim())} onSubmitEditing={() => setIntention(intention.trim())} placeholder="What would make today feel meaningful?" placeholderTextColor={COLORS.lavenderInk} style={{ minHeight: 50, color: COLORS.ink, fontSize: 17, lineHeight: 23, fontWeight: '800' }} />
          <View style={{ gap: 8 }}><View style={{ height: 4, backgroundColor: COLORS.line, borderRadius: 2, overflow: 'hidden' }}><View style={{ width: `${Math.max(8, planProgress)}%`, height: 4, backgroundColor: COLORS.primary, borderRadius: 2 }} /></View><Text style={{ color: COLORS.lavenderInk, fontSize: 12, lineHeight: 18, fontWeight: '600' }}>{selected.length}/3 priorities chosen · small is sustainable</Text></View>
        </Animated.View>

        <View style={{ gap: 12 }}>
          <SectionHeading title="Daily three" subtitle={`${selected.length} of 3 chosen · your first moves`} />
          <SurfaceCard style={{ padding: 15, gap: 9 }}>
            {dailyThree.length ? dailyThree.map((task) => task ? <Pressable key={task.id} onPress={() => toggleDailyThree(task.id)} style={({ pressed }) => [{ backgroundColor: COLORS.contrast, borderRadius: 15, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 11 }, pressed && { opacity: 0.7 }]}><View style={{ width: 29, height: 29, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: COLORS.contrastText, fontSize: 12, fontWeight: '900' }}>{selected.indexOf(task.id) + 1}</Text></View><View style={{ flex: 1, gap: 3 }}><Text selectable style={{ color: COLORS.contrastText, fontSize: 14, fontWeight: '900' }}>{task.title}</Text><Text style={{ color: COLORS.contrastMuted, fontSize: 11, fontWeight: '700' }}>{task.project} · {task.estimateMinutes} min</Text></View><Glyph name="close" size={13} color={COLORS.contrastMuted} /></Pressable> : null) : <View style={{ alignItems: 'center', padding: 20, gap: 6 }}><Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '900' }}>Start with three clear things</Text><Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: '600' }}>Tap a task below to make it part of today.</Text></View>}
          </SurfaceCard>
        </View>

        <View style={{ gap: 12 }}>
          <SectionHeading title="Task bank" subtitle={`${candidates.length} open · ${inboxCount} still in inbox`} action="Capture" onAction={() => router.push('/add-task')} />
          <SurfaceCard style={{ paddingHorizontal: 16 }}>
            {candidates.length ? candidates.map((task) => { const active = selected.includes(task.id); return <Pressable key={task.id} onPress={() => toggleDailyThree(task.id)} style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: COLORS.line }, pressed && { opacity: 0.65 }]}><View style={{ width: 24, height: 24, borderRadius: 8, backgroundColor: active ? COLORS.primary : COLORS.surface, borderWidth: 1.5, borderColor: active ? COLORS.primary : COLORS.softMuted, alignItems: 'center', justifyContent: 'center' }}>{active ? <Glyph name="check" size={13} color={COLORS.contrastText} /> : null}</View><View style={{ flex: 1, gap: 3 }}><Text selectable style={{ color: COLORS.ink, fontSize: 14, fontWeight: '800' }}>{task.title}</Text><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '700' }}>{task.project} · {task.estimateMinutes} min</Text></View><Text style={{ color: active ? COLORS.primary : COLORS.softMuted, fontSize: 10, fontWeight: '900' }}>{active ? 'IN PLAN' : task.priority.toUpperCase()}</Text></Pressable>; }) : <View style={{ padding: 23, alignItems: 'center', gap: 7 }}><Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '900' }}>Your task bank is clear.</Text><Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: '600' }}>Capture something new when it appears.</Text></View>}
          </SurfaceCard>
        </View>

        <View style={{ gap: 12 }}>
          <SectionHeading title="Routines" subtitle="Small promises that keep the system human" />
          <SurfaceCard style={{ paddingHorizontal: 16 }}>
            {routines.filter((routine) => routine.active).map((routine) => { const done = isRoutineComplete(routine.id); return <Pressable key={routine.id} onPress={() => { if (!done) completeRoutine(routine.id); }} style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.line }, pressed && { opacity: 0.65 }]}><View style={{ width: 28, height: 28, borderRadius: 10, backgroundColor: done ? COLORS.mint : COLORS.lavender, alignItems: 'center', justifyContent: 'center' }}><Glyph name={done ? 'check' : 'repeat'} size={14} color={done ? COLORS.mintInk : COLORS.lavenderInk} /></View><View style={{ flex: 1, gap: 3 }}><Text style={{ color: done ? COLORS.softMuted : COLORS.ink, fontSize: 14, fontWeight: '800', textDecorationLine: done ? 'line-through' : 'none' }}>{routine.title}</Text><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '700' }}>{routine.anchor} · {routine.estimateMinutes} min</Text></View><Text style={{ color: done ? COLORS.mintInk : COLORS.muted, fontSize: 10, fontWeight: '900' }}>{done ? 'DONE' : 'OPEN'}</Text></Pressable>; })}
          </SurfaceCard>
        </View>

        <View style={{ gap: 12 }}>
          <SectionHeading title="Everything else" subtitle="Planned work outside your first three" />
          <SurfaceCard style={{ paddingHorizontal: 16 }}>{tasks.filter((task) => task.plannedDate === today && !todayPlan.dailyThree.includes(task.id)).map((task) => <TaskRow key={task.id} task={task} onToggle={() => toggleTask(task.id)} onStart={() => router.push({ pathname: '/focus', params: { taskId: task.id } })} />)}</SurfaceCard>
        </View>
      </ScrollView>
    </View>
  );
}
