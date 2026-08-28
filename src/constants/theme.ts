import { Platform } from 'react-native';

import type { ThemePreference } from '@/domain/types';

export const LIGHT_COLORS = {
  canvas: '#F8F6F1',
  surface: '#FFFEFB',
  ink: '#202027',
  muted: '#6F6C78',
  softMuted: '#A7A2AF',
  line: '#E8E4DC',
  primary: '#7057FF',
  primarySoft: '#EEEAFE',
  coral: '#FF6B5C',
  coralSoft: '#FFF0EC',
  lavender: '#EDE9FF',
  lavenderInk: '#5D4CC4',
  mint: '#DDF7EE',
  mintInk: '#237E66',
  amber: '#F2BB62',
  white: '#FFFFFF',
  contrast: '#251E38',
  contrastText: '#FFFFFF',
  contrastMuted: '#C8C0D6',
  contrastSurface: '#3B3158',
  contrastLine: '#51466F',
};

export const DARK_COLORS = {
  canvas: '#14131A',
  surface: '#201E27',
  ink: '#F9F7F2',
  muted: '#B4AFBD',
  softMuted: '#817B8B',
  line: '#34313B',
  primary: '#A99BFF',
  primarySoft: '#2D234E',
  coral: '#FF8D80',
  coralSoft: '#482A30',
  lavender: '#312553',
  lavenderInk: '#CBBEFF',
  mint: '#1D3A32',
  mintInk: '#86D9B5',
  amber: '#F5C86A',
  white: '#FFFFFF',
  contrast: '#251E38',
  contrastText: '#FFFFFF',
  contrastMuted: '#C8C0D6',
  contrastSurface: '#3B3158',
  contrastLine: '#51466F',
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

export const SHADOW = '0 8px 24px rgba(37, 30, 56, 0.07)';
export const DEEP_SHADOW = '0 14px 34px rgba(37, 30, 56, 0.16)';

export const RADIUS = {
  small: 12,
  medium: 18,
  large: 26,
  pill: 999,
} as const;

export const GUTTER = 20;
