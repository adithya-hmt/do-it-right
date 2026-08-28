import type { WorkspaceSnapshot } from '@/domain/types';

export function workspaceToJson(workspace: WorkspaceSnapshot) {
  return JSON.stringify({ exportedAt: new Date().toISOString(), app: 'Focusflow', version: 1, workspace }, null, 2);
}
