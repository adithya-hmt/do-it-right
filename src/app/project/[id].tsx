import { router, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { SectionHeading } from '@/components/section-heading';
import { SurfaceCard } from '@/components/ui/surface-card';
import { TaskRow } from '@/components/task-row';
import { Glyph } from '@/components/ui/glyph';
import { COLORS, GUTTER, RADIUS } from '@/constants/theme';
import { useTasks } from '@/context/task-context';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { projects, tasks, toggleTask } = useTasks();
  const project = projects.find((item) => item.id === id);
  const projectTasks = tasks.filter((task) => task.projectId === id || task.project === project?.name);
  const openTasks = projectTasks.filter((task) => !task.completed);

  if (!project) return <View style={{ flex: 1, backgroundColor: COLORS.canvas, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: COLORS.ink, fontWeight: '800' }}>Project not found.</Text></View>;

  return <><Stack.Screen options={{ title: project.name }} /><ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: COLORS.canvas }} contentContainerStyle={{ padding: GUTTER, paddingTop: 18, paddingBottom: 42, gap: 22 }}><View style={{ backgroundColor: COLORS.contrast, borderRadius: RADIUS.large, padding: 20, gap: 16 }}><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><View style={{ width: 43, height: 43, borderRadius: 14, backgroundColor: project.color, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: COLORS.ink, fontSize: 20, fontWeight: '900' }}>{project.name.slice(0, 1)}</Text></View><Pressable onPress={() => router.push({ pathname: '/add-task', params: { projectId: project.id } })} style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: COLORS.contrastSurface, alignItems: 'center', justifyContent: 'center' }}><Glyph name="plus" size={17} color={COLORS.contrastText} /></Pressable></View><View style={{ gap: 7 }}><Text style={{ color: COLORS.contrastMuted, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 }}>{project.eyebrow}</Text><Text selectable style={{ color: COLORS.contrastText, fontSize: 29, lineHeight: 34, fontWeight: '900', letterSpacing: -0.8 }}>{project.name}</Text><Text style={{ color: COLORS.contrastMuted, fontSize: 13, lineHeight: 19, fontWeight: '600' }}>{project.outcome}</Text></View><View style={{ gap: 8 }}><View style={{ height: 7, borderRadius: 4, backgroundColor: COLORS.contrastSurface, overflow: 'hidden' }}><View style={{ width: `${Math.max(2, project.progress * 100)}%`, height: 7, borderRadius: 4, backgroundColor: project.color }} /></View><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: COLORS.contrastMuted, fontSize: 11, fontWeight: '800' }}>{project.tasksDone} of {project.tasksTotal} complete</Text><Text style={{ color: project.color, fontSize: 11, fontWeight: '900' }}>{Math.round(project.progress * 100)}%</Text></View></View></View><View style={{ gap: 12 }}><SectionHeading title="Project tasks" subtitle={`${openTasks.length} open · ${projectTasks.length} connected`} action="Add task" onAction={() => router.push({ pathname: '/add-task', params: { projectId: project.id } })} /><SurfaceCard style={{ paddingHorizontal: 16 }}>{projectTasks.length ? projectTasks.map((task) => <TaskRow key={task.id} task={task} onToggle={() => toggleTask(task.id)} onStart={() => router.push({ pathname: '/focus', params: { taskId: task.id } })} />) : <View style={{ alignItems: 'center', padding: 24, gap: 7 }}><Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '900' }}>No tasks yet.</Text><Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: '600' }}>Capture the next action for this direction.</Text></View>}</SurfaceCard></View></ScrollView></>;
}
