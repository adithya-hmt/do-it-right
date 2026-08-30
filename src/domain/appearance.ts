export type ResolvedAppearanceMode = 'light' | 'dark';

// The board's production palette: warm paper, terracotta action, and ink.
const DEFAULT_ACCENT = '#E06A3D';

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
  const canvas = dark ? '#1F1F1F' : '#F6F1E8';
  const surface = dark ? '#292724' : '#FFFDF8';
  const ink = dark ? '#FFF9EF' : '#1F1F1F';
  const onAccent = isReadablePair('#FFFFFF', primary) ? '#FFFFFF' : '#1F1F1F';
  return {
    canvas,
    surface,
    ink,
    muted: dark ? '#C9C1B7' : '#6B665F',
    softMuted: dark ? '#978F86' : '#9A9288',
    line: dark ? '#403B36' : '#E6E1D9',
    primary,
    onAccent,
    primarySoft: mix(primary, dark ? '#1F1F1F' : '#FFFFFF', dark ? 0.7 : 0.86),
    danger: dark ? '#F18A7B' : '#D64545',
    warning: dark ? '#F2C66E' : '#E0A800',
    success: dark ? '#8FD0A4' : '#2E7D5B',
    info: dark ? '#8CB6FF' : '#3F82F6',
    sage: dark ? '#91B79A' : '#6A946F',
    clay: dark ? '#CDB08D' : '#D8B98C',
    stone: dark ? '#514B44' : '#E6E1D9',
  } as const;
}

export const DIR_PALETTES = {
  warm: '#E06A3D',
  forest: '#2E7D5B',
  ocean: '#3F82F6',
  berry: '#9C3F67',
  gold: '#D8B98C',
} as const;
