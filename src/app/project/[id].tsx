import { router, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { TaskRow } from '@/components/task-row';
import { Glyph } from '@/components/ui/glyph';
import { COLORS, GUTTER, RADIUS, SHADOW } from '@/constants/theme';
import { useTasks } from '@/context/task-context';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { projects, tasks, toggleTask } = useTasks();
  const project = projects.find((item) => item.id === id);
  const projectTasks = tasks.filter((task) => task.projectId === id || task.project === project?.name);

  if (!project) return <View style={{ flex: 1, backgroundColor: COLORS.canvas, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: COLORS.ink, fontWeight: '800' }}>Project not found.</Text></View>;

  return <><Stack.Screen options={{ title: project.name }} /><ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: COLORS.canvas }} contentContainerStyle={{ padding: GUTTER, paddingTop: 20, paddingBottom: 40, gap: 22 }}><View style={{ backgroundColor: `${project.color}24`, borderRadius: RADIUS.large, padding: 20, gap: 12 }}><View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: project.color, fontSize: 20, fontWeight: '900' }}>{project.name.slice(0, 1)}</Text></View><Text selectable style={{ color: COLORS.ink, fontSize: 30, lineHeight: 35, fontWeight: '900', letterSpacing: -0.8 }}>{project.name}</Text><Text style={{ color: COLORS.muted, fontSize: 14, lineHeight: 20, fontWeight: '600' }}>{project.outcome}</Text><View style={{ height: 7, borderRadius: 4, backgroundColor: COLORS.surface, overflow: 'hidden' }}><View style={{ width: `${project.progress * 100}%`, height: 7, borderRadius: 4, backgroundColor: project.color }} /></View><Text style={{ color: project.color, fontSize: 12, fontWeight: '900' }}>{project.tasksDone} of {project.tasksTotal} tasks complete</Text></View><View style={{ gap: 12 }}><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><View style={{ gap: 4 }}><Text style={{ color: COLORS.ink, fontSize: 20, fontWeight: '900' }}>Project tasks</Text><Text style={{ color: COLORS.muted, fontSize: 13, fontWeight: '600' }}>{projectTasks.length} connected tasks</Text></View><Pressable onPress={() => router.push('/add-task')}><Glyph name="plus" size={20} color={COLORS.primary} /></Pressable></View><View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.medium, paddingHorizontal: 16, boxShadow: SHADOW }}>{projectTasks.length ? projectTasks.map((task) => <TaskRow key={task.id} task={task} onToggle={() => toggleTask(task.id)} />) : <Text style={{ color: COLORS.muted, padding: 20, textAlign: 'center', fontWeight: '700' }}>No tasks yet. Capture the next action.</Text>}</View></View></ScrollView></>;
}
