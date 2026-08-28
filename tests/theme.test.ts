import { applyTheme, COLORS } from '@/constants/theme';

describe('theme tokens', () => {
  afterEach(() => applyTheme('light'));

  test('keeps contrast surfaces dark when dark mode inverts reading colors', () => {
    applyTheme('dark');

    expect(COLORS.ink).toBe('#FFF9EF');
    expect(COLORS.contrast).toBe('#24211D');
    expect(COLORS.contrastText).toBe('#FFF9EF');
  });

  test('restores the warm light palette and accepts a custom accent', () => {
    applyTheme('light');

    expect(COLORS.canvas).toBe('#F7F2E8');
    expect(COLORS.primary).toBe('#C44F2B');
    expect(COLORS.contrast).toBe('#24211D');

    applyTheme('light', '#1976D2');
    expect(COLORS.primary).toBe('#1976D2');
  });
});
