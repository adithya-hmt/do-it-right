import type { Task, TaskPriority, WorkspaceV2 } from '@/domain/types';

type AddTaskInput = Pick<Task, 'id' | 'title'> & Partial<Pick<Task, 'notes' | 'projectId' | 'project' | 'category' | 'dueDate' | 'dueTime' | 'reminderAt' | 'priority' | 'estimateMinutes'>> & { now: string };
type Schedule = Pick<Task, 'dueDate' | 'dueTime' | 'reminderAt'>;

function timeLabel(value: string | null) {
  if (!value) return 'Anytime';
  const [rawHour, minute] = value.split(':').map(Number);
  const suffix = rawHour >= 12 ? 'PM' : 'AM';
  const hour = rawHour % 12 || 12;
  return `${hour}:${String(minute).padStart(2, '0')} ${suffix}`;
}

function update(workspace: WorkspaceV2, id: string, transform: (task: Task) => Task): WorkspaceV2 {
  return { ...workspace, tasks: workspace.tasks.map((task) => task.id === id ? transform(task) : task) };
}

export function addWorkspaceTask(workspace: WorkspaceV2, input: AddTaskInput): WorkspaceV2 {
  const projectId = input.projectId ?? null;
  const dueDate = input.dueDate ?? null;
  const task: Task = {
    id: input.id, title: input.title.trim(), notes: input.notes ?? '', projectId, project: projectId ? input.project ?? 'Project' : 'Inbox',
    category: input.category ?? 'Work', status: dueDate ? 'planned' : 'inbox', due: timeLabel(input.dueTime ?? null), dueAt: null,
    plannedDate: dueDate, dueDate, dueTime: input.dueTime ?? null, reminderAt: input.reminderAt ?? null, position: workspace.tasks.length,
    priority: input.priority ?? 'medium', estimateMinutes: input.estimateMinutes ?? 25, completed: false, completedAt: null,
    syncState: 'clean', createdAt: input.now, updatedAt: input.now,
  };
  return { ...workspace, tasks: [...workspace.tasks, task] };
}

export function editWorkspaceTask(workspace: WorkspaceV2, id: string, patch: Partial<Pick<Task, 'title' | 'notes' | 'estimateMinutes'>>, now: string) {
  return update(workspace, id, (task) => ({ ...task, ...patch, title: patch.title?.trim() ?? task.title, updatedAt: now }));
}

export function scheduleWorkspaceTask(workspace: WorkspaceV2, id: string, schedule: Schedule, now: string) {
  return update(workspace, id, (task) => ({ ...task, ...schedule, plannedDate: schedule.dueDate, due: timeLabel(schedule.dueTime), status: schedule.dueDate ? 'planned' : 'inbox', updatedAt: now }));
}

export function completeWorkspaceTask(workspace: WorkspaceV2, id: string, now: string) {
  return update(workspace, id, (task) => ({ ...task, status: 'completed', completed: true, completedAt: now, updatedAt: now }));
}

export function undoWorkspaceTask(workspace: WorkspaceV2, id: string, now: string) {
  return update(workspace, id, (task) => ({ ...task, status: task.dueDate ? 'planned' : 'inbox', completed: false, completedAt: null, updatedAt: now }));
}

export function cancelWorkspaceTask(workspace: WorkspaceV2, id: string, now: string) {
  return update(workspace, id, (task) => ({ ...task, status: 'cancelled', completed: false, completedAt: null, updatedAt: now }));
}

export function assignTaskProject(workspace: WorkspaceV2, id: string, projectId: string | null, project: string, now: string) {
  return update(workspace, id, (task) => ({ ...task, projectId, project: projectId ? project : 'Inbox', status: task.dueDate || projectId ? 'planned' : 'inbox', updatedAt: now }));
}

export function changeTaskPriority(workspace: WorkspaceV2, id: string, priority: TaskPriority, now: string) {
  return update(workspace, id, (task) => ({ ...task, priority, updatedAt: now }));
}
