import { applyTheme, COLORS } from '@/constants/theme';

describe('theme tokens', () => {
  afterEach(() => applyTheme('light'));

  test('keeps contrast surfaces dark when dark mode inverts reading colors', () => {
    applyTheme('dark');

    expect(COLORS.ink).toBe('#F8F5FF');
    expect(COLORS.contrast).toBe('#251E38');
    expect(COLORS.contrastText).toBe('#FFFFFF');
  });

  test('restores the violet light palette', () => {
    applyTheme('light');

    expect(COLORS.canvas).toBe('#F7F6FB');
    expect(COLORS.primary).toBe('#7357E8');
    expect(COLORS.contrast).toBe('#251E38');
  });
});
