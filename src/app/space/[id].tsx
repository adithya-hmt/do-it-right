import { router, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { TaskSection } from '@/components/workspace-list';
import { Glyph } from '@/components/ui/glyph';
import { SurfaceCard } from '@/components/ui/surface-card';
import { COLORS, GUTTER, RADIUS } from '@/constants/theme';
import { useTasks } from '@/context/task-context';
import type { TaskV3 } from '@/domain/types';

export default function SpaceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { spaces, memberships, projects, tasks, activity, toggleTask } = useTasks();
  const space = spaces.find((item) => item.id === id && !item.deletedAt);
  if (!space) return <View style={{ flex: 1, backgroundColor: COLORS.canvas, alignItems: 'center', justifyContent: 'center' }}><Text selectable style={{ color: COLORS.ink, fontWeight: '800' }}>Space not found.</Text></View>;
  const members = memberships.filter((member) => member.spaceId === space.id && member.status === 'active');
  const openTasks = tasks.filter((task) => task.spaceId === space.id && !task.completed && task.status !== 'cancelled');
  const spaceProjects = projects.filter((project) => project.spaceId === space.id && project.status !== 'archived');
  const recentActivity = activity.filter((event) => event.spaceId === space.id).slice(0, 6);
  const complete = (task: TaskV3) => toggleTask(task.id);

  return <>
    <Stack.Screen options={{ title: space.name }} />
    <View style={{ flex: 1, backgroundColor: COLORS.canvas }}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: GUTTER, paddingBottom: 110, gap: 24 }}>
        <View style={{ backgroundColor: space.color, borderRadius: RADIUS.large, padding: 20, gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}><View style={{ width: 46, height: 46, borderRadius: 16, backgroundColor: '#FFFFFF22', alignItems: 'center', justifyContent: 'center' }}><Glyph name="people" size={22} color="#FFFFFF" /></View><Pressable accessibilityRole="button" accessibilityLabel="Add people to space" onPress={() => router.push({ pathname: '/space-members', params: { spaceId: space.id } })} style={({ pressed }) => [{ minHeight: 44, paddingHorizontal: 13, borderRadius: 14, backgroundColor: '#FFFFFF22', flexDirection: 'row', alignItems: 'center', gap: 7 }, pressed && { opacity: 0.72 }]}><Glyph name="plus" size={16} color="#FFFFFF" /><Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '900' }}>Add people</Text></Pressable></View>
          <View style={{ gap: 5 }}><Text selectable style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '900', letterSpacing: -0.7 }}>{space.name}</Text><Text selectable style={{ color: '#FFFFFFCC', fontSize: 13, lineHeight: 19, fontWeight: '600' }}>{space.description || 'A shared place for the next right things.'}</Text></View>
          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '800' }}>{members.length} {members.length === 1 ? 'member' : 'members'} · {openTasks.length} open</Text>
        </View>

        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}><Text style={{ flex: 1, color: COLORS.ink, fontSize: 17, fontWeight: '900' }}>Projects</Text><Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/new-project', params: { spaceId: space.id } })} style={{ minHeight: 44, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}><Glyph name="plus" size={15} color={COLORS.primary} /><Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: '900' }}>New</Text></Pressable></View>
          {spaceProjects.length ? <SurfaceCard style={{ paddingHorizontal: 15 }}>{spaceProjects.map((project) => <Pressable accessibilityRole="button" key={project.id} onPress={() => router.push({ pathname: '/project/[id]', params: { id: project.id } })} style={({ pressed }) => [{ minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: COLORS.line }, pressed && { opacity: 0.65 }]}><View style={{ width: 10, height: 10, borderRadius: 4, backgroundColor: project.color }} /><Text style={{ flex: 1, color: COLORS.ink, fontSize: 13, fontWeight: '800' }}>{project.name}</Text><Glyph name="chevron" size={15} color={COLORS.softMuted} /></Pressable>)}</SurfaceCard> : <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: '600' }}>Projects are optional. Use them when a shared outcome needs more than one task.</Text>}
        </View>

        <TaskSection title="Shared tasks" subtitle="Everyone sees the same current state" tasks={openTasks} onComplete={complete} emptyTitle="This space is clear" emptyBody="Add the first shared task without making a meeting out of it." />

        <View style={{ gap: 10 }}><Text style={{ color: COLORS.ink, fontSize: 17, fontWeight: '900' }}>People</Text><SurfaceCard style={{ paddingHorizontal: 15 }}>{members.slice(0, 5).map((member) => <View key={member.id} style={{ minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: 1, borderBottomColor: COLORS.line }}><View style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: member.avatarColor, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#FFFFFF', fontWeight: '900' }}>{member.displayName.slice(0, 1).toUpperCase()}</Text></View><View style={{ flex: 1, gap: 2 }}><Text selectable style={{ color: COLORS.ink, fontSize: 13, fontWeight: '800' }}>{member.displayName}</Text><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '700' }}>{member.role}</Text></View></View>)}</SurfaceCard></View>

        {recentActivity.length ? <View style={{ gap: 10 }}><Text style={{ color: COLORS.ink, fontSize: 17, fontWeight: '900' }}>Recent activity</Text><SurfaceCard style={{ paddingHorizontal: 15 }}>{recentActivity.map((event) => <View key={event.id} style={{ minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: 1, borderBottomColor: COLORS.line }}><Glyph name="activity" size={16} color={COLORS.primary} /><Text style={{ flex: 1, color: COLORS.ink, fontSize: 12, fontWeight: '700' }}>A task was {event.action}</Text><Text style={{ color: COLORS.muted, fontSize: 10, fontWeight: '700' }}>{new Date(event.createdAt).toLocaleDateString()}</Text></View>)}</SurfaceCard></View> : null}
      </ScrollView>
      <Pressable accessibilityRole="button" accessibilityLabel={`Add task to ${space.name}`} onPress={() => router.push({ pathname: '/add-task', params: { spaceId: space.id } })} style={({ pressed }) => [{ position: 'absolute', right: 20, bottom: 24, minHeight: 56, paddingHorizontal: 18, borderRadius: 19, backgroundColor: space.color, flexDirection: 'row', alignItems: 'center', gap: 9 }, pressed && { opacity: 0.76 }]}><Glyph name="plus" size={20} color="#FFFFFF" /><Text style={{ color: '#FFFFFF', fontWeight: '900' }}>Add task</Text></Pressable>
    </View>
  </>;
}
