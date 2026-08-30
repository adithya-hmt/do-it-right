import type { WorkspaceV3 } from '@/domain/types';

type CreateSpaceInput = {
  id: string;
  memberId: string;
  userId: string;
  name: string;
  description?: string;
  color?: string;
  now: string;
};

export function createSharedSpace(workspace: WorkspaceV3, input: CreateSpaceInput): WorkspaceV3 {
  const space = { id: input.id, name: input.name.trim(), description: input.description?.trim() ?? '', color: input.color ?? '#E06A3D', createdBy: input.userId, createdAt: input.now, updatedAt: input.now, revision: 0, deletedAt: null };
  const membership = { id: input.memberId, spaceId: input.id, userId: input.userId, displayName: workspace.profile.displayName, email: workspace.profile.email, avatarColor: workspace.profile.avatarColor, role: 'owner' as const, status: 'active' as const, joinedAt: input.now };
  return { ...workspace, spaces: [...workspace.spaces, space], memberships: [...workspace.memberships, membership] };
}

export function assignSharedTask(workspace: WorkspaceV3, taskId: string, assigneeId: string | null, now: string): WorkspaceV3 {
  const task = workspace.tasks.find((item) => item.id === taskId);
  if (!task?.spaceId) throw new Error('Only shared tasks can be assigned.');
  if (assigneeId && !workspace.memberships.some((member) => member.spaceId === task.spaceId && member.userId === assigneeId && member.status === 'active')) {
    throw new Error('The assignee must be an active member of this space.');
  }
  return { ...workspace, tasks: workspace.tasks.map((item) => item.id === taskId ? { ...item, assigneeId, revision: item.revision + 1, updatedAt: now, syncState: 'pending' } : item) };
}

export function addTaskComment(workspace: WorkspaceV3, input: { id: string; taskId: string; authorId: string; body: string; mentionedUserIds?: string[]; now: string }): WorkspaceV3 {
  const task = workspace.tasks.find((item) => item.id === input.taskId);
  if (!task?.spaceId) throw new Error('Comments belong to shared tasks.');
  if (!workspace.memberships.some((member) => member.spaceId === task.spaceId && member.userId === input.authorId && member.status === 'active')) {
    throw new Error('The comment author must be an active member of this space.');
  }
  const mentionedUserIds = (input.mentionedUserIds ?? []).filter((userId) => workspace.memberships.some((member) => member.spaceId === task.spaceId && member.userId === userId && member.status === 'active'));
  const comment = { id: input.id, taskId: input.taskId, spaceId: task.spaceId, authorId: input.authorId, body: input.body.trim(), mentionedUserIds, createdAt: input.now, updatedAt: input.now, deletedAt: null };
  return { ...workspace, comments: [...workspace.comments, comment] };
}
