import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, RADIUS } from '@/constants/theme';
import { BrandMark } from '@/components/ui/brand-mark';
import { Glyph, type GlyphName } from '@/components/ui/glyph';

export function AppHeader({ eyebrow, title, subtitle, profileInitial, actionIcon, onAction }: { eyebrow: string; title: string; subtitle?: string; profileInitial?: string; actionIcon?: GlyphName; onAction?: () => void }) {
  const insets = useSafeAreaInsets();
  // The tab scroll content already starts with 20dp of padding, so avoid
  // stacking the full status-bar inset on top of that spacing.
  const topInset = process.env.EXPO_OS === 'android' ? Math.max(0, insets.top - 14) : 0;
  return (
    <View style={{ gap: 18, paddingTop: topInset }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: COLORS.contrast, alignItems: 'center', justifyContent: 'center' }}>
            <BrandMark size={25} color={COLORS.primary} />
          </View>
          <View style={{ gap: 2 }}>
            <Text style={{ color: COLORS.ink, fontSize: 12, fontWeight: '900', letterSpacing: 1.2 }}>DIR · DO IT RIGHT</Text>
            <Text style={{ color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 0.4 }}>{eyebrow}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
          {actionIcon && onAction ? <Pressable accessibilityRole="button" accessibilityLabel={`Open ${actionIcon}`} onPress={onAction} hitSlop={8} style={({ pressed }) => [{ width: 38, height: 38, borderRadius: RADIUS.small, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.55 }]}><Glyph name={actionIcon} size={17} color={COLORS.ink} /></Pressable> : null}
          <Pressable accessibilityRole="button" accessibilityLabel="Open profile" onPress={() => router.push('/(tabs)/you')} style={({ pressed }) => [{ width: 38, height: 38, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }, pressed && { transform: [{ scale: 0.94 }] }]}>
            <Text style={{ color: COLORS.contrastText, fontSize: 13, fontWeight: '900' }}>{profileInitial ?? 'A'}</Text>
          </Pressable>
        </View>
      </View>
      <View style={{ gap: 7 }}>
        <Text selectable style={{ color: COLORS.ink, fontSize: 32, lineHeight: 35, fontWeight: '900', letterSpacing: -1.1 }}>{title}</Text>
        {subtitle ? <Text style={{ color: COLORS.muted, fontSize: 13, lineHeight: 19, fontWeight: '600' }}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}
