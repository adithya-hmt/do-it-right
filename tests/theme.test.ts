import { applyTheme, COLORS } from '@/constants/theme';

describe('theme tokens', () => {
  afterEach(() => applyTheme('light'));

  test('keeps contrast surfaces dark when dark mode inverts reading colors', () => {
    applyTheme('dark');

    expect(COLORS.ink).toBe('#F3F6EC');
    expect(COLORS.contrast).toBe('#F3F6EC');
    expect(COLORS.contrastText).toBe('#10140F');
  });

  test('restores the violet light palette', () => {
    applyTheme('light');

    expect(COLORS.canvas).toBe('#F1F2EC');
    expect(COLORS.primary).toBe('#B6EE4A');
    expect(COLORS.contrast).toBe('#171B16');
  });
});
