import React from 'react';
import { Text, type TextStyle } from 'react-native';

import { COLORS } from '@/constants/theme';

export type GlyphName =
  | 'today'
  | 'projects'
  | 'insights'
  | 'plus'
  | 'check'
  | 'arrow'
  | 'spark'
  | 'clock'
  | 'chevron'
  | 'dots'
  | 'close'
  | 'trend'
  | 'target';

const GLYPHS: Record<GlyphName, string> = {
  today: '◉',
  projects: '▦',
  insights: '↗',
  plus: '+',
  check: '✓',
  arrow: '↗',
  spark: '✦',
  clock: '◷',
  chevron: '⌄',
  dots: '•••',
  close: '×',
  trend: '⌁',
  target: '◎',
};

export function Glyph({
  name,
  size = 18,
  color = COLORS.ink,
  style,
}: {
  name: GlyphName;
  size?: number;
  color?: string;
  style?: TextStyle;
}) {
  return (
    <Text
      accessibilityLabel={name}
      style={[{ color, fontSize: size, lineHeight: size + 3, fontWeight: '800' }, style]}>
      {GLYPHS[name]}
    </Text>
  );
}
