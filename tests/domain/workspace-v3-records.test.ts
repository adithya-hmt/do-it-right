import { buildSeedWorkspace } from '@/domain/workspace';
import { migrateWorkspaceV2ToV3 } from '@/domain/workspace-v3-migration';
import { fromWorkspaceRecords, toWorkspaceRecords } from '@/lib/workspace-v3-records';

describe('normalized workspace records', () => {
  test('round-trips every collection without merging task and collaboration records', () => {
    const workspace = migrateWorkspaceV2ToV3(buildSeedWorkspace('2026-08-28'));
    const withSpace = {
      ...workspace,
      spaces: [{ id: 'space-1', name: 'Studio', description: '', color: '#C44F2B', createdBy: 'local-profile', createdAt: '2026-08-28T09:00:00.000Z', updatedAt: '2026-08-28T09:00:00.000Z', revision: 0, deletedAt: null }],
    };
    const records = toWorkspaceRecords(withSpace);

    expect(records.tasks).toHaveLength(workspace.tasks.length);
    expect(records.spaces).toHaveLength(1);
    expect(records.tasks[0].entityId).toBe(workspace.tasks[0].id);
    expect(fromWorkspaceRecords(records)).toEqual(withSpace);
  });
});
