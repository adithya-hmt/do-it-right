import type { Task } from '@/domain/types';

function open(task: Task) {
  return !task.completed && task.status !== 'completed' && task.status !== 'cancelled';
}

function byPosition(left: Task, right: Task) {
  return (left.dueDate ?? '').localeCompare(right.dueDate ?? '') || left.position - right.position || left.createdAt.localeCompare(right.createdAt);
}

export function getInboxTasks<T extends Task>(tasks: T[]): T[] {
  return tasks.filter((task) => open(task) && task.projectId === null).sort((left, right) => left.position - right.position || left.createdAt.localeCompare(right.createdAt));
}

export function getOverdueTasks<T extends Task>(tasks: T[], today: string): T[] {
  return tasks.filter((task) => open(task) && task.dueDate !== null && task.dueDate < today).sort(byPosition);
}

export function getTodayTasks<T extends Task>(tasks: T[], today: string): T[] {
  return tasks.filter((task) => open(task) && task.dueDate === today).sort(byPosition);
}

export function getUpcomingTasks<T extends Task>(tasks: T[], today: string): T[] {
  return tasks.filter((task) => open(task) && task.dueDate !== null && task.dueDate > today).sort(byPosition);
}

export function getProjectTasks<T extends Task>(tasks: T[], projectId: string): T[] {
  return tasks.filter((task) => open(task) && task.projectId === projectId).sort(byPosition);
}

export function getCompletedTasks<T extends Task>(tasks: T[]): T[] {
  return tasks.filter((task) => task.completed || task.status === 'completed').sort((left, right) => (right.completedAt ?? '').localeCompare(left.completedAt ?? ''));
}

export function searchTasks<T extends Task>(tasks: T[], query: string): T[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return [];
  return tasks.filter((task) => task.status !== 'cancelled' && `${task.title} ${task.notes} ${task.project}`.toLocaleLowerCase().includes(normalized)).sort(byPosition);
}

export function groupTasksByDate<T extends Task>(tasks: T[]) {
  return tasks.reduce<Record<string, T[]>>((groups, task) => {
    if (!task.dueDate) return groups;
    groups[task.dueDate] = [...(groups[task.dueDate] ?? []), task];
    return groups;
  }, {});
}
