export type ResolvedAppearanceMode = 'light' | 'dark';

const DEFAULT_ACCENT = '#C44F2B';

function parseHex(value: string) {
  const match = value.trim().match(/^#([0-9a-f]{6})$/i);
  if (!match) return null;
  return [0, 2, 4].map((offset) => Number.parseInt(match[1].slice(offset, offset + 2), 16)) as [number, number, number];
}

function luminance(value: string) {
  const rgb = parseHex(value);
  if (!rgb) return 0;
  const channels = rgb.map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function isReadablePair(foreground: string, background: string, minimum = 4.5) {
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05) >= minimum;
}

function mix(color: string, target: string, amount: number) {
  const sourceRgb = parseHex(color) ?? parseHex(DEFAULT_ACCENT)!;
  const targetRgb = parseHex(target)!;
  const result = sourceRgb.map((channel, index) => Math.round(channel + (targetRgb[index] - channel) * amount));
  return `#${result.map((channel) => channel.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

export function createAppearanceColors(accent: string, mode: ResolvedAppearanceMode) {
  const primary = parseHex(accent) ? accent.toUpperCase() : DEFAULT_ACCENT;
  const dark = mode === 'dark';
  const canvas = dark ? '#191714' : '#F7F2E8';
  const surface = dark ? '#24211D' : '#FFFCF5';
  const ink = dark ? '#FFF9EF' : '#24211D';
  const onAccent = isReadablePair('#FFFFFF', primary) ? '#FFFFFF' : '#1C1713';
  return {
    canvas,
    surface,
    ink,
    muted: dark ? '#BDB4A8' : '#6F675E',
    softMuted: dark ? '#8F877E' : '#9B9288',
    line: dark ? '#3B3731' : '#E7DED1',
    primary,
    onAccent,
    primarySoft: mix(primary, dark ? '#191714' : '#FFFFFF', dark ? 0.7 : 0.86),
    danger: dark ? '#FF9A85' : '#A83A2B',
    warning: dark ? '#F0C56B' : '#806018',
    success: dark ? '#7FD0A5' : '#246C4B',
  } as const;
}

export const DIR_PALETTES = {
  warm: '#C44F2B',
  forest: '#3F7352',
  ocean: '#1976D2',
  berry: '#9C3F67',
  gold: '#8A6416',
} as const;
