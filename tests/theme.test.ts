import { applyTheme, COLORS } from '@/constants/theme';

describe('theme tokens', () => {
  afterEach(() => applyTheme('light'));

  test('keeps contrast surfaces dark when dark mode inverts reading colors', () => {
    applyTheme('dark');

    expect(COLORS.ink).toBe('#FFF9EF');
    expect(COLORS.contrast).toBe('#171716');
    expect(COLORS.contrastText).toBe('#FFF9EF');
  });

  test('restores the warm light palette and accepts a custom accent', () => {
    applyTheme('light');

    expect(COLORS.canvas).toBe('#F6F1E8');
    expect(COLORS.primary).toBe('#E06A3D');
    expect(COLORS.contrast).toBe('#1F1F1F');

    applyTheme('light', '#1976D2');
    expect(COLORS.primary).toBe('#1976D2');
  });
});
