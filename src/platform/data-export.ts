import type { WorkspaceSnapshot } from '@/domain/types';
import { workspaceToJson } from '@/domain/workspace-export';

export { workspaceToJson } from '@/domain/workspace-export';

export async function exportWorkspace(workspace: WorkspaceSnapshot) {
  const json = workspaceToJson(workspace);
  if (typeof document === 'undefined') return false;
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `do-it-right-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  return true;
}
