import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { ProjectCard } from '@/components/project-card';
import { Glyph } from '@/components/ui/glyph';
import { COLORS, GUTTER, RADIUS } from '@/constants/theme';
import { useTasks } from '@/context/task-context';

export default function ProjectsScreen() {
  const { projects } = useTasks();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.canvas }}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 23, paddingBottom: 124, gap: 24 }}>
        <Animated.View entering={FadeInDown.duration(420)} style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Glyph name="projects" size={17} color={COLORS.primary} />
            <Text style={{ color: COLORS.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.3 }}>WORKSPACE</Text>
          </View>
          <Text selectable style={{ color: COLORS.ink, fontSize: 34, lineHeight: 38, fontWeight: '900', letterSpacing: -1 }}>Projects with{ '\n' }a pulse.</Text>
          <Text style={{ color: COLORS.muted, fontSize: 14, lineHeight: 20, fontWeight: '600' }}>See what is moving, what is quiet, and where your attention can create the most lift.</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(80).duration(480)} style={{ flexDirection: 'row', gap: 10 }}>
          {[
            { value: '04', label: 'active' },
            { value: '12', label: 'due this week' },
            { value: '78%', label: 'on track' },
          ].map((stat, index) => (
            <View key={stat.label} style={{ flex: 1, backgroundColor: index === 2 ? COLORS.ink : COLORS.surface, borderRadius: RADIUS.medium, padding: 14, gap: 6 }}>
              <Text selectable style={{ color: index === 2 ? COLORS.amber : COLORS.ink, fontSize: 21, fontWeight: '900', fontVariant: ['tabular-nums'] }}>{stat.value}</Text>
              <Text style={{ color: index === 2 ? '#B4C0C6' : COLORS.muted, fontSize: 11, lineHeight: 14, fontWeight: '700' }}>{stat.label}</Text>
            </View>
          ))}
        </Animated.View>

        <View style={{ gap: 13 }}>
          {projects.map((project, index) => <Animated.View key={project.id} entering={FadeInUp.delay(120 + index * 55).duration(420)}><ProjectCard project={project} /></Animated.View>)}
        </View>
      </ScrollView>
    </View>
  );
}
