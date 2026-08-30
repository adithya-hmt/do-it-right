import type { LegacyWorkspaceV1, WorkspaceV2 } from '@/domain/types';
import { migrateWorkspaceV1 } from '@/domain/workspace-migration';
import type { WorkspaceStorage } from '@/lib/workspace-storage';

export const V2_STORAGE_KEY = 'focusflow.workspace.v2';
export const LEGACY_STORAGE_KEYS = ['focusflow.workspace.v1', 'do-it-right.workspace.v1'] as const;

export function createWorkspaceRepository(storage: WorkspaceStorage | null) {
  const readLegacy = () => LEGACY_STORAGE_KEYS.map((key) => storage?.getItem(key)).find((raw) => raw !== null) ?? null;
  return {
    async load() {
      const currentRaw = storage?.getItem(V2_STORAGE_KEY);
      if (currentRaw) {
        const parsed = JSON.parse(currentRaw) as WorkspaceV2;
        if (parsed.schemaVersion !== 2 || !Array.isArray(parsed.tasks)) throw new Error('FocusFlow v2 workspace is invalid.');
        return parsed;
      }
      const legacyRaw = readLegacy();
      if (!legacyRaw) return null;
      try {
        const migrated = migrateWorkspaceV1(JSON.parse(legacyRaw) as LegacyWorkspaceV1);
        storage?.setItem(V2_STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      } catch (error) {
        if (error instanceof Error && error.message.includes('could not be migrated')) throw error;
        throw new Error('Legacy FocusFlow workspace could not be migrated.', { cause: error });
      }
    },
    async exportLegacy() {
      return readLegacy();
    },
  };
}
