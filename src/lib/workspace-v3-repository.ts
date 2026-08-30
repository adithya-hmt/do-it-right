import type { WorkspaceV2, WorkspaceV3 } from '@/domain/types';
import { migrateWorkspaceV2ToV3 } from '@/domain/workspace-v3-migration';

export interface WorkspaceV3Storage {
  load(namespace: string): Promise<WorkspaceV3 | null>;
  save(namespace: string, workspace: WorkspaceV3): Promise<void>;
  transaction<T>(operation: () => Promise<T>): Promise<T>;
}

export function createWorkspaceV3Repository(
  storage: WorkspaceV3Storage,
  options: { namespace: string; loadV2: () => Promise<WorkspaceV2 | null> },
) {
  return {
    async load() {
      const current = await storage.load(options.namespace);
      if (current) return migrateWorkspaceV2ToV3(current);
      const legacy = await options.loadV2();
      if (!legacy) return null;
      const migrated = migrateWorkspaceV2ToV3(legacy);
      await storage.transaction(() => storage.save(options.namespace, migrated));
      return migrated;
    },
    async save(workspace: WorkspaceV3) {
      const validated = migrateWorkspaceV2ToV3(workspace);
      await storage.transaction(() => storage.save(options.namespace, validated));
    },
  };
}
