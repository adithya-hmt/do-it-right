import { buildSeedWorkspace } from '@/domain/workspace';
import { createWorkspaceV3Repository, type WorkspaceV3Storage } from '@/lib/workspace-v3-repository';
import type { WorkspaceV3 } from '@/domain/types';

function memoryStorage() {
  const workspaces = new Map<string, WorkspaceV3>();
  const storage: WorkspaceV3Storage = {
    load: async (namespace) => workspaces.get(namespace) ?? null,
    save: async (namespace, workspace) => void workspaces.set(namespace, workspace),
    transaction: (operation) => operation(),
  };
  return { storage, workspaces };
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
});
