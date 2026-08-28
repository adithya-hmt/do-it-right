import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { AppHeader } from '@/components/app-header';
import { ProjectCard } from '@/components/project-card';
import { SectionHeading } from '@/components/section-heading';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Glyph } from '@/components/ui/glyph';
import { COLORS, GUTTER } from '@/constants/theme';
import { useTasks } from '@/context/task-context';

export default function ProjectsScreen() {
  const { projects, tasks, profile } = useTasks();
  const activeProjects = projects.filter((project) => project.status === 'active');
  const openTasks = tasks.filter((task) => !task.completed).length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const onTrack = activeProjects.length ? Math.round(activeProjects.reduce((sum, project) => sum + project.progress, 0) / activeProjects.length * 100) : 0;

  return <View style={{ flex: 1, backgroundColor: COLORS.canvas }}><ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 20, paddingBottom: 158, gap: 24 }}>
    <Animated.View entering={FadeInDown.duration(420)}><AppHeader eyebrow="Your workspace" title="Keep the big picture close." subtitle="Projects turn scattered tasks into a direction you can feel." profileInitial={profile.displayName.slice(0, 1).toUpperCase()} actionIcon="plus" onAction={() => router.push('../new-project')} /></Animated.View>

    <Animated.View entering={FadeInUp.delay(60).duration(430)} style={{ flexDirection: 'row', gap: 9 }}>{[{ value: String(activeProjects.length).padStart(2, '0'), label: 'active' }, { value: String(openTasks), label: 'open tasks' }, { value: `${onTrack}%`, label: 'in motion' }].map((stat, index) => <SurfaceCard key={stat.label} tone={index === 2 ? 'contrast' : 'surface'} style={{ flex: 1, padding: 14, gap: 8 }}><Text selectable style={{ color: index === 2 ? COLORS.primary : COLORS.ink, fontSize: 22, fontWeight: '900', fontVariant: ['tabular-nums'] }}>{stat.value}</Text><Text style={{ color: index === 2 ? COLORS.contrastMuted : COLORS.muted, fontSize: 11, lineHeight: 14, fontWeight: '800' }}>{stat.label}</Text></SurfaceCard>)}</Animated.View>

    <SurfaceCard style={{ padding: 18, gap: 14, backgroundColor: COLORS.primarySoft }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}><View style={{ width: 28, height: 28, borderRadius: 10, backgroundColor: COLORS.ink, alignItems: 'center', justifyContent: 'center' }}><Glyph name="trend" size={15} color={COLORS.primary} /></View><Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '900' }}>A little momentum goes a long way.</Text></View><Text style={{ color: COLORS.muted, fontSize: 12, lineHeight: 18, fontWeight: '600' }}>{completedTasks} tasks are wrapped across your workspace. Keep the next action smaller than the ambition.</Text></SurfaceCard>

    <View style={{ gap: 12 }}><SectionHeading title="Active projects" subtitle={`${activeProjects.length} directions with open work`} action="New project" onAction={() => router.push('../new-project')} /><View style={{ gap: 12 }}>{activeProjects.map((project, index) => <Animated.View key={project.id} entering={FadeInUp.delay(100 + index * 55).duration(420)}><ProjectCard project={project} onPress={() => router.push({ pathname: '/project/[id]', params: { id: project.id } })} /></Animated.View>)}</View></View>

    <View style={{ gap: 12 }}><SectionHeading title="Quiet projects" subtitle="Paused or completed directions" /><SurfaceCard style={{ paddingHorizontal: 16 }}>{projects.filter((project) => project.status !== 'active').length ? projects.filter((project) => project.status !== 'active').map((project) => <Pressable key={project.id} onPress={() => router.push({ pathname: '/project/[id]', params: { id: project.id } })} style={{ minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: COLORS.line }}><View style={{ width: 31, height: 31, borderRadius: 10, backgroundColor: project.softColor, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: project.color, fontSize: 14, fontWeight: '900' }}>{project.name.slice(0, 1)}</Text></View><View style={{ flex: 1, gap: 3 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '800' }}>{project.name}</Text><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '700' }}>{project.status}</Text></View><Glyph name="chevron" size={14} color={COLORS.softMuted} /></Pressable>) : <View style={{ alignItems: 'center', padding: 20, gap: 6 }}><Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '900' }}>Nothing parked.</Text><Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: '600' }}>Projects you pause will appear here.</Text></View>}</SurfaceCard></View>
  </ScrollView></View>;
}
