import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { WorkspaceHeader } from '@/components/workspace-list';
import { Glyph, type GlyphName } from '@/components/ui/glyph';
import { SurfaceCard } from '@/components/ui/surface-card';
import { COLORS, GUTTER } from '@/constants/theme';
import { useTasks } from '@/context/task-context';

const TOOLS: { title: string; subtitle: string; icon: GlyphName; href: '/search' | '/daily-three' | '/focus' | '/routines' | '/review' | '/completed' | '/settings' }[] = [
  { title: 'Search', subtitle: 'Find tasks and notes', icon: 'search', href: '/search' },
  { title: 'Daily Three', subtitle: 'Choose today’s priorities', icon: 'target', href: '/daily-three' },
  { title: 'Focus', subtitle: 'Start a quiet session', icon: 'play', href: '/focus' },
  { title: 'Routines', subtitle: 'Keep small promises visible', icon: 'repeat', href: '/routines' },
  { title: 'Weekly review', subtitle: 'Close loops without a score', icon: 'spark', href: '/review' },
  { title: 'Completed', subtitle: 'See finished work', icon: 'check', href: '/completed' },
  { title: 'Settings', subtitle: 'Theme, sync, account, and export', icon: 'settings', href: '/settings' },
];

export default function BrowseScreen() {
  const { projects, tasks } = useTasks();
  return <View style={{ flex: 1, backgroundColor: COLORS.canvas }}><ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 22, paddingBottom: 150, gap: 24 }}><WorkspaceHeader eyebrow="Workspace" title="Browse" subtitle="Projects and FocusFlow tools, all in one place." action={{ icon: 'settings', label: 'Open settings', onPress: () => router.push('/settings') }} /><View style={{ gap: 10 }}><Text style={{ color: COLORS.ink, fontSize: 17, fontWeight: '900' }}>Projects</Text><SurfaceCard style={{ paddingHorizontal: 15 }}>{projects.filter((project) => project.status !== 'archived').map((project) => { const projectTasks = tasks.filter((task) => task.projectId === project.id && task.status !== 'cancelled'); const done = projectTasks.filter((task) => task.completed).length; return <Pressable key={project.id} onPress={() => router.push({ pathname: '/project/[id]', params: { id: project.id } })} style={({ pressed }) => [{ minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: COLORS.line }, pressed && { opacity: 0.62 }]}><View style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: project.color }} /><View style={{ flex: 1, gap: 3 }}><Text selectable style={{ color: COLORS.ink, fontSize: 14, fontWeight: '800' }}>{project.name}</Text><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '700' }}>{done}/{projectTasks.length} complete · {project.status}</Text></View><Glyph name="chevron" size={15} color={COLORS.softMuted} /></Pressable>; })}<Pressable onPress={() => router.push('/new-project')} style={({ pressed }) => [{ minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 12 }, pressed && { opacity: 0.62 }]}><View style={{ width: 30, height: 30, borderRadius: 11, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Glyph name="plus" size={16} color={COLORS.primary} /></View><Text style={{ color: COLORS.primary, fontSize: 13, fontWeight: '900' }}>New project</Text></Pressable></SurfaceCard></View><View style={{ gap: 10 }}><Text style={{ color: COLORS.ink, fontSize: 17, fontWeight: '900' }}>FocusFlow</Text><SurfaceCard style={{ paddingHorizontal: 15 }}>{TOOLS.map((tool) => <Pressable key={tool.title} accessibilityRole="button" onPress={() => router.push(tool.href)} style={({ pressed }) => [{ minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: COLORS.line }, pressed && { opacity: 0.62 }]}><View style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Glyph name={tool.icon} size={16} color={COLORS.primary} /></View><View style={{ flex: 1, gap: 3 }}><Text selectable style={{ color: COLORS.ink, fontSize: 14, fontWeight: '800' }}>{tool.title}</Text><Text selectable style={{ color: COLORS.muted, fontSize: 11, fontWeight: '600' }}>{tool.subtitle}</Text></View><Glyph name="chevron" size={15} color={COLORS.softMuted} /></Pressable>)}</SurfaceCard></View></ScrollView></View>;
}
