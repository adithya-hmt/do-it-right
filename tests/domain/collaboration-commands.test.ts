import { buildSeedWorkspace } from '@/domain/workspace';
import { addTaskComment, assignSharedTask, createSharedSpace } from '@/domain/collaboration-commands';
import { migrateWorkspaceV2ToV3 } from '@/domain/workspace-v3-migration';

describe('collaboration commands', () => {
  test('creates a space and active owner membership atomically', () => {
    const workspace = migrateWorkspaceV2ToV3(buildSeedWorkspace('2026-08-28'));
    const next = createSharedSpace(workspace, {
      id: 'space-1', memberId: 'member-1', userId: 'user-1', name: 'Home', description: 'Life together', color: '#C44F2B', now: '2026-08-28T10:00:00.000Z',
    });
    expect(next.spaces[0]).toMatchObject({ id: 'space-1', name: 'Home', createdBy: 'user-1' });
    expect(next.memberships[0]).toMatchObject({ spaceId: 'space-1', userId: 'user-1', role: 'owner', status: 'active' });
  });

  test('assigns only active members and records comments on shared tasks', () => {
    const initial = createSharedSpace(migrateWorkspaceV2ToV3(buildSeedWorkspace('2026-08-28')), {
      id: 'space-1', memberId: 'member-owner', userId: 'user-1', name: 'Studio', now: '2026-08-28T10:00:00.000Z',
    });
    const member = { ...initial.memberships[0], id: 'member-2', userId: 'user-2', role: 'member' as const };
    const task = { ...initial.tasks[0], id: 'shared-task', spaceId: 'space-1', projectId: null };
    const workspace = { ...initial, memberships: [...initial.memberships, member], tasks: [...initial.tasks, task] };
    const assigned = assignSharedTask(workspace, 'shared-task', 'user-2', '2026-08-28T10:01:00.000Z');
    const commented = addTaskComment(assigned, { id: 'comment-1', taskId: 'shared-task', authorId: 'user-1', body: 'Please review @Maya', mentionedUserIds: ['user-2'], now: '2026-08-28T10:02:00.000Z' });
    expect(assigned.tasks.find((item) => item.id === 'shared-task')?.assigneeId).toBe('user-2');
    expect(commented.comments[0]).toMatchObject({ taskId: 'shared-task', spaceId: 'space-1', authorId: 'user-1', mentionedUserIds: ['user-2'] });
    expect(() => assignSharedTask(workspace, 'shared-task', 'outsider', '2026-08-28T10:03:00.000Z')).toThrow('active member');
  });
});
