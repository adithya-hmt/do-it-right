import { Platform } from 'react-native';

import type { ThemePreference } from '@/domain/types';

export const LIGHT_COLORS = {
  canvas: '#F1F2EC',
  surface: '#FAFBF7',
  ink: '#151814',
  muted: '#687064',
  softMuted: '#A0A89A',
  line: '#DEE3D9',
  primary: '#B6EE4A',
  primarySoft: '#E8F8BE',
  coral: '#D96D51',
  coralSoft: '#F8E4DA',
  lavender: '#E4E9DE',
  lavenderInk: '#56614F',
  mint: '#DDF0D4',
  mintInk: '#4E7A43',
  amber: '#E3AC4D',
  white: '#FFFFFF',
  contrast: '#171B16',
  contrastText: '#F5F7EE',
  contrastMuted: '#AAB4A5',
  contrastSurface: '#252D22',
  contrastLine: '#394333',
};

export const DARK_COLORS = {
  canvas: '#0E110E',
  surface: '#171B16',
  ink: '#F3F6EC',
  muted: '#A6B09F',
  softMuted: '#737D6E',
  line: '#2B3329',
  primary: '#B6EE4A',
  primarySoft: '#293A18',
  coral: '#F09270',
  coralSoft: '#432A21',
  lavender: '#263126',
  lavenderInk: '#BDCAA8',
  mint: '#1F3A1D',
  mintInk: '#9DD989',
  amber: '#EAC064',
  white: '#FFFFFF',
  contrast: '#F3F6EC',
  contrastText: '#10140F',
  contrastMuted: '#5F6A5B',
  contrastSurface: '#E5EBDD',
  contrastLine: '#D0D9C7',
};

export type ThemeColors = typeof LIGHT_COLORS;

export const COLORS: ThemeColors = { ...LIGHT_COLORS };

export function applyTheme(theme: ThemePreference | 'dark' | 'light') {
  Object.assign(COLORS, theme === 'dark' ? DARK_COLORS : LIGHT_COLORS);
}

export const FONTS = Platform.select({
  ios: { sans: 'system-ui', rounded: 'ui-rounded', mono: 'ui-monospace' },
  web: {
    sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: { sans: 'normal', rounded: 'normal', mono: 'monospace' },
});

export const SHADOW = '0 8px 24px rgba(20, 26, 18, 0.07)';
export const DEEP_SHADOW = '0 14px 34px rgba(20, 26, 18, 0.16)';

export const RADIUS = {
  small: 12,
  medium: 18,
  large: 26,
  pill: 999,
} as const;

export const GUTTER = 18;
