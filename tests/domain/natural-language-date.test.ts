import { parseNaturalLanguageDate } from '@/domain/natural-language-date';

describe('natural language date parser', () => {
  const now = new Date(2026, 7, 28, 9, 0, 0);

  test('recognizes today with a 12-hour time and leaves remaining title visible', () => {
    expect(parseNaturalLanguageDate('Send draft today 3pm', now)).toEqual({
      sourceText: 'Send draft today 3pm',
      title: 'Send draft',
      tokens: [{ text: 'today', kind: 'date' }, { text: '3pm', kind: 'time' }],
      dueDate: '2026-08-28',
      dueTime: '15:00',
    });
  });

  test('recognizes tomorrow and next Monday across a month boundary', () => {
    expect(parseNaturalLanguageDate('Call Sam tomorrow', now)).toMatchObject({ title: 'Call Sam', dueDate: '2026-08-29', dueTime: null });
    expect(parseNaturalLanguageDate('Plan sprint next Monday', now)).toMatchObject({ title: 'Plan sprint', dueDate: '2026-08-31', dueTime: null });
  });

  test('does not consume invalid or unrecognized scheduling text', () => {
    expect(parseNaturalLanguageDate('Review someday at 25pm', now)).toEqual({
      sourceText: 'Review someday at 25pm', title: 'Review someday at 25pm', tokens: [], dueDate: null, dueTime: null,
    });
  });
});
