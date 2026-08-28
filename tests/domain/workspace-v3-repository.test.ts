import { buildSeedWorkspace } from '@/domain/workspace';
import { migrateWorkspaceV2ToV3 } from '@/domain/workspace-v3-migration';
import { createWorkspaceV3Repository, type WorkspaceV3Storage } from '@/lib/workspace-v3-repository';
import type { WorkspaceV3 } from '@/domain/types';

function memoryStorage() {
  const workspaces = new Map<string, WorkspaceV3>();
  const transactions: string[] = [];
  const storage: WorkspaceV3Storage = {
    load: async (namespace) => workspaces.get(namespace) ?? null,
    save: async (namespace, workspace) => void workspaces.set(namespace, workspace),
    transaction: async (operation) => {
      transactions.push('begin');
      try {
        const result = await operation();
        transactions.push('commit');
        return result;
      } catch (error) {
        transactions.push('rollback');
        throw error;
      }
    },
  };
  return { storage, workspaces, transactions };
}

describe('WorkspaceV3Repository', () => {
  test('migrates v2 once into a namespaced store while retaining the rollback source', async () => {
    const legacy = buildSeedWorkspace('2026-08-28');
    const memory = memoryStorage();
    let legacyLoads = 0;
    const repository = createWorkspaceV3Repository(memory.storage, {
      namespace: 'guest',
      loadV2: async () => {
        legacyLoads += 1;
        return legacy;
      },
    });

    const first = await repository.load();
    const second = await repository.load();

    expect(first?.schemaVersion).toBe(3);
    expect(second).toEqual(first);
    expect(legacyLoads).toBe(1);
    expect(memory.workspaces.get('guest')?.tasks.map((task) => task.id)).toEqual(legacy.tasks.map((task) => task.id));
    expect(legacy.schemaVersion).toBe(2);
  });

  test('commits a task edit and sync mutation in one transaction', async () => {
    const memory = memoryStorage();
    const initial = migrateWorkspaceV2ToV3(buildSeedWorkspace('2026-08-28'));
    memory.workspaces.set('user:ada', initial);
    const repository = createWorkspaceV3Repository(memory.storage, { namespace: 'user:ada', loadV2: async () => null });

    await repository.mutate(
      (workspace) => ({ ...workspace, tasks: workspace.tasks.map((task, index) => index === 0 ? { ...task, title: 'Revised title', revision: task.revision + 1 } : task) }),
      { id: 'mutation-1', entity: 'task', entityId: initial.tasks[0].id, operation: 'upsert', payload: { title: 'Revised title' }, baseRevision: 0, createdAt: '2026-08-28T10:00:00.000Z' },
    );

    expect(memory.transactions).toEqual(['begin', 'commit']);
    expect(memory.workspaces.get('user:ada')?.tasks[0].title).toBe('Revised title');
    expect(memory.workspaces.get('user:ada')?.syncQueue).toEqual([expect.objectContaining({ id: 'mutation-1', baseRevision: 0 })]);
  });
});
