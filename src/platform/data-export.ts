import type { WorkspaceV2, WorkspaceV3 } from '@/domain/types';
import { workspaceToJson } from '@/domain/workspace-export';

export { workspaceToJson } from '@/domain/workspace-export';

export async function exportWorkspace(workspace: WorkspaceV2 | WorkspaceV3) {
  return exportJson(workspaceToJson(workspace), 'dir-workspace');
}

export async function exportLegacyJson(json: string) {
  return exportJson(json, 'focusflow-legacy-v1');
}

async function exportJson(json: string, name: string) {
  if (typeof document === 'undefined') return false;
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${name}-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  return true;
}
