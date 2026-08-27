import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { Glyph } from '@/components/ui/glyph';
import { COLORS, GUTTER, RADIUS, SHADOW } from '@/constants/theme';
import { useTasks } from '@/context/task-context';

export default function YouScreen() {
  const { profile, tasks, projects, areas, focusSessions, syncStatus, inboxCount } = useTasks();
  const completed = tasks.filter((task) => task.completed).length;
  const focusMinutes = focusSessions.reduce((total, session) => total + session.durationMinutes, 0);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.canvas }}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 24, paddingBottom: 124, gap: 24 }}>
        <Animated.View entering={FadeInDown.duration(420)} style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Glyph name="user" size={17} color={COLORS.primary} /><Text style={{ color: COLORS.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.3 }}>YOUR SPACE</Text></View>
          <Text selectable style={{ color: COLORS.ink, fontSize: 35, lineHeight: 39, fontWeight: '900', letterSpacing: -1 }}>Built around{ '\n' }your real life.</Text>
          <Text style={{ color: COLORS.muted, fontSize: 14, lineHeight: 20, fontWeight: '600' }}>Private by default. Useful enough to come back to.</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(70).duration(440)} style={{ backgroundColor: COLORS.contrast, borderRadius: RADIUS.large, padding: 20, gap: 18, boxShadow: SHADOW }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}><View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: profile.avatarColor, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: COLORS.contrastText, fontSize: 21, fontWeight: '900' }}>{profile.displayName.slice(0, 1).toUpperCase()}</Text></View><View style={{ flex: 1, gap: 4 }}><Text selectable style={{ color: COLORS.contrastText, fontSize: 21, fontWeight: '900' }}>{profile.displayName}</Text><Text style={{ color: COLORS.contrastMuted, fontSize: 12, fontWeight: '700' }}>{profile.email ?? 'Guest workspace'} · private profile</Text></View><Pressable accessibilityLabel="Open settings" onPress={() => router.push('/settings')}><Glyph name="settings" size={20} color={COLORS.contrastText} /></Pressable></View>
          <View style={{ height: 1, backgroundColor: COLORS.contrastLine }} />
          <Text style={{ color: COLORS.amber, fontSize: 13, lineHeight: 19, fontWeight: '800' }}>“{profile.focusIntent}.”</Text>
          <Pressable onPress={() => router.push('/settings')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={{ color: COLORS.contrastMuted, fontSize: 12, fontWeight: '800' }}>Shape your preferences</Text><Glyph name="arrow" size={16} color={COLORS.amber} /></Pressable>
        </Animated.View>

        <View style={{ gap: 12 }}><Text style={{ color: COLORS.ink, fontSize: 20, fontWeight: '900' }}>Your signals</Text><View style={{ flexDirection: 'row', gap: 9 }}>{[{ value: String(completed), label: 'completed' }, { value: `${focusMinutes}m`, label: 'focused' }, { value: String(inboxCount), label: 'in inbox' }].map((stat) => <View key={stat.label} style={{ flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.medium, padding: 15, gap: 6, boxShadow: SHADOW }}><Text selectable style={{ color: COLORS.ink, fontSize: 22, fontWeight: '900', fontVariant: ['tabular-nums'] }}>{stat.value}</Text><Text style={{ color: COLORS.muted, fontSize: 11, lineHeight: 14, fontWeight: '700' }}>{stat.label}</Text></View>)}</View></View>

        <View style={{ gap: 12 }}><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><View style={{ gap: 4 }}><Text style={{ color: COLORS.ink, fontSize: 20, fontWeight: '900' }}>Weekly reset</Text><Text style={{ color: COLORS.muted, fontSize: 13, fontWeight: '600' }}>Make sense of the week before it runs away.</Text></View><Glyph name="arrow" size={18} color={COLORS.primary} /></View><Pressable onPress={() => router.push('/review')} style={{ backgroundColor: COLORS.primarySoft, borderRadius: RADIUS.medium, padding: 17, flexDirection: 'row', alignItems: 'center', gap: 12 }}><View style={{ width: 35, height: 35, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}><Glyph name="spark" size={17} color={COLORS.white} /></View><View style={{ flex: 1, gap: 4 }}><Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '900' }}>Review what had your attention</Text><Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: '600' }}>A five-minute reset, no score attached.</Text></View><Glyph name="chevron" size={16} color={COLORS.primary} /></Pressable></View>

        <View style={{ gap: 12 }}><Text style={{ color: COLORS.ink, fontSize: 20, fontWeight: '900' }}>Life areas</Text><View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.medium, paddingHorizontal: 16, boxShadow: SHADOW }}>{areas.filter((area) => !area.archivedAt).map((area) => <View key={area.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.line }}><View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: `${area.color}18`, alignItems: 'center', justifyContent: 'center' }}><Glyph name={area.icon === 'briefcase' ? 'briefcase' : area.icon === 'heart' ? 'heart' : 'spark'} size={15} color={area.color} /></View><Text style={{ flex: 1, color: COLORS.ink, fontSize: 14, fontWeight: '800' }}>{area.name}</Text><Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: '700' }}>{projects.filter((project) => project.areaId === area.id && project.status === 'active').length} projects</Text></View>)}</View></View>

        <View style={{ gap: 10 }}><Pressable onPress={() => router.push('/settings')} style={{ minHeight: 52, backgroundColor: COLORS.surface, borderRadius: RADIUS.medium, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12, boxShadow: SHADOW }}><Glyph name="settings" size={18} color={COLORS.muted} /><Text style={{ flex: 1, color: COLORS.ink, fontSize: 14, fontWeight: '800' }}>Settings & privacy</Text><Glyph name="chevron" size={16} color={COLORS.softMuted} /></Pressable><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }}><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: syncStatus === 'synced' ? COLORS.mintInk : COLORS.amber }} /><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '700' }}>{syncStatus === 'synced' ? 'Workspace synced privately' : 'Workspace saved locally'}</Text></View><Text style={{ textAlign: 'center', color: COLORS.softMuted, fontSize: 11, fontWeight: '600' }}>Do It Right · open source · MIT</Text></View>
      </ScrollView>
    </View>
  );
}
