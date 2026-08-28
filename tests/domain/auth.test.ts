import { buildSeedWorkspace } from '@/domain/workspace';
import { claimGuestWorkspace, getAuthNamespace } from '@/domain/auth';
import { migrateWorkspaceV2ToV3 } from '@/domain/workspace-v3-migration';

describe('DIR guest account claiming', () => {
  test('uses isolated namespaces for guests and authenticated users', () => {
    expect(getAuthNamespace(null)).toBe('guest');
    expect(getAuthNamespace('user-123')).toBe('user:user-123');
  });

  test('claims personal guest data without duplicating ids already in the remote workspace', () => {
    const guest = migrateWorkspaceV2ToV3(buildSeedWorkspace('2026-08-28'));
    const remote = { ...guest, profile: { ...guest.profile, id: 'user-123', email: 'ada@example.com' }, tasks: [guest.tasks[0]], projects: [guest.projects[0]] };
    const claimed = claimGuestWorkspace(guest, 'user-123', remote);

    expect(claimed.profile.id).toBe('user-123');
    expect(claimed.tasks).toHaveLength(guest.tasks.length);
    expect(new Set(claimed.tasks.map((task) => task.id)).size).toBe(guest.tasks.length);
    expect(claimed.tasks.every((task) => task.createdBy === 'user-123')).toBe(true);
    expect(claimed.projects.every((project) => project.createdBy === 'user-123')).toBe(true);
  });
});
