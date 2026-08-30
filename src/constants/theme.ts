import { Platform } from 'react-native';

import { createAppearanceColors, DIR_PALETTES } from '@/domain/appearance';
import type { ThemePreference } from '@/domain/types';

function buildColors(mode: 'light' | 'dark', accent: string = DIR_PALETTES.warm) {
  const adaptive = createAppearanceColors(accent, mode);
  const dark = mode === 'dark';
  return {
    canvas: adaptive.canvas,
    surface: adaptive.surface,
    ink: adaptive.ink,
    muted: adaptive.muted,
    softMuted: adaptive.softMuted,
    line: adaptive.line,
    primary: adaptive.primary,
    primarySoft: adaptive.primarySoft,
    coral: adaptive.danger,
    coralSoft: dark ? '#4A2922' : '#F9E5DC',
    lavender: adaptive.primarySoft,
    lavenderInk: adaptive.primary,
    mint: dark ? '#203A2D' : '#E4F0E7',
    mintInk: adaptive.success,
    amber: adaptive.warning,
    white: '#FFFFFF',
    contrast: dark ? '#171716' : '#1F1F1F',
    contrastText: '#FFF9EF',
    contrastMuted: dark ? '#C9C1B7' : '#CFC8BE',
    contrastSurface: dark ? '#302D29' : '#38332D',
    contrastLine: dark ? '#403B36' : '#4B443C',
    onAccent: adaptive.onAccent,
    danger: adaptive.danger,
    success: adaptive.success,
    warning: adaptive.warning,
    info: adaptive.info,
    sage: adaptive.sage,
    clay: adaptive.clay,
    stone: adaptive.stone,
  };
}

export const LIGHT_COLORS = buildColors('light');
export const DARK_COLORS = buildColors('dark');
export type ThemeColors = typeof LIGHT_COLORS;
export const COLORS: ThemeColors = { ...LIGHT_COLORS };

export function applyTheme(theme: ThemePreference | 'dark' | 'light', accent: string = DIR_PALETTES.warm) {
  Object.assign(COLORS, buildColors(theme === 'dark' ? 'dark' : 'light', accent));
}

export const FONTS = Platform.select({
  ios: { sans: 'system-ui', rounded: 'ui-rounded', mono: 'ui-monospace' },
  web: { sans: 'Inter, system-ui, -apple-system, sans-serif', rounded: 'Inter, system-ui, sans-serif', mono: 'ui-monospace' },
  default: { sans: 'sans-serif', rounded: 'sans-serif-medium', mono: 'monospace' },
});

export const SHADOW = '0 3px 12px rgba(31, 31, 31, 0.08)';
export const DEEP_SHADOW = '0 12px 28px rgba(31, 31, 31, 0.18)';
export const RADIUS = { small: 9, medium: 14, large: 22, pill: 999 } as const;
export const GUTTER = 20;
