import React from 'react';
import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { COLORS, RADIUS, SHADOW } from '@/constants/theme';

type SurfaceCardProps = ViewProps & {
  tone?: 'surface' | 'contrast' | 'primary';
  style?: StyleProp<ViewStyle>;
};

export function SurfaceCard({ tone = 'surface', style, ...props }: SurfaceCardProps) {
  const backgroundColor = tone === 'contrast' ? COLORS.contrast : tone === 'primary' ? COLORS.primarySoft : COLORS.surface;
  return <View {...props} style={[{ backgroundColor, borderRadius: RADIUS.medium, boxShadow: SHADOW }, style]} />;
}
