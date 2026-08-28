import { applyTheme, COLORS } from '@/constants/theme';

describe('theme tokens', () => {
  afterEach(() => applyTheme('light'));

  test('keeps contrast surfaces dark when dark mode inverts reading colors', () => {
    applyTheme('dark');

    expect(COLORS.ink).toBe('#F9F7F2');
    expect(COLORS.contrast).toBe('#251E38');
    expect(COLORS.contrastText).toBe('#FFFFFF');
  });

  test('restores the violet light palette', () => {
    applyTheme('light');

    expect(COLORS.canvas).toBe('#F8F6F1');
    expect(COLORS.primary).toBe('#7057FF');
    expect(COLORS.contrast).toBe('#251E38');
  });
});
