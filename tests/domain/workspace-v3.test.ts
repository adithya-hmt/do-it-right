import { buildSeedWorkspace } from '@/domain/workspace';
import { migrateWorkspaceV2ToV3 } from '@/domain/workspace-v3-migration';
import { canManageMembers, canMutateSharedTask, getAssignedToMeTasks } from '@/domain/workspace-v3-selectors';

describe('DIR workspace v3', () => {
  test('preserves v2 entities and ids while adding collaboration-safe fields', () => {
    const legacy = buildSeedWorkspace('2026-08-28');
    const migrated = migrateWorkspaceV2ToV3(legacy);

    expect(migrated.schemaVersion).toBe(3);
    expect(migrated.tasks).toHaveLength(legacy.tasks.length);
    expect(migrated.tasks.map((task) => task.id)).toEqual(legacy.tasks.map((task) => task.id));
    expect(migrated.projects.map((project) => project.id)).toEqual(legacy.projects.map((project) => project.id));
    expect(migrated.tasks[0]).toMatchObject({
      spaceId: null,
      createdBy: 'local-profile',
      assigneeId: null,
      revision: 0,
      deletedAt: null,
    });
    expect(migrated.profile.appearance).toEqual({ mode: legacy.profile.theme, paletteId: 'warm', customAccent: null });
    expect(migrated.spaces).toEqual([]);
    expect(migrated.memberships).toEqual([]);
  });

  test('is idempotent and returns an already migrated workspace unchanged', () => {
    const migrated = migrateWorkspaceV2ToV3(buildSeedWorkspace('2026-08-28'));
    expect(migrateWorkspaceV2ToV3(migrated)).toBe(migrated);
  });

  test('rejects a shared task whose project belongs to another scope', () => {
    const migrated = migrateWorkspaceV2ToV3(buildSeedWorkspace('2026-08-28'));
    const invalid = {
      ...migrated,
      tasks: migrated.tasks.map((task, index) => index === 0 ? { ...task, spaceId: 'space-home' } : task),
    };
    expect(() => migrateWorkspaceV2ToV3(invalid)).toThrow('project scope');
  });

  test('enforces member roles and selects open shared tasks assigned to the user', () => {
    const workspace = migrateWorkspaceV2ToV3(buildSeedWorkspace('2026-08-28'));
    const task = { ...workspace.tasks[0], id: 'shared-task', spaceId: 'space-team', assigneeId: 'member-1', completed: false };
    expect(getAssignedToMeTasks([...workspace.tasks, task], 'member-1').map((item) => item.id)).toEqual(['shared-task']);
    expect(canManageMembers('owner')).toBe(true);
    expect(canManageMembers('admin')).toBe(true);
    expect(canManageMembers('member')).toBe(false);
    expect(canMutateSharedTask('member')).toBe(true);
  });
});
