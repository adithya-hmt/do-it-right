import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import type { WorkspaceV2, WorkspaceV3 } from '@/domain/types';
import { workspaceToJson } from '@/domain/workspace-export';

export { workspaceToJson } from '@/domain/workspace-export';

export async function exportWorkspace(workspace: WorkspaceV2 | WorkspaceV3) {
  return exportJson(workspaceToJson(workspace), 'dir-workspace', 'Export your DIR workspace');
}

export async function exportLegacyJson(json: string) {
  return exportJson(json, 'dir-legacy-v1', 'Export your legacy workspace');
}

async function exportJson(json: string, name: string, dialogTitle: string) {
  if (!FileSystem.documentDirectory) return false;
  const uri = `${FileSystem.documentDirectory}${name}-${new Date().toISOString().slice(0, 10)}.json`;
  await FileSystem.writeAsStringAsync(uri, json, { encoding: FileSystem.EncodingType.UTF8 });
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle });
  return true;
}
