import React from 'react';
import { View, type ColorValue, type ViewStyle } from 'react-native';

import { COLORS } from '@/constants/theme';

/** Warm Focus' open-loop mark: momentum around one clear next thing. */
export function BrandMark({ size = 30, color = COLORS.primary, style }: { size?: number; color?: ColorValue; style?: ViewStyle }) {
  const stroke = Math.max(2, size * 0.105);
  const arcSize = size * 0.63;
  return (
    <View accessibilityLabel="FocusFlow logo" style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <View style={{ position: 'absolute', width: arcSize, height: arcSize, borderRadius: arcSize / 2, borderWidth: stroke, borderColor: color, borderRightColor: 'transparent', transform: [{ rotate: '-38deg' }], left: size * 0.07, top: size * 0.04 }} />
      <View style={{ position: 'absolute', width: arcSize, height: arcSize, borderRadius: arcSize / 2, borderWidth: stroke, borderColor: color, borderLeftColor: 'transparent', transform: [{ rotate: '-38deg' }], right: size * 0.07, bottom: size * 0.04 }} />
      <View style={{ width: Math.max(4, size * 0.18), height: Math.max(4, size * 0.18), borderRadius: size, backgroundColor: COLORS.ink }} />
    </View>
  );
}
