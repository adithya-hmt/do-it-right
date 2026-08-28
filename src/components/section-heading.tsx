import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { COLORS } from '@/constants/theme';
import { Glyph } from '@/components/ui/glyph';

export function SectionHeading({ title, subtitle, action, onAction }: { title: string; subtitle?: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
      <View style={{ flex: 1, gap: 4 }}>
        <Text selectable style={{ color: COLORS.ink, fontSize: 19, fontWeight: '900', letterSpacing: -0.35 }}>{title}</Text>
        {subtitle ? <Text style={{ color: COLORS.muted, fontSize: 12, lineHeight: 17, fontWeight: '600' }}>{subtitle}</Text> : null}
      </View>
      {action && onAction ? <Pressable onPress={onAction} hitSlop={8} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 5, opacity: pressed ? 0.55 : 1 })}><Text style={{ color: COLORS.ink, fontSize: 12, fontWeight: '900' }}>{action}</Text><Glyph name="arrow" size={14} color={COLORS.primary} /></Pressable> : null}
    </View>
  );
}
