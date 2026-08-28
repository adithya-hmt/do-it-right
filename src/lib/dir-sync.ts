import type { TaskV3 } from '@/domain/types';

export type DirTaskRow = {
  id: string;
  owner_id: string;
  space_id: string | null;
  project_id: string | null;
  created_by: string;
  assignee_id: string | null;
  title: string;
  notes: string;
  status: TaskV3['status'];
  due_date: string | null;
  due_time: string | null;
  reminder_at: string | null;
  priority: TaskV3['priority'];
  estimate_minutes: number;
  position: number;
  revision: number;
  client_mutation_id: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export function toDirTaskRow(task: TaskV3, ownerId: string, mutationId: string | null = null): DirTaskRow {
  return {
    id: task.id,
    owner_id: ownerId,
    space_id: task.spaceId,
    project_id: task.projectId,
    created_by: task.createdBy === 'local-profile' ? ownerId : task.createdBy,
    assignee_id: task.assigneeId,
    title: task.title,
    notes: task.notes,
    status: task.status,
    due_date: task.dueDate,
    due_time: task.dueTime,
    reminder_at: task.reminderAt,
    priority: task.priority,
    estimate_minutes: task.estimateMinutes,
    position: task.position,
    revision: task.revision,
    client_mutation_id: mutationId,
    completed_at: task.completedAt,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
    deleted_at: task.deletedAt,
  };
}

export function fromDirTaskRow(row: DirTaskRow, previous?: TaskV3): TaskV3 {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    projectId: row.project_id,
    project: previous?.project ?? (row.project_id ? 'Project' : 'Inbox'),
    category: previous?.category ?? 'Work',
    status: row.status,
    due: row.due_time ?? previous?.due ?? 'Anytime',
    dueAt: previous?.dueAt ?? null,
    plannedDate: row.due_date,
    dueDate: row.due_date,
    dueTime: row.due_time,
    reminderAt: row.reminder_at,
    position: row.position,
    priority: row.priority,
    estimateMinutes: row.estimate_minutes,
    completed: row.status === 'completed',
    completedAt: row.completed_at,
    syncState: 'clean',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    spaceId: row.space_id,
    createdBy: row.created_by,
    assigneeId: row.assignee_id,
    revision: row.revision,
    deletedAt: row.deleted_at,
  };
}

export function resolveTaskConflict(local: TaskV3, remote: TaskV3): TaskV3 {
  if (local.revision !== remote.revision) return local.revision > remote.revision ? local : remote;
  return new Date(local.updatedAt).getTime() >= new Date(remote.updatedAt).getTime() ? local : remote;
}

export function mergeDirTasks(localTasks: TaskV3[], rows: DirTaskRow[]) {
  const merged = new Map(localTasks.map((task) => [task.id, task]));
  for (const row of rows) {
    const local = merged.get(row.id);
    const remote = fromDirTaskRow(row, local);
    merged.set(row.id, local ? resolveTaskConflict(local, remote) : remote);
  }
  return [...merged.values()].filter((task) => !task.deletedAt);
}
