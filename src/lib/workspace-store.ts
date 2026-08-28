import type { WorkspaceSnapshot } from '@/domain/types';

import { getWorkspaceStorage } from './workspace-storage';

const STORAGE_KEY = 'do-it-right.workspace.v1';
const listeners = new Set<() => void>();

export async function loadWorkspace(): Promise<WorkspaceSnapshot | null> {
  const raw = getWorkspaceStorage()?.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as WorkspaceSnapshot;
  } catch {
    getWorkspaceStorage()?.removeItem(STORAGE_KEY);
    return null;
  }
}

export async function saveWorkspace(workspace: WorkspaceSnapshot) {
  getWorkspaceStorage()?.setItem(STORAGE_KEY, JSON.stringify(workspace));
  listeners.forEach((listener) => listener());
}

export function subscribeWorkspace(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function clearWorkspace() {
  getWorkspaceStorage()?.removeItem(STORAGE_KEY);
  listeners.forEach((listener) => listener());
}
