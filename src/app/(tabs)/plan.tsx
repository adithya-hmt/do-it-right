import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { TaskRow } from '@/components/task-row';
import { Glyph } from '@/components/ui/glyph';
import { COLORS, GUTTER, RADIUS, SHADOW } from '@/constants/theme';
import { useTasks } from '@/context/task-context';
import { getDayKey } from '@/domain/workspace';

export default function PlanScreen() {
  const today = getDayKey(new Date());
  const { tasks, todayPlan, setDailyThree, setIntention, toggleTask, routines, completeRoutine, isRoutineComplete, inboxCount } = useTasks();
  const [intention, setLocalIntention] = React.useState(todayPlan.intention);
  const [selected, setSelected] = React.useState(todayPlan.dailyThree);

  const candidates = tasks.filter((task) => !task.completed && (task.plannedDate === today || task.status === 'inbox'));
  const dailyThree = selected.map((id) => tasks.find((task) => task.id === id)).filter(Boolean);

  function toggleDailyThree(id: string) {
    const next = selected.includes(id) ? selected.filter((item) => item !== id) : selected.length < 3 ? [...selected, id] : selected;
    setSelected(next);
    setDailyThree(next);
  }

  function saveIntention() {
    setIntention(intention.trim());
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.canvas }}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 24, paddingBottom: 124, gap: 25 }}>
        <Animated.View entering={FadeInDown.duration(420)} style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Glyph name="calendar" size={17} color={COLORS.primary} /><Text style={{ color: COLORS.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.3 }}>YOUR PLAN</Text></View>
          <Text selectable style={{ color: COLORS.ink, fontSize: 35, lineHeight: 39, fontWeight: '900', letterSpacing: -1 }}>A day with{ '\n' }a little shape.</Text>
          <Text style={{ color: COLORS.muted, fontSize: 14, lineHeight: 20, fontWeight: '600' }}>Choose less. Give the important things somewhere to land.</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(70).duration(450)} style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.medium, padding: 18, gap: 10, boxShadow: SHADOW }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ color: COLORS.ink, fontSize: 15, fontWeight: '900' }}>Today’s intention</Text><Glyph name="spark" size={16} color={COLORS.primary} /></View>
          <TextInput value={intention} onChangeText={setLocalIntention} onBlur={saveIntention} onSubmitEditing={saveIntention} placeholder="What would make today feel meaningful?" placeholderTextColor={COLORS.softMuted} style={{ minHeight: 50, color: COLORS.ink, fontSize: 16, lineHeight: 22, fontWeight: '700' }} />
        </Animated.View>

        <View style={{ gap: 13 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}><View style={{ gap: 4 }}><Text style={{ color: COLORS.ink, fontSize: 21, fontWeight: '900' }}>Daily Three</Text><Text style={{ color: COLORS.muted, fontSize: 13, fontWeight: '600' }}>{selected.length} of 3 chosen · the shape of today</Text></View><Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: '900' }}>Tap to choose</Text></View>
          <View style={{ gap: 9 }}>{dailyThree.length ? dailyThree.map((task) => task ? <Pressable key={task.id} onPress={() => toggleDailyThree(task.id)} style={{ backgroundColor: COLORS.primarySoft, borderRadius: RADIUS.medium, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 }}><View style={{ width: 27, height: 27, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}><Glyph name="check" size={15} color={COLORS.white} /></View><View style={{ flex: 1, gap: 3 }}><Text style={{ color: COLORS.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>NEXT THING</Text><Text selectable style={{ color: COLORS.ink, fontSize: 15, fontWeight: '800' }}>{task.title}</Text></View><Glyph name="close" size={14} color={COLORS.primary} /></Pressable> : null) : <View style={{ padding: 19, borderRadius: RADIUS.medium, borderWidth: 1, borderColor: COLORS.line, borderStyle: 'dashed', alignItems: 'center', gap: 7 }}><Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '800' }}>Choose up to three things</Text><Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: '600' }}>A smaller plan is easier to begin.</Text></View>}</View>
        </View>

        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><View style={{ gap: 4 }}><Text style={{ color: COLORS.ink, fontSize: 20, fontWeight: '900' }}>Choose from your list</Text><Text style={{ color: COLORS.muted, fontSize: 13, fontWeight: '600' }}>{candidates.length} open · {inboxCount} in inbox</Text></View><Pressable onPress={() => router.push('/add-task')}><Glyph name="plus" size={20} color={COLORS.primary} /></Pressable></View>
          <View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.medium, paddingHorizontal: 16, boxShadow: SHADOW }}>{candidates.map((task) => { const active = selected.includes(task.id); return <Pressable key={task.id} onPress={() => toggleDailyThree(task.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: COLORS.line }}><View style={{ width: 23, height: 23, borderRadius: 12, backgroundColor: active ? COLORS.primary : COLORS.surface, borderWidth: 1.5, borderColor: active ? COLORS.primary : COLORS.softMuted, alignItems: 'center', justifyContent: 'center' }}>{active ? <Glyph name="check" size={13} color={COLORS.white} /> : null}</View><View style={{ flex: 1, gap: 3 }}><Text selectable style={{ color: COLORS.ink, fontSize: 14, fontWeight: '700' }}>{task.title}</Text><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '600' }}>{task.project} · {task.estimateMinutes} min</Text></View><Text style={{ color: active ? COLORS.primary : COLORS.softMuted, fontSize: 11, fontWeight: '900' }}>{active ? 'IN PLAN' : task.priority.toUpperCase()}</Text></Pressable>; })}</View>
        </View>

        <View style={{ gap: 13 }}>
          <View style={{ gap: 4 }}><Text style={{ color: COLORS.ink, fontSize: 20, fontWeight: '900' }}>Gentle routines</Text><Text style={{ color: COLORS.muted, fontSize: 13, fontWeight: '600' }}>Small promises that keep the day human.</Text></View>
          <View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.medium, paddingHorizontal: 16, boxShadow: SHADOW }}>{routines.filter((routine) => routine.active).map((routine) => { const done = isRoutineComplete(routine.id); return <Pressable key={routine.id} onPress={() => { if (!done) completeRoutine(routine.id); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.line }}><View style={{ width: 25, height: 25, borderRadius: 13, backgroundColor: done ? COLORS.mint : COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Glyph name={done ? 'check' : 'repeat'} size={14} color={done ? COLORS.mintInk : COLORS.primary} /></View><View style={{ flex: 1, gap: 3 }}><Text style={{ color: done ? COLORS.softMuted : COLORS.ink, fontSize: 14, fontWeight: '800', textDecorationLine: done ? 'line-through' : 'none' }}>{routine.title}</Text><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '600' }}>{routine.anchor} · {routine.estimateMinutes} min</Text></View><Text style={{ color: done ? COLORS.mintInk : COLORS.muted, fontSize: 11, fontWeight: '800' }}>{done ? 'DONE' : 'OPEN'}</Text></Pressable>; })}</View>
        </View>

        <View style={{ gap: 13 }}><Text style={{ color: COLORS.ink, fontSize: 20, fontWeight: '900' }}>Everything else</Text><View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.medium, paddingHorizontal: 16, boxShadow: SHADOW }}>{tasks.filter((task) => task.plannedDate === today && !todayPlan.dailyThree.includes(task.id)).map((task) => <TaskRow key={task.id} task={task} onToggle={() => toggleTask(task.id)} />)}</View></View>
      </ScrollView>
    </View>
  );
}
