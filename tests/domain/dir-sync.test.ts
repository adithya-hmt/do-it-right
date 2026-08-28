import { fromDirTaskRow, resolveTaskConflict, toDirTaskRow } from '@/lib/dir-sync';
import { migrateWorkspaceV2ToV3 } from '@/domain/workspace-v3-migration';
import { buildSeedWorkspace } from '@/domain/workspace';

describe('DIR sync mapping', () => {
  const workspace = migrateWorkspaceV2ToV3(buildSeedWorkspace('2026-08-28'));
  const task = { ...workspace.tasks[0], id: 'legacy-task-id', spaceId: null, createdBy: 'user-1', revision: 4 };

  it('keeps stable local ids and rich scheduling fields', () => {
    const row = toDirTaskRow(task, 'user-1', 'mutation-1');
    expect(row).toMatchObject({ id: 'legacy-task-id', owner_id: 'user-1', due_date: task.dueDate, due_time: task.dueTime, client_mutation_id: 'mutation-1', revision: 4 });
    expect(fromDirTaskRow(row, task)).toMatchObject({ id: task.id, title: task.title, dueDate: task.dueDate, spaceId: null, revision: 4, syncState: 'clean' });
  });

  it('uses revision first and updated time as a deterministic tie-breaker', () => {
    const remote = { ...task, revision: 5, updatedAt: '2026-08-28T10:00:00.000Z' };
    expect(resolveTaskConflict(task, remote)).toBe(remote);
    const newerLocal = { ...task, updatedAt: '2026-08-29T10:00:00.000Z' };
    const sameRevisionRemote = { ...remote, revision: 4 };
    expect(resolveTaskConflict(newerLocal, sameRevisionRemote)).toBe(newerLocal);
  });
});
