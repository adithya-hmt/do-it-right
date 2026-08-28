import type { SpaceRole, TaskV3 } from '@/domain/types';

export function canManageMembers(role: SpaceRole) {
  return role === 'owner' || role === 'admin';
}

export function canMutateSharedTask(role: SpaceRole) {
  return role === 'owner' || role === 'admin' || role === 'member';
}

export function getAssignedToMeTasks(tasks: TaskV3[], userId: string) {
  return tasks.filter((task) => task.spaceId && task.assigneeId === userId && !task.completed && task.status !== 'cancelled' && !task.deletedAt);
}
