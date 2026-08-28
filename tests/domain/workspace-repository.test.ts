import { createWorkspaceRepository, LEGACY_STORAGE_KEYS, V2_STORAGE_KEY } from '@/lib/workspace-repository';
import { buildSeedWorkspace } from '@/domain/workspace';

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    removeItem: (key: string) => void values.delete(key),
    values,
  };
}

describe('WorkspaceRepository', () => {
  test('migrates legacy data once, writes v2, and retains the rollback snapshot', async () => {
    const current = buildSeedWorkspace('2026-08-28');
    const { schemaVersion: _schemaVersion, ...legacy } = current;
    const storage = memoryStorage({ [LEGACY_STORAGE_KEYS[0]]: JSON.stringify(legacy) });
    const repository = createWorkspaceRepository(storage);

    const loaded = await repository.load();
    const loadedAgain = await repository.load();

    expect(loaded?.schemaVersion).toBe(2);
    expect(loadedAgain).toEqual(loaded);
    expect(storage.values.has(V2_STORAGE_KEY)).toBe(true);
    expect(storage.values.has(LEGACY_STORAGE_KEYS[0])).toBe(true);
    await expect(repository.exportLegacy()).resolves.toBe(JSON.stringify(legacy));
  });

  test('rejects a malformed migration without clearing the legacy snapshot', async () => {
    const raw = JSON.stringify({ tasks: 'not-an-array' });
    const storage = memoryStorage({ [LEGACY_STORAGE_KEYS[0]]: raw });
    const repository = createWorkspaceRepository(storage);

    await expect(repository.load()).rejects.toThrow('could not be migrated');
    expect(storage.values.get(LEGACY_STORAGE_KEYS[0])).toBe(raw);
    expect(storage.values.has(V2_STORAGE_KEY)).toBe(false);
  });
});
