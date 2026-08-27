import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Glyph } from '@/components/ui/glyph';
import { ProgressBar } from '@/components/ui/progress-bar';
import { COLORS, RADIUS, SHADOW } from '@/constants/theme';
import type { Project } from '@/context/task-context';

export function ProjectCard({ project, compact = false }: { project: Project; compact?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        {
          backgroundColor: COLORS.surface,
          borderRadius: RADIUS.medium,
          padding: compact ? 17 : 20,
          gap: compact ? 12 : 16,
          boxShadow: SHADOW,
        },
        pressed && { opacity: 0.82, transform: [{ scale: 0.99 }] },
      ]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: project.softColor }}>
          <Text style={{ color: project.color, fontSize: 17, fontWeight: '900' }}>{project.name.slice(0, 1)}</Text>
        </View>
        <Glyph name="dots" size={13} color={COLORS.softMuted} style={{ letterSpacing: 2 }} />
      </View>
      <View style={{ gap: 5 }}>
        <Text style={{ color: COLORS.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.1 }}>{project.eyebrow}</Text>
        <Text selectable style={{ color: COLORS.ink, fontSize: compact ? 17 : 20, fontWeight: '800' }}>{project.name}</Text>
        {!compact ? <Text style={{ color: COLORS.muted, fontSize: 13, lineHeight: 18, fontWeight: '500' }}>{project.summary}</Text> : null}
      </View>
      <View style={{ gap: 8 }}>
        <ProgressBar value={project.progress} color={project.color} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: '700' }}>{project.tasksDone} / {project.tasksTotal} tasks</Text>
          <Text style={{ color: project.color, fontSize: 12, fontWeight: '800' }}>{Math.round(project.progress * 100)}%</Text>
        </View>
      </View>
    </Pressable>
  );
}
