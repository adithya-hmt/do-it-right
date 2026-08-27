import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { ProjectCard } from '@/components/project-card';
import { TaskRow } from '@/components/task-row';
import { Glyph } from '@/components/ui/glyph';
import { COLORS, DEEP_SHADOW, GUTTER, RADIUS } from '@/constants/theme';
import { useTasks, type TaskCategory } from '@/context/task-context';

const FILTERS: ('All' | TaskCategory)[] = ['All', 'Work', 'Personal'];

export default function TodayScreen() {
  const { width } = useWindowDimensions();
  const { tasks, projects, toggleTask } = useTasks();
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>('All');
  const completed = tasks.filter((task) => task.completed).length;
  const visibleTasks = tasks.filter((task) => filter === 'All' || task.category === filter);
  const momentum = Math.min(96, 54 + completed * 7);
  const projectWidth = Math.min(Math.max(width - 76, 260), 338);

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
              <Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '900', letterSpacing: 1.7 }}>FOCUSFLOW</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.mintInk }} />
              <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: '700' }}>in rhythm</Text>
              <View style={{ width: 34, height: 34, borderRadius: RADIUS.pill, backgroundColor: COLORS.ink, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: COLORS.white, fontSize: 12, fontWeight: '900' }}>AM</Text>
              </View>
            </View>
          </View>

          <View style={{ gap: 7 }}>
            <Text selectable style={{ color: COLORS.ink, fontSize: 34, lineHeight: 39, fontWeight: '900', letterSpacing: -1 }}>
              Make room for{ '\n' }what matters.
            </Text>
            <Text style={{ color: COLORS.muted, fontSize: 14, fontWeight: '600' }}>
              Thursday, August 27  ·  a lighter way to work
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(90).duration(500)}
          style={{ minHeight: 188, borderRadius: RADIUS.large, backgroundColor: COLORS.ink, padding: 22, justifyContent: 'space-between', boxShadow: DEEP_SHADOW }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Glyph name="spark" size={14} color={COLORS.amber} />
              <Text style={{ color: COLORS.amber, fontSize: 11, fontWeight: '900', letterSpacing: 1.4 }}>MORNING BRIEF</Text>
            </View>
            <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.pill, backgroundColor: '#2A383F' }}>
              <Text style={{ color: '#C6D2D7', fontSize: 11, fontWeight: '800' }}>2h 40m focus window</Text>
            </View>
          </View>
          <View style={{ gap: 8 }}>
            <Text style={{ color: COLORS.white, fontSize: 23, lineHeight: 28, fontWeight: '800', letterSpacing: -0.4 }}>
              One meaningful thing{ '\n' }before the noise begins.
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 76, height: 5, backgroundColor: '#3A4A52', borderRadius: 5, overflow: 'hidden' }}>
                <View style={{ width: `${momentum}%`, height: 5, backgroundColor: COLORS.amber, borderRadius: 5 }} />
              </View>
              <Text selectable style={{ color: '#B4C0C6', fontSize: 12, fontWeight: '700' }}>{momentum}% momentum</Text>
            </View>
          </View>
        </Animated.View>

        <View style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View style={{ gap: 4 }}>
              <Text style={{ color: COLORS.ink, fontSize: 20, fontWeight: '900', letterSpacing: -0.3 }}>Your focus list</Text>
              <Text style={{ color: COLORS.muted, fontSize: 13, fontWeight: '600' }}>{completed} of {tasks.length} wrapped today</Text>
            </View>
            <Pressable onPress={() => router.push('/add-task')} hitSlop={8} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
              <Text style={{ color: COLORS.primary, fontSize: 13, fontWeight: '900' }}>See plan  →</Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {FILTERS.map((item) => {
              const active = filter === item;
              return (
                <Pressable key={item} onPress={() => setFilter(item)} style={({ pressed }) => [{ paddingVertical: 9, paddingHorizontal: 14, borderRadius: RADIUS.pill, backgroundColor: active ? COLORS.ink : COLORS.surface, borderWidth: active ? 0 : 1, borderColor: COLORS.line, opacity: pressed ? 0.72 : 1 }]}>
                  <Text style={{ color: active ? COLORS.white : COLORS.muted, fontSize: 12, fontWeight: '800' }}>{item}</Text>
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
            {projects.slice(0, 3).map((project) => <View key={project.id} style={{ width: projectWidth }}><ProjectCard project={project} compact /></View>)}
          </ScrollView>
        </View>

        <Pressable onPress={() => router.push('/add-task')} style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 54, borderRadius: RADIUS.medium, backgroundColor: COLORS.primary, boxShadow: DEEP_SHADOW, opacity: pressed ? 0.82 : 1 }]}>
          <View style={{ width: 23, height: 23, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#4B96DF' }}>
            <Glyph name="plus" size={18} color={COLORS.white} />
          </View>
          <Text style={{ color: COLORS.white, fontSize: 14, fontWeight: '900' }}>Capture a new task</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
