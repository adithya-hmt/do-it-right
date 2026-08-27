import { Redirect, router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { ProjectCard } from '@/components/project-card';
import { TaskRow } from '@/components/task-row';
import { Glyph } from '@/components/ui/glyph';
import { COLORS, DEEP_SHADOW, GUTTER, RADIUS } from '@/constants/theme';
import { useTasks, type TaskCategory } from '@/context/task-context';
import { useCalendarCommitments } from '@/hooks/use-calendar-commitments';

const FILTERS: ('All' | TaskCategory)[] = ['All', 'Work', 'Personal'];

export default function TodayScreen() {
  const { width } = useWindowDimensions();
  const { tasks, projects, profile, todayPlan, toggleTask, syncStatus, syncMessage } = useTasks();
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>('All');
  const completed = tasks.filter((task) => task.completed).length;
  const visibleTasks = tasks.filter((task) => filter === 'All' || task.category === filter);
  const completionPercent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const dailyThree = todayPlan.dailyThree.map((id) => tasks.find((task) => task.id === id)).filter((task) => task && !task.completed);
  const { commitments, loading: calendarLoading } = useCalendarCommitments();
  const projectWidth = Math.min(Math.max(width - 76, 260), 338);
  const syncLabel = {
    loading: 'syncing',
    synced: 'cloud synced',
    demo: 'local demo',
    setup: 'setup needed',
    error: 'local backup',
  }[syncStatus];
  const syncDotColor = syncStatus === 'synced' ? COLORS.mintInk : syncStatus === 'loading' ? COLORS.amber : COLORS.coral;

  if (!profile.onboardingComplete) return <Redirect href="/onboarding" />;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.canvas }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 21, paddingBottom: 124, gap: 25 }}>
        <Animated.View entering={FadeInDown.duration(450)} style={{ gap: 22 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
              <View style={{ width: 27, height: 27, borderRadius: 9, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}>
                <Glyph name="spark" size={15} color={COLORS.white} />
              </View>
              <Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900', letterSpacing: 1.35 }}>DO IT RIGHT</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: syncDotColor }} />
              <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: '700' }}>{syncLabel}</Text>
              <View style={{ width: 34, height: 34, borderRadius: RADIUS.pill, backgroundColor: COLORS.contrast, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: COLORS.contrastText, fontSize: 12, fontWeight: '900' }}>AM</Text>
              </View>
            </View>
          </View>

          <View style={{ gap: 7 }}>
            <Text selectable style={{ color: COLORS.ink, fontSize: 34, lineHeight: 39, fontWeight: '900', letterSpacing: -1 }}>
              Good morning, {profile.displayName}.{ '\n' }Make room for what matters.
            </Text>
            <Text style={{ color: COLORS.muted, fontSize: 14, fontWeight: '600' }}>
              {todayPlan.intention || 'A lighter way to work'}
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(90).duration(500)}
          style={{ minHeight: 188, borderRadius: RADIUS.large, backgroundColor: COLORS.contrast, padding: 22, justifyContent: 'space-between', boxShadow: DEEP_SHADOW }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Glyph name="spark" size={14} color={COLORS.amber} />
              <Text style={{ color: COLORS.amber, fontSize: 11, fontWeight: '900', letterSpacing: 1.4 }}>MORNING BRIEF</Text>
            </View>
            <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.pill, backgroundColor: COLORS.contrastSurface }}>
              <Text style={{ color: COLORS.contrastMuted, fontSize: 11, fontWeight: '800' }}>2h 40m focus window</Text>
            </View>
          </View>
          <View style={{ gap: 8 }}>
            <Text style={{ color: COLORS.contrastText, fontSize: 23, lineHeight: 28, fontWeight: '800', letterSpacing: -0.4 }}>
              {profile.focusIntent}.{ '\n' }One meaningful thing before the noise begins.
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 76, height: 5, backgroundColor: COLORS.contrastLine, borderRadius: 5, overflow: 'hidden' }}>
                <View style={{ width: `${completionPercent}%`, height: 5, backgroundColor: COLORS.amber, borderRadius: 5 }} />
              </View>
              <Text selectable style={{ color: COLORS.contrastMuted, fontSize: 12, fontWeight: '700' }}>{completed} of {tasks.length} complete</Text>
            </View>
          </View>
        </Animated.View>

        {(syncStatus === 'setup' || syncStatus === 'error' || syncStatus === 'demo') && (
          <View style={{ borderRadius: RADIUS.medium, backgroundColor: COLORS.primarySoft, padding: 16, gap: 7 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Glyph name="spark" size={13} color={COLORS.primary} />
              <Text style={{ color: COLORS.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.3 }}>LOCAL BACKUP</Text>
            </View>
            <Text style={{ color: COLORS.ink, fontSize: 13, lineHeight: 19, fontWeight: '600' }}>
              {syncMessage ?? 'Cloud sync is not configured yet. Your tasks are safe on this device.'}
            </Text>
          </View>
        )}

        <View style={{ gap: 13 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <View style={{ gap: 4 }}>
              <Text style={{ color: COLORS.ink, fontSize: 20, fontWeight: '900', letterSpacing: -0.3 }}>Daily Three</Text>
              <Text style={{ color: COLORS.muted, fontSize: 13, fontWeight: '600' }}>{dailyThree.length} clear starts for today</Text>
            </View>
            <Pressable onPress={() => router.push('/plan')} hitSlop={8}><Text style={{ color: COLORS.primary, fontSize: 13, fontWeight: '900' }}>Shape it  →</Text></Pressable>
          </View>
          <View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.medium, paddingHorizontal: 16, boxShadow: '0 2px 10px rgba(24, 36, 43, 0.04)' }}>
            {dailyThree.length ? dailyThree.map((task) => task ? <Pressable key={task.id} onPress={() => router.push({ pathname: '/focus', params: { taskId: task.id } })} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.line }}><View style={{ width: 25, height: 25, borderRadius: 13, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Glyph name="play" size={11} color={COLORS.primary} /></View><View style={{ flex: 1, gap: 3 }}><Text selectable style={{ color: COLORS.ink, fontSize: 14, fontWeight: '800' }}>{task.title}</Text><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '600' }}>{task.project} · {task.estimateMinutes} min</Text></View><Text style={{ color: COLORS.primary, fontSize: 11, fontWeight: '900' }}>START</Text></Pressable> : null) : <Pressable onPress={() => router.push('/plan')} style={{ padding: 18, alignItems: 'center', gap: 6 }}><Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '800' }}>Choose the shape of today</Text><Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: '600' }}>Pick up to three clear starts in Plan.</Text></Pressable>}
          </View>
        </View>

        <View style={{ gap: 13 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Glyph name="calendar" size={17} color={COLORS.lavenderInk} /><Text style={{ color: COLORS.ink, fontSize: 18, fontWeight: '900' }}>Today around you</Text></View>
            <Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '800' }}>READ ONLY</Text>
          </View>
          <View style={{ backgroundColor: COLORS.lavender, borderRadius: RADIUS.medium, padding: 16, gap: 10 }}>
            {calendarLoading ? <Text style={{ color: COLORS.lavenderInk, fontSize: 13, fontWeight: '700' }}>Checking your calendar…</Text> : commitments.length ? commitments.slice(0, 4).map((commitment) => <View key={commitment.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: commitment.calendarColor ?? COLORS.lavenderInk }} /><Text style={{ flex: 1, color: COLORS.ink, fontSize: 13, fontWeight: '800' }}>{commitment.title}</Text><Text style={{ color: COLORS.lavenderInk, fontSize: 11, fontWeight: '800' }}>{new Date(commitment.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text></View>) : <View style={{ gap: 5 }}><Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '800' }}>No calendar commitments imported.</Text><Text style={{ color: COLORS.lavenderInk, fontSize: 12, lineHeight: 18, fontWeight: '600' }}>Your plan stays uncluttered. Connect a read-only calendar from You → Settings when you want context.</Text></View>}
          </View>
        </View>

        <View style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View style={{ gap: 4 }}>
              <Text style={{ color: COLORS.ink, fontSize: 20, fontWeight: '900', letterSpacing: -0.3 }}>Everything for today</Text>
              <Text style={{ color: COLORS.muted, fontSize: 13, fontWeight: '600' }}>{completed} of {tasks.length} wrapped today</Text>
            </View>
            <Pressable onPress={() => router.push('/plan')} hitSlop={8} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
              <Text style={{ color: COLORS.primary, fontSize: 13, fontWeight: '900' }}>Open plan  →</Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {FILTERS.map((item) => {
              const active = filter === item;
              return (
                  <Pressable key={item} onPress={() => setFilter(item)} style={({ pressed }) => [{ paddingVertical: 9, paddingHorizontal: 14, borderRadius: RADIUS.pill, backgroundColor: active ? COLORS.contrast : COLORS.surface, borderWidth: active ? 0 : 1, borderColor: COLORS.line, opacity: pressed ? 0.72 : 1 }]}>
                  <Text style={{ color: active ? COLORS.contrastText : COLORS.muted, fontSize: 12, fontWeight: '800' }}>{item}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.medium, paddingHorizontal: 16, boxShadow: '0 2px 10px rgba(24, 36, 43, 0.04)' }}>
            {visibleTasks.map((task) => <TaskRow key={task.id} task={task} onToggle={() => toggleTask(task.id)} />)}
          </View>
        </View>

        <View style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ gap: 4 }}>
              <Text style={{ color: COLORS.ink, fontSize: 20, fontWeight: '900', letterSpacing: -0.3 }}>Active projects</Text>
              <Text style={{ color: COLORS.muted, fontSize: 13, fontWeight: '600' }}>Keep the bigger picture close.</Text>
            </View>
            <Glyph name="arrow" size={20} color={COLORS.primary} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 13, paddingVertical: 2 }}>
            {projects.slice(0, 3).map((project) => <View key={project.id} style={{ width: projectWidth }}><ProjectCard project={project} compact onPress={() => router.push({ pathname: '/project/[id]', params: { id: project.id } })} /></View>)}
          </ScrollView>
        </View>

        <Pressable onPress={() => router.push('/add-task')} style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 54, borderRadius: RADIUS.medium, backgroundColor: COLORS.primary, boxShadow: DEEP_SHADOW, opacity: pressed ? 0.82 : 1 }]}>
          <View style={{ width: 23, height: 23, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.16)' }}>
            <Glyph name="plus" size={18} color={COLORS.white} />
          </View>
          <Text style={{ color: COLORS.white, fontSize: 14, fontWeight: '900' }}>Capture a new task</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
