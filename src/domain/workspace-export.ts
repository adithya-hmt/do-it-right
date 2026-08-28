import type { WorkspaceV2, WorkspaceV3 } from '@/domain/types';

export function workspaceToJson(workspace: WorkspaceV2 | WorkspaceV3) {
  return JSON.stringify({ exportedAt: new Date().toISOString(), app: 'DIR', version: workspace.schemaVersion, workspace }, null, 2);
}
