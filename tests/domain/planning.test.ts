import { chooseDailyThree, getEveningDecision } from '@/domain/planning';

const tasks = [
  { id: 'low', title: 'Walk', priority: 'low' as const, completed: false, plannedDate: '2026-08-27', createdAt: 1 },
  { id: 'high', title: 'Ship feature', priority: 'high' as const, completed: false, plannedDate: '2026-08-27', createdAt: 2 },
  { id: 'done', title: 'Already done', priority: 'high' as const, completed: true, plannedDate: '2026-08-27', createdAt: 0 },
  { id: 'medium', title: 'Reply to email', priority: 'medium' as const, completed: false, plannedDate: '2026-08-27', createdAt: 3 },
  { id: 'outside', title: 'Later', priority: 'high' as const, completed: false, plannedDate: '2026-08-28', createdAt: 4 },
];

describe('daily planning rules', () => {
  test('chooses at most three unfinished tasks for the requested day by priority', () => {
    expect(chooseDailyThree(tasks, '2026-08-27')).toEqual(['high', 'medium', 'low']);
  });

  test('turns unfinished work into a calm end-of-day decision', () => {
    expect(getEveningDecision('reschedule')).toEqual({ action: 'reschedule', label: 'Move to another day' });
    expect(getEveningDecision('inbox')).toEqual({ action: 'inbox', label: 'Return to inbox' });
    expect(getEveningDecision('drop')).toEqual({ action: 'drop', label: 'Let it go' });
  });
});
