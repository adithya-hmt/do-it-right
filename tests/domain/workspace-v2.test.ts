import {
  addWorkspaceTask,
  assignTaskProject,
  cancelWorkspaceTask,
  changeTaskPriority,
  completeWorkspaceTask,
  editWorkspaceTask,
  scheduleWorkspaceTask,
  undoWorkspaceTask,
} from '@/domain/task-commands';
import { migrateWorkspaceV1 } from '@/domain/workspace-migration';
import {
  getCompletedTasks,
  getInboxTasks,
  getOverdueTasks,
  getProjectTasks,
  getTodayTasks,
  getUpcomingTasks,
  searchTasks,
} from '@/domain/workspace-selectors';
import { buildSeedWorkspace } from '@/domain/workspace';
import type { LegacyWorkspaceV1, Task } from '@/domain/types';

function legacyWorkspace(): LegacyWorkspaceV1 {
  const current = buildSeedWorkspace('2026-08-28');
  return {
    profile: current.profile,
    areas: current.areas,
    projects: current.projects,
    tasks: current.tasks.map(({ dueDate: _dueDate, dueTime: _dueTime, reminderAt: _reminderAt, position: _position, ...task }) => task),
    dayPlans: current.dayPlans,
    routines: current.routines,
    routineCompletions: current.routineCompletions,
    focusSessions: current.focusSessions,
    weeklyReviews: current.weeklyReviews,
    syncQueue: current.syncQueue,
    syncCursor: current.syncCursor,
  };
}

describe('workspace v2 migration', () => {
  test('preserves every entity and id while adding explicit scheduling fields', () => {
    const legacy = legacyWorkspace();
    const migrated = migrateWorkspaceV1(legacy);

    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.tasks).toHaveLength(legacy.tasks.length);
    expect(migrated.projects).toHaveLength(legacy.projects.length);
    expect(migrated.routines).toHaveLength(legacy.routines.length);
    expect(migrated.focusSessions).toHaveLength(legacy.focusSessions.length);
    expect(migrated.tasks.map((task) => task.id)).toEqual(legacy.tasks.map((task) => task.id));
    expect(migrated.tasks[0]).toMatchObject({ dueDate: '2026-08-28', dueTime: '10:00', reminderAt: null, position: 0 });
  });

  test('is idempotent for an already migrated workspace', () => {
    const migrated = migrateWorkspaceV1(legacyWorkspace());
    expect(migrateWorkspaceV1(migrated)).toEqual(migrated);
  });
});

function task(overrides: Partial<Task>): Task {
  return {
    id: 'task', title: 'Write release notes', notes: '', projectId: null, project: 'Inbox', category: 'Work',
    status: 'inbox', due: 'Anytime', dueAt: null, plannedDate: null, dueDate: null, dueTime: null,
    reminderAt: null, position: 0, priority: 'medium', estimateMinutes: 25, completed: false,
    completedAt: null, syncState: 'clean', createdAt: '2026-08-27T08:00:00.000Z', updatedAt: '2026-08-27T08:00:00.000Z',
    ...overrides,
  };
}

describe('workspace selectors', () => {
  const tasks = [
    task({ id: 'inbox-scheduled', dueDate: '2026-08-30' }),
    task({ id: 'overdue', dueDate: '2026-08-27', status: 'planned' }),
    task({ id: 'today', title: 'Today design', dueDate: '2026-08-28', projectId: 'northstar', project: 'Northstar', status: 'planned' }),
    task({ id: 'future', dueDate: '2026-09-01', projectId: 'northstar', project: 'Northstar', status: 'planned' }),
    task({ id: 'done', dueDate: '2026-08-28', status: 'completed', completed: true, completedAt: '2026-08-28T09:00:00.000Z' }),
    task({ id: 'cancelled', dueDate: '2026-08-28', status: 'cancelled' }),
  ];

  test('returns scheduled projectless work in Inbox', () => expect(getInboxTasks(tasks).map((item) => item.id)).toEqual(['inbox-scheduled', 'overdue']));
  test('separates overdue from due today', () => {
    expect(getOverdueTasks(tasks, '2026-08-28').map((item) => item.id)).toEqual(['overdue']);
    expect(getTodayTasks(tasks, '2026-08-28').map((item) => item.id)).toEqual(['today']);
  });
  test('returns future work chronologically', () => expect(getUpcomingTasks(tasks, '2026-08-28').map((item) => item.id)).toEqual(['inbox-scheduled', 'future']));
  test('supports project, completed, and case-insensitive text queries', () => {
    expect(getProjectTasks(tasks, 'northstar').map((item) => item.id)).toEqual(['today', 'future']);
    expect(getCompletedTasks(tasks).map((item) => item.id)).toEqual(['done']);
    expect(searchTasks(tasks, 'DESIGN').map((item) => item.id)).toEqual(['today']);
  });
});

describe('task commands', () => {
  test('adds a stable positioned Inbox task without mutating the workspace', () => {
    const workspace = buildSeedWorkspace('2026-08-28');
    const next = addWorkspaceTask(workspace, { id: 'new', title: 'Capture idea', now: '2026-08-28T10:00:00.000Z' });
    expect(workspace.tasks.find((item) => item.id === 'new')).toBeUndefined();
    expect(next.tasks.at(-1)).toMatchObject({ id: 'new', projectId: null, dueDate: null, position: workspace.tasks.length, status: 'inbox' });
  });

  test('edits, schedules, assigns, prioritizes, completes, undoes, and cancels through pure commands', () => {
    const workspace = addWorkspaceTask(buildSeedWorkspace('2026-08-28'), { id: 'new', title: 'Draft', now: '2026-08-28T10:00:00.000Z' });
    const edited = editWorkspaceTask(workspace, 'new', { title: 'Draft launch copy', notes: 'Keep it brief' }, '2026-08-28T10:01:00.000Z');
    const scheduled = scheduleWorkspaceTask(edited, 'new', { dueDate: '2026-08-31', dueTime: '15:30', reminderAt: '2026-08-31T15:15:00.000Z' }, '2026-08-28T10:02:00.000Z');
    const assigned = assignTaskProject(scheduled, 'new', 'northstar', 'Northstar', '2026-08-28T10:03:00.000Z');
    const prioritized = changeTaskPriority(assigned, 'new', 'high', '2026-08-28T10:04:00.000Z');
    const completed = completeWorkspaceTask(prioritized, 'new', '2026-08-28T10:05:00.000Z');
    const undone = undoWorkspaceTask(completed, 'new', '2026-08-28T10:06:00.000Z');
    const cancelled = cancelWorkspaceTask(undone, 'new', '2026-08-28T10:07:00.000Z');

    expect(scheduled.tasks.at(-1)).toMatchObject({ dueDate: '2026-08-31', dueTime: '15:30', plannedDate: '2026-08-31', due: '3:30 PM' });
    expect(prioritized.tasks.at(-1)).toMatchObject({ title: 'Draft launch copy', projectId: 'northstar', project: 'Northstar', priority: 'high' });
    expect(completed.tasks.at(-1)).toMatchObject({ status: 'completed', completed: true, completedAt: '2026-08-28T10:05:00.000Z' });
    expect(undone.tasks.at(-1)).toMatchObject({ status: 'planned', completed: false, completedAt: null });
    expect(cancelled.tasks.at(-1)).toMatchObject({ status: 'cancelled', completed: false });
  });
});
