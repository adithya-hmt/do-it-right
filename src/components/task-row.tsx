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

export function TaskRow({ task, onToggle, onStart, onOpen }: { task: Task; onToggle: () => void; onStart?: () => void; onOpen?: () => void }) {
  return (
    <Animated.View entering={FadeIn.duration(260)} exiting={FadeOut.duration(160)}>
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 13,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.line,
          },
        ]}>
        <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: task.completed }} accessibilityLabel={`${task.completed ? 'Reopen' : 'Complete'} ${task.title}`} onPress={onToggle} hitSlop={8} style={({ pressed }) => [{ width: 44, height: 44, marginLeft: -10, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.55 }]}><View
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
        </View></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Open ${task.title}`} onPress={onOpen ?? onToggle} style={({ pressed }) => [{ flex: 1, gap: 4, minHeight: 44, justifyContent: 'center' }, pressed && { opacity: 0.6 }]}>
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
            <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: '600' }}>{task.dueDate ? `${task.dueDate}${task.dueTime ? ` · ${task.due}` : ''}` : 'No date'}</Text>
          </View>
        </Pressable>
        {onStart && !task.completed ? <Pressable accessibilityRole="button" accessibilityLabel={`Start focus on ${task.title}`} onPress={onStart} hitSlop={8} style={({ pressed }) => [{ width: 30, height: 30, borderRadius: 10, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.55 }]}><Glyph name="play" size={10} color={COLORS.ink} /></Pressable> : <View style={{ width: 7, height: 7, borderRadius: RADIUS.pill, backgroundColor: PRIORITY_COLORS[task.priority] }} />}
      </View>
    </Animated.View>
  );
}
