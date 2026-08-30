import { buildSeedWorkspace } from '@/domain/workspace';
import { migrateWorkspaceV2ToV3 } from '@/domain/workspace-v3-migration';
import { repairLegacyWorkspaceIds } from '@/domain/legacy-id-repair';

describe('legacy workspace ID repair', () => {
  test('scopes starter IDs to the signed-in user and keeps relationships intact', () => {
    const workspace = migrateWorkspaceV2ToV3(buildSeedWorkspace('2026-08-28'));
    const repaired = repairLegacyWorkspaceIds(workspace, 'user-123');

    expect(repaired.changed).toBe(true);
    expect(repaired.workspace.areas[0].id).toBe('dir-user-123-work');
    expect(repaired.workspace.projects[0]).toMatchObject({ id: 'dir-user-123-northstar', areaId: 'dir-user-123-work' });
    expect(repaired.workspace.tasks[0]).toMatchObject({ id: 'dir-user-123-task-1', projectId: 'dir-user-123-northstar' });
    expect(repaired.workspace.dayPlans['2026-08-28'].dailyThree).toEqual(['dir-user-123-task-1', 'dir-user-123-task-2', 'dir-user-123-task-3']);
  });

  test('does not alter user-created IDs and is idempotent', () => {
    const workspace = migrateWorkspaceV2ToV3(buildSeedWorkspace('2026-08-28'));
    const custom = {
      ...workspace,
      areas: [...workspace.areas, { ...workspace.areas[0], id: 'custom-area' }],
      projects: [...workspace.projects, { ...workspace.projects[0], id: 'custom-project', areaId: 'custom-area' }],
      tasks: [...workspace.tasks, { ...workspace.tasks[0], id: 'custom-task', projectId: 'custom-project' }],
    };
    const repaired = repairLegacyWorkspaceIds(custom, 'user-123');

    expect(repaired.workspace.areas.at(-1)?.id).toBe('custom-area');
    expect(repaired.workspace.projects.at(-1)).toMatchObject({ id: 'custom-project', areaId: 'custom-area' });
    expect(repaired.workspace.tasks.at(-1)).toMatchObject({ id: 'custom-task', projectId: 'custom-project' });
    expect(repairLegacyWorkspaceIds(repaired.workspace, 'user-123')).toEqual({ workspace: repaired.workspace, changed: false });
  });
});
