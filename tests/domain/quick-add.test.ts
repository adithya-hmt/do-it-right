import { parseQuickAdd } from '@/domain/quick-add';

describe('DIR quick add parser', () => {
  const now = new Date(2026, 7, 28, 9, 0, 0);

  test('proposes date, project, and assignee chips without changing source text', () => {
    const result = parseQuickAdd('Send deck tomorrow 3pm #Launch @Maya', {
      now,
      projects: [{ id: 'project-launch', name: 'Launch' }],
      members: [{ id: 'member-maya', displayName: 'Maya' }],
    });

    expect(result.sourceText).toBe('Send deck tomorrow 3pm #Launch @Maya');
    expect(result.tasks).toEqual([expect.objectContaining({
      title: 'Send deck', dueDate: '2026-08-29', dueTime: '15:00', projectId: 'project-launch', assigneeId: 'member-maya',
    })]);
    expect(result.tokens.map((token) => token.kind)).toEqual(['date', 'time', 'project', 'assignee']);
  });

  test('splits a reviewed voice transcript into several task proposals', () => {
    const result = parseQuickAdd('Buy groceries tomorrow; call Mira today 6pm', { now, projects: [], members: [] });
    expect(result.tasks).toEqual([
      expect.objectContaining({ title: 'Buy groceries', dueDate: '2026-08-29' }),
      expect.objectContaining({ title: 'call Mira', dueDate: '2026-08-28', dueTime: '18:00' }),
    ]);
  });

  test('leaves unknown project and member phrases in the title', () => {
    const result = parseQuickAdd('Ask @Unknown about #Maybe someday', { now, projects: [], members: [] });
    expect(result.tasks[0]).toMatchObject({ title: 'Ask @Unknown about #Maybe someday', projectId: null, assigneeId: null });
    expect(result.tokens).toEqual([]);
  });
});
