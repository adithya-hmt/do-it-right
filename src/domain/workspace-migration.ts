import type { LegacyTaskV1, LegacyWorkspaceV1, Task, WorkspaceV2 } from '@/domain/types';

function parseLegacyTime(label: string): string | null {
  const match = label.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 1 || hour > 12 || minute > 59) return null;
  if (match[3].toUpperCase() === 'PM' && hour !== 12) hour += 12;
  if (match[3].toUpperCase() === 'AM' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function migrateTask(task: LegacyTaskV1, position: number): Task {
  const dueDate = task.plannedDate ?? (task.dueAt ? task.dueAt.slice(0, 10) : null);
  const dueTime = task.dueAt ? task.dueAt.slice(11, 16) : parseLegacyTime(task.due);
  return { ...task, dueDate, dueTime, reminderAt: null, position };
}

function assertLegacyWorkspace(value: LegacyWorkspaceV1) {
  const collections = ['areas', 'projects', 'tasks', 'routines', 'routineCompletions', 'focusSessions', 'syncQueue'] as const;
  if (!value || typeof value !== 'object' || collections.some((key) => !Array.isArray(value[key])) || !value.profile || !value.dayPlans || !value.weeklyReviews) {
    throw new Error('Legacy FocusFlow workspace could not be migrated.');
  }
}

function validateCounts(legacy: LegacyWorkspaceV1, migrated: WorkspaceV2) {
  const keys = ['areas', 'projects', 'tasks', 'routines', 'routineCompletions', 'focusSessions', 'syncQueue'] as const;
  if (keys.some((key) => legacy[key].length !== migrated[key].length)) throw new Error('Legacy FocusFlow workspace could not be migrated without data loss.');
}

export function migrateWorkspaceV1(workspace: LegacyWorkspaceV1 | WorkspaceV2): WorkspaceV2 {
  if ('schemaVersion' in workspace && workspace.schemaVersion === 2) return workspace;
  assertLegacyWorkspace(workspace);
  const migrated: WorkspaceV2 = { ...workspace, schemaVersion: 2, tasks: workspace.tasks.map(migrateTask) };
  validateCounts(workspace, migrated);
  return migrated;
}
