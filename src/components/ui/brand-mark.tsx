import { Image } from 'expo-image';
import React from 'react';
import { type ColorValue, type ImageStyle } from 'react-native';

import { COLORS } from '@/constants/theme';

export function BrandMark({ size = 30, color = COLORS.primary, style }: { size?: number; color?: ColorValue; style?: ImageStyle }) {
  return (
    <Image
      accessibilityLabel="DIR right-path deer logo"
      source={require('../../../assets/brand/dir-mark-monochrome.png')}
      contentFit="contain"
      style={[{ width: size, height: size, tintColor: color }, style]}
    />
  );
}
