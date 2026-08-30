import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Glyph } from '@/components/ui/glyph';
import { COLORS, FONTS, RADIUS } from '@/constants/theme';
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
            gap: 12,
            paddingVertical: 13,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.line,
          },
        ]}>
        <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: task.completed }} accessibilityLabel={`${task.completed ? 'Reopen' : 'Complete'} ${task.title}`} onPress={onToggle} hitSlop={8} style={({ pressed }) => [{ width: 44, height: 44, marginLeft: -10, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.55 }]}><View
          style={{
            width: 24,
            height: 24,
            borderRadius: 8,
            borderWidth: 1.6,
            borderColor: task.completed ? COLORS.primary : PRIORITY_COLORS[task.priority],
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: task.completed ? COLORS.primary : COLORS.surface,
          }}>
          {task.completed ? <Glyph name="check" size={14} color={COLORS.white} /> : null}
        </View></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Open ${task.title}`} onPress={onOpen ?? onToggle} style={({ pressed }) => [{ flex: 1, gap: 4, minHeight: 44, justifyContent: 'center' }, pressed && { opacity: 0.6 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
            <Text
              selectable
              numberOfLines={2}
              style={{
                flex: 1,
                color: task.completed ? COLORS.softMuted : COLORS.ink,
                fontSize: 15,
                lineHeight: 20,
                fontWeight: '800',
                textDecorationLine: task.completed ? 'line-through' : 'none',
              }}>
              {task.title}
            </Text>
            <Text style={{ color: task.completed ? COLORS.softMuted : PRIORITY_COLORS[task.priority], fontFamily: FONTS.mono, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>{task.priority === 'high' ? 'MUST' : task.priority === 'medium' ? 'NEXT' : 'COULD'}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {task.project ? <Text numberOfLines={1} style={{ maxWidth: '52%', color: COLORS.muted, fontSize: 11, fontWeight: '700' }}>{task.project}</Text> : null}
            <Text style={{ color: COLORS.softMuted, fontFamily: FONTS.mono, fontSize: 10, fontWeight: '700' }}>{task.dueDate ? task.due ?? task.dueDate : 'OPEN'}</Text>
            <Text style={{ color: COLORS.softMuted, fontFamily: FONTS.mono, fontSize: 10, fontWeight: '700' }}>{task.estimateMinutes}M</Text>
          </View>
        </Pressable>
        {onStart && !task.completed ? <Pressable accessibilityRole="button" accessibilityLabel={`Start focus on ${task.title}`} onPress={onStart} hitSlop={8} style={({ pressed }) => [{ width: 38, height: 38, borderRadius: 12, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.55, transform: [{ scale: 0.94 }] }]}><Glyph name="play" size={13} color={COLORS.primary} /></Pressable> : <View style={{ width: 7, height: 7, borderRadius: RADIUS.pill, backgroundColor: PRIORITY_COLORS[task.priority] }} />}
      </View>
    </Animated.View>
  );
}
