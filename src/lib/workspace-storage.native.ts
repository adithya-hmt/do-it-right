import { Storage } from 'expo-sqlite/kv-store';

import type { WorkspaceStorage } from './workspace-storage';

const workspaceStorage: WorkspaceStorage = {
  getItem: (key) => Storage.getItemSync(key),
  setItem: (key, value) => Storage.setItemSync(key, value),
  removeItem: (key) => Storage.removeItemSync(key),
};

export function getWorkspaceStorage(): WorkspaceStorage {
  return workspaceStorage;
}
