import type { Task } from '@/domain/types';

function open(task: Task) {
  return !task.completed && task.status !== 'completed' && task.status !== 'cancelled';
}

function byPosition(left: Task, right: Task) {
  return (left.dueDate ?? '').localeCompare(right.dueDate ?? '') || left.position - right.position || left.createdAt.localeCompare(right.createdAt);
}

export function getInboxTasks(tasks: Task[]) {
  return tasks.filter((task) => open(task) && task.projectId === null).sort((left, right) => left.position - right.position || left.createdAt.localeCompare(right.createdAt));
}

export function getOverdueTasks(tasks: Task[], today: string) {
  return tasks.filter((task) => open(task) && task.dueDate !== null && task.dueDate < today).sort(byPosition);
}

export function getTodayTasks(tasks: Task[], today: string) {
  return tasks.filter((task) => open(task) && task.dueDate === today).sort(byPosition);
}

export function getUpcomingTasks(tasks: Task[], today: string) {
  return tasks.filter((task) => open(task) && task.dueDate !== null && task.dueDate > today).sort(byPosition);
}

export function getProjectTasks(tasks: Task[], projectId: string) {
  return tasks.filter((task) => open(task) && task.projectId === projectId).sort(byPosition);
}

export function getCompletedTasks(tasks: Task[]) {
  return tasks.filter((task) => task.completed || task.status === 'completed').sort((left, right) => (right.completedAt ?? '').localeCompare(left.completedAt ?? ''));
}

export function searchTasks(tasks: Task[], query: string) {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return [];
  return tasks.filter((task) => task.status !== 'cancelled' && `${task.title} ${task.notes} ${task.project}`.toLocaleLowerCase().includes(normalized)).sort(byPosition);
}

export function groupTasksByDate(tasks: Task[]) {
  return tasks.reduce<Record<string, Task[]>>((groups, task) => {
    if (!task.dueDate) return groups;
    groups[task.dueDate] = [...(groups[task.dueDate] ?? []), task];
    return groups;
  }, {});
}
