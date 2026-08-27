import { Platform } from 'react-native';

export const COLORS = {
  canvas: '#F6F7F9',
  surface: '#FFFFFF',
  ink: '#18242B',
  muted: '#71808A',
  softMuted: '#A9B3B9',
  line: '#E6EAEF',
  primary: '#1976D2',
  primarySoft: '#E6F1FC',
  coral: '#F06A5F',
  coralSoft: '#FDEAE7',
  lavender: '#EAE8FF',
  lavenderInk: '#554C9E',
  mint: '#DDF4EA',
  mintInk: '#2F8060',
  amber: '#F6C86E',
  white: '#FFFFFF',
} as const;

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
