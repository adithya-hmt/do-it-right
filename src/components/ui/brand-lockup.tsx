import React from 'react';
import { Text, View, type ViewStyle } from 'react-native';

import { BrandMark } from '@/components/ui/brand-mark';
import { COLORS, FONTS } from '@/constants/theme';

export function BrandLockup({ size = 20, inverse = false, showTagline = true, style }: { size?: number; inverse?: boolean; showTagline?: boolean; style?: ViewStyle }) {
  const ink = inverse ? COLORS.contrastText : COLORS.ink;
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: Math.max(6, size * 0.4) }, style]}>
      <BrandMark size={size} color={COLORS.primary} />
      <View style={{ gap: 0 }}>
        <Text style={{ color: ink, fontSize: size * 0.72, lineHeight: size * 0.8, fontWeight: '900', letterSpacing: size * -0.025 }}>DIR</Text>
        {showTagline ? <Text style={{ color: COLORS.primary, fontFamily: FONTS.mono, fontSize: Math.max(7, size * 0.32), lineHeight: Math.max(9, size * 0.4), fontWeight: '800', letterSpacing: 0.35 }}>DO IT RIGHT</Text> : null}
      </View>
    </View>
  );
}
