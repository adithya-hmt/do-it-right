import React from 'react';
import { View } from 'react-native';

import { COLORS, RADIUS } from '@/constants/theme';

export function ProgressBar({ value, color = COLORS.primary }: { value: number; color?: string }) {
  return (
    <View
      accessibilityLabel={`${Math.round(value * 100)} percent complete`}
      style={{ height: 7, borderRadius: RADIUS.pill, backgroundColor: COLORS.line, overflow: 'hidden' }}>
      <View
        style={{
          width: `${Math.min(Math.max(value, 0), 1) * 100}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: RADIUS.pill,
        }}
      />
    </View>
  );
}
