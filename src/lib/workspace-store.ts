import type { WorkspaceV2 } from '@/domain/types';

import { getWorkspaceStorage } from './workspace-storage';
import { createWorkspaceRepository } from './workspace-repository';

const repository = createWorkspaceRepository(getWorkspaceStorage());

export async function loadWorkspace(): Promise<WorkspaceV2 | null> {
  return repository.load();
}

export async function saveWorkspace(workspace: WorkspaceV2) {
  return repository.save(workspace);
}

export function subscribeWorkspace(listener: () => void) {
  return repository.subscribe(listener);
}

export async function clearWorkspace() {
  getWorkspaceStorage()?.removeItem('focusflow.workspace.v2');
}

export async function exportLegacyWorkspace() {
  return repository.exportLegacy();
}
