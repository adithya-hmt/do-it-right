import { Platform } from 'react-native';

import type { ThemePreference } from '@/domain/types';

export const LIGHT_COLORS = {
  canvas: '#F7F6FB',
  surface: '#FFFFFF',
  ink: '#211C2D',
  muted: '#756F82',
  softMuted: '#AAA4B8',
  line: '#E8E4F0',
  primary: '#7357E8',
  primarySoft: '#EEEAFE',
  coral: '#E67870',
  coralSoft: '#FBE9E7',
  lavender: '#F0EDFF',
  lavenderInk: '#5E4CA8',
  mint: '#DFF3EA',
  mintInk: '#2E7A60',
  amber: '#F4C76A',
  white: '#FFFFFF',
  contrast: '#251E38',
  contrastText: '#FFFFFF',
  contrastMuted: '#C8C0D6',
  contrastSurface: '#3B3158',
  contrastLine: '#51466F',
};

export const DARK_COLORS = {
  canvas: '#100D17',
  surface: '#191522',
  ink: '#F8F5FF',
  muted: '#AAA1BA',
  softMuted: '#776D87',
  line: '#2C2537',
  primary: '#A997FF',
  primarySoft: '#2D234E',
  coral: '#FF9389',
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
