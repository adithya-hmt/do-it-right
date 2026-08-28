import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Glyph } from '@/components/ui/glyph';
import { COLORS, RADIUS } from '@/constants/theme';
import type { Task } from '@/context/task-context';

const PRIORITY_COLORS = {
  high: COLORS.coral,
  medium: COLORS.primary,
  low: COLORS.softMuted,
};

export function TaskRow({ task, onToggle, onStart }: { task: Task; onToggle: () => void; onStart?: () => void }) {
  return (
    <Animated.View entering={FadeIn.duration(260)} exiting={FadeOut.duration(160)}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${task.completed ? 'Reopen' : 'Complete'} ${task.title}`}
        onPress={onToggle}
        style={({ pressed }) => [
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 13,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.line,
          },
          pressed && { opacity: 0.7 },
        ]}>
        <View
          style={{
            width: 23,
            height: 23,
            borderRadius: RADIUS.pill,
            borderWidth: 1.5,
            borderColor: task.completed ? COLORS.primary : PRIORITY_COLORS[task.priority],
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: task.completed ? COLORS.primary : COLORS.surface,
          }}>
          {task.completed ? <Glyph name="check" size={14} color={COLORS.white} /> : null}
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            selectable
            style={{
              color: task.completed ? COLORS.softMuted : COLORS.ink,
              fontSize: 15,
              lineHeight: 20,
              fontWeight: '700',
              textDecorationLine: task.completed ? 'line-through' : 'none',
            }}>
            {task.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: '600' }}>{task.project}</Text>
            <Text style={{ color: COLORS.line, fontSize: 12 }}>•</Text>
            <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: '600' }}>{task.due}</Text>
          </View>
        </View>
        {onStart && !task.completed ? <Pressable accessibilityRole="button" accessibilityLabel={`Start focus on ${task.title}`} onPress={onStart} hitSlop={8} style={({ pressed }) => [{ width: 30, height: 30, borderRadius: 10, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.55 }]}><Glyph name="play" size={10} color={COLORS.ink} /></Pressable> : <View style={{ width: 7, height: 7, borderRadius: RADIUS.pill, backgroundColor: PRIORITY_COLORS[task.priority] }} />}
      </Pressable>
    </Animated.View>
  );
}
