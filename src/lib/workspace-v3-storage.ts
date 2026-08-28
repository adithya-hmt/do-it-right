import type { WorkspaceV3 } from '@/domain/types';
import type { WorkspaceV3Storage } from '@/lib/workspace-v3-repository';

const key = (namespace: string) => `dir.workspace.v3:${namespace}`;

export const workspaceV3Storage: WorkspaceV3Storage = {
  async load(namespace) {
    if (typeof globalThis.localStorage === 'undefined') return null;
    const raw = globalThis.localStorage.getItem(key(namespace));
    return raw ? JSON.parse(raw) as WorkspaceV3 : null;
  },
  async save(namespace, workspace) {
    globalThis.localStorage?.setItem(key(namespace), JSON.stringify(workspace));
  },
  async transaction(operation) {
    return operation();
  },
};
