import type { SyncMutation, WorkspaceV3 } from '@/domain/types';

const LEGACY_AREA_IDS = new Set(['work', 'health', 'personal']);
const LEGACY_PROJECT_IDS = new Set(['northstar', 'launch-kit', 'field-notes', 'rituals']);
const LEGACY_TASK_IDS = new Set(['task-1', 'task-2', 'task-3', 'task-4', 'task-5']);

function scopedId(userId: string, id: string) {
  return `dir-${userId}-${id}`;
}

function remapId(id: string, legacyIds: ReadonlySet<string>, userId: string) {
  return legacyIds.has(id) ? scopedId(userId, id) : id;
}

function remapQueueMutation(mutation: SyncMutation, userId: string, mapProject: (id: string) => string, mapTask: (id: string) => string) {
  const entityId = mutation.entity === 'project' ? mapProject(mutation.entityId) : mutation.entity === 'task' ? mapTask(mutation.entityId) : mutation.entityId;
  const withEntityId = () => entityId === mutation.entityId ? mutation : { ...mutation, entityId };
  if (!mutation.payload || typeof mutation.payload !== 'object') return withEntityId();

  const payload = mutation.payload as Record<string, unknown>;
  if (mutation.entity === 'project') {
    const id = typeof payload.id === 'string' ? mapProject(payload.id) : payload.id;
    const areaId = typeof payload.areaId === 'string' ? remapId(payload.areaId, LEGACY_AREA_IDS, userId) : payload.areaId;
    return id === payload.id && areaId === payload.areaId && entityId === mutation.entityId ? mutation : { ...mutation, entityId, payload: { ...payload, id, areaId } };
  }
  if (mutation.entity === 'task') {
    const id = typeof payload.id === 'string' ? mapTask(payload.id) : payload.id;
    const projectId = typeof payload.projectId === 'string' ? mapProject(payload.projectId) : payload.projectId;
    return id === payload.id && projectId === payload.projectId && entityId === mutation.entityId ? mutation : { ...mutation, entityId, payload: { ...payload, id, projectId } };
  }
  if (mutation.entity === 'day_plan' && Array.isArray(payload.dailyThree)) {
    const queuedDailyThree = payload.dailyThree as unknown[];
    const dailyThree = queuedDailyThree.map((id) => typeof id === 'string' ? mapTask(id) : id);
    const dailyThreeChanged = dailyThree.some((id, index) => id !== queuedDailyThree[index]);
    return !dailyThreeChanged && entityId === mutation.entityId ? mutation : { ...mutation, entityId, payload: { ...payload, dailyThree } };
  }
  return withEntityId();
}

/**
 * Repairs IDs from the original local starter workspace before its first cloud sync.
 * IDs created by the user are deliberately left alone so existing cloud data remains stable.
 */
export function repairLegacyWorkspaceIds(workspace: WorkspaceV3, userId: string): { workspace: WorkspaceV3; changed: boolean } {
  const mapArea = (id: string) => remapId(id, LEGACY_AREA_IDS, userId);
  const mapProject = (id: string) => remapId(id, LEGACY_PROJECT_IDS, userId);
  const mapTask = (id: string) => remapId(id, LEGACY_TASK_IDS, userId);

  const areas = workspace.areas.map((area) => ({ ...area, id: mapArea(area.id) }));
  const projects = workspace.projects.map((project) => ({ ...project, id: mapProject(project.id), areaId: mapArea(project.areaId) }));
  const tasks = workspace.tasks.map((task) => ({ ...task, id: mapTask(task.id), projectId: task.projectId ? mapProject(task.projectId) : task.projectId }));
  const dayPlans = Object.fromEntries(Object.entries(workspace.dayPlans).map(([date, plan]) => [date, { ...plan, dailyThree: plan.dailyThree.map(mapTask) }]));
  const focusSessions = workspace.focusSessions.map((session) => ({ ...session, taskId: session.taskId ? mapTask(session.taskId) : session.taskId, projectId: session.projectId ? mapProject(session.projectId) : session.projectId }));
  const comments = workspace.comments.map((comment) => ({ ...comment, taskId: mapTask(comment.taskId) }));
  const syncQueue = workspace.syncQueue.map((mutation) => remapQueueMutation(mutation, userId, mapProject, mapTask));

  const changed = areas.some((area, index) => area.id !== workspace.areas[index]?.id)
    || projects.some((project, index) => project.id !== workspace.projects[index]?.id || project.areaId !== workspace.projects[index]?.areaId)
    || tasks.some((task, index) => task.id !== workspace.tasks[index]?.id || task.projectId !== workspace.tasks[index]?.projectId)
    || Object.entries(dayPlans).some(([date, plan]) => plan.dailyThree.some((id, index) => id !== workspace.dayPlans[date]?.dailyThree[index]))
    || focusSessions.some((session, index) => session.taskId !== workspace.focusSessions[index]?.taskId || session.projectId !== workspace.focusSessions[index]?.projectId)
    || comments.some((comment, index) => comment.taskId !== workspace.comments[index]?.taskId)
    || syncQueue.some((mutation, index) => mutation !== workspace.syncQueue[index]);

  return changed ? { workspace: { ...workspace, areas, projects, tasks, dayPlans, focusSessions, comments, syncQueue }, changed: true } : { workspace, changed: false };
}
