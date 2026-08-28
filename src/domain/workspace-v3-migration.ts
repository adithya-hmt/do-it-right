import type { ProjectV3, TaskV3, WorkspaceV2, WorkspaceV3 } from '@/domain/types';

function migrateTask(task: WorkspaceV2['tasks'][number], userId: string): TaskV3 {
  return { ...task, spaceId: null, createdBy: userId, assigneeId: null, revision: 0, deletedAt: null };
}

function migrateProject(project: WorkspaceV2['projects'][number], userId: string): ProjectV3 {
  return { ...project, spaceId: null, createdBy: userId, revision: 0, deletedAt: null };
}

function validateWorkspace(workspace: WorkspaceV3) {
  const projects = new Map(workspace.projects.map((project) => [project.id, project]));
  for (const task of workspace.tasks) {
    if (!task.projectId) continue;
    const project = projects.get(task.projectId);
    if (!project || project.spaceId !== task.spaceId) throw new Error('DIR v3 migration found a project scope mismatch.');
  }
  for (const project of workspace.projects) {
    if (project.spaceId && project.areaId) throw new Error('DIR v3 migration found a project scope mismatch.');
  }
}

export function migrateWorkspaceV2ToV3(workspace: WorkspaceV2 | WorkspaceV3): WorkspaceV3 {
  if (workspace.schemaVersion === 3) {
    validateWorkspace(workspace);
    return workspace;
  }
  const userId = workspace.profile.id;
  const migrated: WorkspaceV3 = {
    ...workspace,
    schemaVersion: 3,
    profile: {
      ...workspace.profile,
      appearance: { mode: workspace.profile.theme, paletteId: 'warm', customAccent: null },
    },
    projects: workspace.projects.map((project) => migrateProject(project, userId)),
    tasks: workspace.tasks.map((task) => migrateTask(task, userId)),
    spaces: [],
    memberships: [],
    invitations: [],
    comments: [],
    activity: [],
    notifications: [],
    syncQueue: workspace.syncQueue.map((operation) => ({ ...operation, baseRevision: 0 })),
  };
  if (migrated.tasks.length !== workspace.tasks.length || migrated.projects.length !== workspace.projects.length) {
    throw new Error('DIR v3 migration could not preserve every entity.');
  }
  validateWorkspace(migrated);
  return migrated;
}
