import type { SyncMutation, WorkspaceV2, WorkspaceV3 } from '@/domain/types';
import { migrateWorkspaceV2ToV3 } from '@/domain/workspace-v3-migration';

export interface WorkspaceV3Storage {
  load(namespace: string): Promise<WorkspaceV3 | null>;
  save(namespace: string, workspace: WorkspaceV3): Promise<void>;
  transaction<T>(operation: () => Promise<T>): Promise<T>;
}

export interface WorkspaceV3Repository {
  load(): Promise<WorkspaceV3 | null>;
  save(workspace: WorkspaceV3): Promise<void>;
  mutate(updater: (workspace: WorkspaceV3) => WorkspaceV3, mutation?: Omit<SyncMutation, 'attempts' | 'lastError'>): Promise<WorkspaceV3>;
  subscribe(listener: (workspace: WorkspaceV3) => void): () => void;
}

export function createWorkspaceV3Repository(
  storage: WorkspaceV3Storage,
  options: { namespace: string; loadV2: () => Promise<WorkspaceV2 | null> },
): WorkspaceV3Repository {
  const listeners = new Set<(workspace: WorkspaceV3) => void>();
  let cached: WorkspaceV3 | null = null;

  const notify = (workspace: WorkspaceV3) => listeners.forEach((listener) => listener(workspace));
  return {
    async load() {
      if (cached) return cached;
      const current = await storage.load(options.namespace);
      if (current) {
        cached = migrateWorkspaceV2ToV3(current);
        return cached;
      }
      const legacy = await options.loadV2();
      if (!legacy) return null;
      const migrated = migrateWorkspaceV2ToV3(legacy);
      await storage.transaction(() => storage.save(options.namespace, migrated));
      cached = migrated;
      notify(migrated);
      return migrated;
    },
    async save(workspace) {
      const validated = migrateWorkspaceV2ToV3(workspace);
      await storage.transaction(() => storage.save(options.namespace, validated));
      cached = validated;
      notify(validated);
    },
    async mutate(updater, mutation) {
      return storage.transaction(async () => {
        const current = cached ?? await storage.load(options.namespace);
        if (!current) throw new Error('DIR workspace is not loaded.');
        const updated = updater(current);
        const next = migrateWorkspaceV2ToV3({
          ...updated,
          syncQueue: mutation
            ? [...updated.syncQueue.filter((item) => item.id !== mutation.id), { ...mutation, attempts: 0, lastError: null }]
            : updated.syncQueue,
        });
        await storage.save(options.namespace, next);
        cached = next;
        notify(next);
        return next;
      });
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
