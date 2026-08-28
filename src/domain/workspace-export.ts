import type { WorkspaceSnapshot } from '@/domain/types';

export function workspaceToJson(workspace: WorkspaceSnapshot) {
  return JSON.stringify({ exportedAt: new Date().toISOString(), app: 'FocusFlow', version: 2, workspace }, null, 2);
}
