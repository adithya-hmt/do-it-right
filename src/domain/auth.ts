import type { WorkspaceV3 } from '@/domain/types';

export function getAuthNamespace(userId: string | null | undefined) {
  return userId ? `user:${userId}` : 'guest';
}

function mergeById<T extends { id: string }>(remote: T[], local: T[]) {
  const values = new Map(remote.map((item) => [item.id, item]));
  for (const item of local) if (!values.has(item.id)) values.set(item.id, item);
  return [...values.values()];
}

export function claimGuestWorkspace(guest: WorkspaceV3, userId: string, remote?: WorkspaceV3 | null): WorkspaceV3 {
  const personalTasks = guest.tasks.map((task) => task.spaceId ? task : { ...task, createdBy: userId });
  const personalProjects = guest.projects.map((project) => project.spaceId ? project : { ...project, createdBy: userId });
  if (!remote) {
    return { ...guest, profile: { ...guest.profile, id: userId }, tasks: personalTasks, projects: personalProjects };
  }
  return {
    ...remote,
    profile: { ...guest.profile, ...remote.profile, id: userId, appearance: guest.profile.appearance },
    areas: mergeById(remote.areas, guest.areas),
    projects: mergeById(remote.projects, personalProjects).map((project) => project.spaceId ? project : { ...project, createdBy: userId }),
    tasks: mergeById(remote.tasks, personalTasks).map((task) => task.spaceId ? task : { ...task, createdBy: userId }),
    routines: mergeById(remote.routines, guest.routines),
    focusSessions: mergeById(remote.focusSessions, guest.focusSessions),
    spaces: mergeById(remote.spaces, guest.spaces),
    memberships: mergeById(remote.memberships, guest.memberships),
    invitations: mergeById(remote.invitations, guest.invitations),
    comments: mergeById(remote.comments, guest.comments),
    activity: mergeById(remote.activity, guest.activity),
    notifications: mergeById(remote.notifications, guest.notifications),
    dayPlans: { ...guest.dayPlans, ...remote.dayPlans },
    weeklyReviews: { ...guest.weeklyReviews, ...remote.weeklyReviews },
    routineCompletions: [...remote.routineCompletions, ...guest.routineCompletions.filter((local) => !remote.routineCompletions.some((item) => item.routineId === local.routineId && item.date === local.date))],
    syncQueue: mergeById(remote.syncQueue, guest.syncQueue),
  };
}
