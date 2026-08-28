import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import type { WorkspaceSnapshot } from '@/domain/types';
import { workspaceToJson } from '@/domain/workspace-export';

export { workspaceToJson } from '@/domain/workspace-export';

export async function exportWorkspace(workspace: WorkspaceSnapshot) {
  return exportJson(workspaceToJson(workspace), 'focusflow', 'Export your FocusFlow workspace');
}

export async function exportLegacyJson(json: string) {
  return exportJson(json, 'focusflow-legacy-v1', 'Export your legacy FocusFlow workspace');
}

async function exportJson(json: string, name: string, dialogTitle: string) {
  if (!FileSystem.documentDirectory) return false;
  const uri = `${FileSystem.documentDirectory}${name}-${new Date().toISOString().slice(0, 10)}.json`;
  await FileSystem.writeAsStringAsync(uri, json, { encoding: FileSystem.EncodingType.UTF8 });
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle });
  return true;
}
