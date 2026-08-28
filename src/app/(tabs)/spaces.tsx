import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { WorkspaceHeader } from '@/components/workspace-list';
import { Glyph } from '@/components/ui/glyph';
import { SurfaceCard } from '@/components/ui/surface-card';
import { COLORS, GUTTER, RADIUS } from '@/constants/theme';
import { useTasks } from '@/context/task-context';

export default function SpacesScreen() {
  const { spaces, memberships, tasks, session } = useTasks();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - GUTTER * 2, 760);
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.canvas }}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ alignItems: 'center', paddingTop: 22, paddingBottom: 120 }}>
        <View style={{ width: contentWidth, gap: 24 }}>
          <WorkspaceHeader eyebrow="Together" title="Spaces" subtitle="A calm home for the work you share." action={{ icon: 'search', label: 'Search tasks', onPress: () => router.push('/search') }} />

          {!session ? (
            <View style={{ backgroundColor: COLORS.contrast, borderRadius: RADIUS.large, padding: 20, gap: 16 }}>
              <View style={{ width: 44, height: 44, borderRadius: 15, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}><Glyph name="people" size={21} color={COLORS.onAccent} /></View>
              <View style={{ gap: 6 }}><Text selectable style={{ color: COLORS.contrastText, fontSize: 21, fontWeight: '900' }}>Sign in to collaborate</Text><Text selectable style={{ color: COLORS.contrastMuted, fontSize: 13, lineHeight: 20, fontWeight: '600' }}>Invite family, colleagues, classmates, or peers when you are ready. Your personal tasks still work offline.</Text></View>
              <Pressable accessibilityRole="button" onPress={() => router.push('/account')} style={({ pressed }) => [{ minHeight: 50, borderRadius: RADIUS.medium, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.72 }]}><Text style={{ color: COLORS.onAccent, fontSize: 14, fontWeight: '900' }}>Sign in or create account</Text></Pressable>
            </View>
          ) : (
            <Pressable accessibilityRole="button" accessibilityLabel="Create a shared space" onPress={() => router.push('/new-space')} style={({ pressed }) => [{ minHeight: 56, borderRadius: RADIUS.medium, backgroundColor: COLORS.primary, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', gap: 11 }, pressed && { opacity: 0.75 }]}><Glyph name="plus" size={19} color={COLORS.onAccent} /><Text style={{ color: COLORS.onAccent, fontSize: 14, fontWeight: '900' }}>Create a shared space</Text></Pressable>
          )}

          <View style={{ gap: 10 }}>
            <Text selectable style={{ color: COLORS.ink, fontSize: 17, fontWeight: '900' }}>Your spaces</Text>
            {spaces.length ? spaces.filter((space) => !space.deletedAt).map((space) => {
              const memberCount = memberships.filter((member) => member.spaceId === space.id && member.status === 'active').length;
              const openCount = tasks.filter((task) => task.spaceId === space.id && !task.completed && task.status !== 'cancelled').length;
              return <Pressable key={space.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/space/[id]', params: { id: space.id } })} style={({ pressed }) => [pressed && { opacity: 0.68 }]}><SurfaceCard style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}><View style={{ width: 44, height: 44, borderRadius: 15, backgroundColor: `${space.color}22`, alignItems: 'center', justifyContent: 'center' }}><Glyph name="people" size={20} color={space.color} /></View><View style={{ flex: 1, gap: 4 }}><Text selectable style={{ color: COLORS.ink, fontSize: 15, fontWeight: '900' }}>{space.name}</Text><Text selectable style={{ color: COLORS.muted, fontSize: 12, fontWeight: '600' }}>{space.description || `${memberCount} ${memberCount === 1 ? 'member' : 'members'} · ${openCount} open`}</Text></View><Glyph name="chevron" size={17} color={COLORS.softMuted} /></SurfaceCard></Pressable>;
            }) : <SurfaceCard style={{ alignItems: 'center', padding: 28, gap: 8 }}><Glyph name="people" size={24} color={COLORS.primary} /><Text selectable style={{ color: COLORS.ink, fontSize: 15, fontWeight: '900' }}>Nothing shared yet</Text><Text selectable style={{ color: COLORS.muted, fontSize: 12, lineHeight: 18, textAlign: 'center', fontWeight: '600' }}>Personal work stays private. Shared spaces appear here only when you create or join one.</Text></SurfaceCard>}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
