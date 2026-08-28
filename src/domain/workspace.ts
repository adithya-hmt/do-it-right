import type { Project, Task, WorkspaceSnapshot } from '@/domain/types';

const INITIAL_TASKS: Task[] = [
  { id: 'task-1', title: 'Ship onboarding flow', notes: '', projectId: 'northstar', project: 'Northstar', category: 'Work', status: 'planned', due: '10:00 AM', dueAt: null, plannedDate: '2026-08-27', dueDate: '2026-08-27', dueTime: '10:00', reminderAt: null, position: 0, priority: 'high', estimateMinutes: 50, completed: false, completedAt: null, syncState: 'clean', createdAt: '2026-08-27T08:00:00.000Z', updatedAt: '2026-08-27T08:00:00.000Z' },
  { id: 'task-2', title: 'Review analytics events', notes: '', projectId: 'northstar', project: 'Northstar', category: 'Work', status: 'planned', due: '12:30 PM', dueAt: null, plannedDate: '2026-08-27', dueDate: '2026-08-27', dueTime: '12:30', reminderAt: null, position: 1, priority: 'medium', estimateMinutes: 35, completed: false, completedAt: null, syncState: 'clean', createdAt: '2026-08-27T08:05:00.000Z', updatedAt: '2026-08-27T08:05:00.000Z' },
  { id: 'task-3', title: '20 minute walk outside', notes: '', projectId: 'rituals', project: 'Rituals', category: 'Personal', status: 'planned', due: '2:00 PM', dueAt: null, plannedDate: '2026-08-27', dueDate: '2026-08-27', dueTime: '14:00', reminderAt: null, position: 2, priority: 'low', estimateMinutes: 20, completed: false, completedAt: null, syncState: 'clean', createdAt: '2026-08-27T08:10:00.000Z', updatedAt: '2026-08-27T08:10:00.000Z' },
  { id: 'task-4', title: 'Write launch note', notes: '', projectId: 'launch-kit', project: 'Launch kit', category: 'Work', status: 'completed', due: '4:00 PM', dueAt: null, plannedDate: '2026-08-27', dueDate: '2026-08-27', dueTime: '16:00', reminderAt: null, position: 3, priority: 'medium', estimateMinutes: 25, completed: true, completedAt: '2026-08-27T08:15:00.000Z', syncState: 'clean', createdAt: '2026-08-27T08:15:00.000Z', updatedAt: '2026-08-27T08:15:00.000Z' },
  { id: 'task-5', title: 'Clear the small inbox', notes: '', projectId: null, project: 'Inbox', category: 'Personal', status: 'inbox', due: 'Anytime', dueAt: null, plannedDate: null, dueDate: null, dueTime: null, reminderAt: null, position: 4, priority: 'low', estimateMinutes: 15, completed: false, completedAt: null, syncState: 'clean', createdAt: '2026-08-27T08:20:00.000Z', updatedAt: '2026-08-27T08:20:00.000Z' },
];

const INITIAL_PROJECTS: Project[] = [
  { id: 'northstar', name: 'Northstar', eyebrow: 'WORK / NOW', outcome: 'Make the first mile feel effortless.', summary: 'Make the first mile feel effortless.', areaId: 'work', status: 'active', targetDate: null, color: '#7357E8', softColor: '#EEEAFE', position: 0, progress: 0, tasksDone: 0, tasksTotal: 0 },
  { id: 'launch-kit', name: 'Launch kit', eyebrow: 'WORK / SOON', outcome: 'A sharper story for the next release.', summary: 'A sharper story for the next release.', areaId: 'work', status: 'active', targetDate: null, color: '#E67870', softColor: '#FBE9E7', position: 1, progress: 0, tasksDone: 0, tasksTotal: 0 },
  { id: 'field-notes', name: 'Field notes', eyebrow: 'PERSONAL / ONGOING', outcome: 'Collect the ideas worth carrying forward.', summary: 'Collect the ideas worth carrying forward.', areaId: 'personal', status: 'active', targetDate: null, color: '#C08A36', softColor: '#FBF0D7', position: 2, progress: 0, tasksDone: 0, tasksTotal: 0 },
  { id: 'rituals', name: 'Rituals', eyebrow: 'HEALTH / DAILY', outcome: 'Small inputs that keep the system human.', summary: 'Small inputs that keep the system human.', areaId: 'health', status: 'active', targetDate: null, color: '#2E7A60', softColor: '#DFF3EA', position: 3, progress: 0, tasksDone: 0, tasksTotal: 0 },
];

export function getDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function deriveProjectProgress(projectId: string, tasks: Task[]) {
  const projectTasks = tasks.filter((task) => task.projectId === projectId && task.status !== 'cancelled');
  const completed = projectTasks.filter((task) => task.completed).length;
  return { total: projectTasks.length, completed, value: projectTasks.length ? completed / projectTasks.length : 0 };
}

export function buildSeedWorkspace(day = getDayKey(new Date())): WorkspaceSnapshot {
  return {
    schemaVersion: 2,
    profile: { id: 'local-profile', displayName: 'Alex', email: null, avatarColor: '#7357E8', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, weekStartsOn: 1, morningTime: '08:00', eveningTime: '20:30', focusIntent: 'Make space for meaningful work', theme: 'system', reducedMotion: false, onboardingComplete: false },
    areas: [
      { id: 'work', name: 'Work & study', icon: 'briefcase', color: '#7357E8', position: 0, archivedAt: null },
      { id: 'health', name: 'Health', icon: 'heart', color: '#2E7A60', position: 1, archivedAt: null },
      { id: 'personal', name: 'Personal', icon: 'spark', color: '#E67870', position: 2, archivedAt: null },
    ],
    projects: INITIAL_PROJECTS,
    tasks: INITIAL_TASKS.map((task) => ({ ...task, plannedDate: task.plannedDate === '2026-08-27' ? day : task.plannedDate })),
    dayPlans: { [day]: { date: day, intention: '', dailyThree: ['task-1', 'task-2', 'task-3'], energy: null, reflection: '', closedAt: null } },
    routines: [
      { id: 'routine-1', title: 'Drink water + stretch', anchor: 'morning', days: [1, 2, 3, 4, 5], estimateMinutes: 5, active: true },
      { id: 'routine-2', title: 'Plan tomorrow', anchor: 'evening', days: [0, 1, 2, 3, 4, 5, 6], estimateMinutes: 10, active: true },
    ],
    routineCompletions: [],
    focusSessions: [],
    weeklyReviews: {},
    syncQueue: [],
    syncCursor: null,
  };
}
