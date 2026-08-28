import { buildSeedWorkspace, deriveProjectProgress, getDayKey } from '@/domain/workspace';
import { workspaceToJson } from '@/platform/data-export';

describe('workspace primitives', () => {
  test('creates a usable first-day workspace', () => {
    const workspace = buildSeedWorkspace('2026-08-27');

    expect(workspace.profile.displayName).toBe('Alex');
    expect(workspace.tasks.length).toBeGreaterThanOrEqual(5);
    expect(workspace.dayPlans['2026-08-27'].dailyThree).toHaveLength(3);
  });

  test('derives project progress from its actual tasks', () => {
    const workspace = buildSeedWorkspace('2026-08-27');
    const progress = deriveProjectProgress(workspace.projects[0].id, workspace.tasks);

    expect(progress.total).toBe(2);
    expect(progress.completed).toBe(0);
    expect(progress.value).toBe(0);
  });

  test('formats a date as a local calendar key', () => {
    expect(getDayKey(new Date(2026, 7, 27))).toBe('2026-08-27');
  });

  test('exports a portable, versioned workspace document', () => {
    const json = workspaceToJson(buildSeedWorkspace('2026-08-27'));
    const exportDocument = JSON.parse(json) as { app: string; version: number; workspace: ReturnType<typeof buildSeedWorkspace> };

    expect(exportDocument.app).toBe('FocusFlow');
    expect(exportDocument.version).toBe(2);
    expect(exportDocument.workspace.tasks).toHaveLength(5);
  });
});
