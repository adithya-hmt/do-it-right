import { Platform } from 'react-native';

import type { ThemePreference } from '@/domain/types';

export const LIGHT_COLORS = {
  canvas: '#F6F7F9',
  surface: '#FFFFFF',
  ink: '#18242B',
  muted: '#71808A',
  softMuted: '#A9B3B9',
  line: '#E6EAEF',
  primary: '#6D4AFF',
  primarySoft: '#EEE9FF',
  coral: '#F06A5F',
  coralSoft: '#FDEAE7',
  lavender: '#EAE8FF',
  lavenderInk: '#554C9E',
  mint: '#DDF4EA',
  mintInk: '#2F8060',
  amber: '#F6C86E',
  white: '#FFFFFF',
  contrast: '#18242B',
  contrastText: '#FFFFFF',
  contrastMuted: '#B4C0C6',
  contrastSurface: '#2A383F',
  contrastLine: '#3A4A52',
};

export const DARK_COLORS = {
  canvas: '#0F0E14',
  surface: '#181620',
  ink: '#F4F1FF',
  muted: '#AAA4B7',
  softMuted: '#777184',
  line: '#2D2937',
  primary: '#A996FF',
  primarySoft: '#2B2350',
  coral: '#FF8D86',
  coralSoft: '#4C292B',
  lavender: '#302651',
  lavenderInk: '#C9BFFF',
  mint: '#1D3D36',
  mintInk: '#85DDB5',
  amber: '#F6C86E',
  white: '#FFFFFF',
  contrast: '#231F2F',
  contrastText: '#FFFFFF',
  contrastMuted: '#B4C0C6',
  contrastSurface: '#332D42',
  contrastLine: '#453D58',
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

export const SHADOW = '0 4px 16px rgba(24, 36, 43, 0.07)';
export const DEEP_SHADOW = '0 10px 26px rgba(24, 36, 43, 0.13)';

export const RADIUS = {
  small: 12,
  medium: 18,
  large: 26,
  pill: 999,
} as const;

export const GUTTER = 20;
