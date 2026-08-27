import { applyTheme, COLORS } from '@/constants/theme';

describe('theme tokens', () => {
  afterEach(() => applyTheme('light'));

  test('keeps contrast surfaces dark when dark mode inverts reading colors', () => {
    applyTheme('dark');

    expect(COLORS.ink).toBe('#F4F1FF');
    expect(COLORS.contrast).toBe('#231F2F');
    expect(COLORS.contrastText).toBe('#FFFFFF');
  });

  test('restores the violet light palette', () => {
    applyTheme('light');

    expect(COLORS.canvas).toBe('#F6F7F9');
    expect(COLORS.primary).toBe('#6D4AFF');
    expect(COLORS.contrast).toBe('#18242B');
  });
});
