import type { WorkspaceSnapshot } from '@/domain/types';

export function workspaceToJson(workspace: WorkspaceSnapshot) {
  return JSON.stringify({ exportedAt: new Date().toISOString(), app: 'Do It Right', version: 1, workspace }, null, 2);
}
