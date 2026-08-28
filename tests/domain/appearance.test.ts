import { createAppearanceColors, isReadablePair } from '@/domain/appearance';

describe('adaptive DIR appearance', () => {
  test('creates readable light and dark tokens from a custom accent', () => {
    const light = createAppearanceColors('#1976D2', 'light');
    const dark = createAppearanceColors('#1976D2', 'dark');

    expect(light.canvas).toBe('#F7F2E8');
    expect(dark.canvas).toBe('#191714');
    expect(isReadablePair(light.onAccent, light.primary)).toBe(true);
    expect(isReadablePair(light.ink, light.canvas)).toBe(true);
    expect(isReadablePair(dark.onAccent, dark.primary)).toBe(true);
    expect(isReadablePair(dark.ink, dark.canvas)).toBe(true);
  });

  test('normalizes invalid custom colors to the warm DIR accent', () => {
    expect(createAppearanceColors('not-a-color', 'light').primary).toBe('#C44F2B');
  });
});
