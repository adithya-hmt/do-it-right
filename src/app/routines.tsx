import { Stack } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Glyph } from '@/components/ui/glyph';
import { SurfaceCard } from '@/components/ui/surface-card';
import { COLORS, GUTTER } from '@/constants/theme';
import { useTasks } from '@/context/task-context';

export default function RoutinesScreen() {
  const { routines, completeRoutine, isRoutineComplete } = useTasks();
  return <><Stack.Screen options={{ title: 'Routines' }} /><View style={{ flex: 1, backgroundColor: COLORS.canvas }}><ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: GUTTER, gap: 18 }}><Text selectable style={{ color: COLORS.muted, fontSize: 13, lineHeight: 19, fontWeight: '600' }}>Small recurring promises. Tap once when today’s version is done.</Text><SurfaceCard style={{ paddingHorizontal: 15 }}>{routines.filter((routine) => routine.active).map((routine) => { const done = isRoutineComplete(routine.id); return <Pressable key={routine.id} accessibilityRole="checkbox" accessibilityState={{ checked: done }} onPress={() => { if (!done) completeRoutine(routine.id); }} style={({ pressed }) => [{ minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: COLORS.line }, pressed && { opacity: 0.62 }]}><View style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: done ? COLORS.mint : COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Glyph name={done ? 'check' : 'repeat'} size={16} color={done ? COLORS.mintInk : COLORS.primary} /></View><View style={{ flex: 1, gap: 3 }}><Text selectable style={{ color: done ? COLORS.softMuted : COLORS.ink, fontSize: 14, fontWeight: '800', textDecorationLine: done ? 'line-through' : 'none' }}>{routine.title}</Text><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '700' }}>{routine.anchor} · {routine.estimateMinutes} min</Text></View></Pressable>; })}</SurfaceCard></ScrollView></View></>;
}
