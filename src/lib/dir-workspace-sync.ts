import type { SupabaseClient } from '@supabase/supabase-js';

import type { ActivityEvent, ProjectV3, Space, SpaceMember, TaskComment, WorkspaceNotification, WorkspaceV3 } from '@/domain/types';
import { mergeDirTasks, toDirTaskRow, type DirTaskRow } from '@/lib/dir-sync';

type DbRow = Record<string, unknown>;

function requiredRows<T>(data: T[] | null, error: { message: string } | null) {
  if (error) throw error;
  return data ?? [];
}

function mapSpace(row: DbRow): Space {
  return { id: String(row.id), name: String(row.name), description: String(row.description ?? ''), color: String(row.color), createdBy: String(row.created_by), createdAt: String(row.created_at), updatedAt: String(row.updated_at), revision: Number(row.revision), deletedAt: row.deleted_at ? String(row.deleted_at) : null };
}

function mapMembership(row: DbRow, previous?: SpaceMember): SpaceMember {
  return { id: String(row.id), spaceId: String(row.space_id), userId: String(row.user_id), displayName: previous?.displayName ?? 'Teammate', email: previous?.email ?? null, avatarColor: previous?.avatarColor ?? '#C44F2B', role: row.role as SpaceMember['role'], status: row.status as SpaceMember['status'], joinedAt: row.joined_at ? String(row.joined_at) : null };
}

function mapProject(row: DbRow, previous?: ProjectV3): ProjectV3 {
  return { id: String(row.id), name: String(row.name), eyebrow: previous?.eyebrow ?? 'SHARED / ACTIVE', outcome: String(row.outcome ?? ''), summary: String(row.outcome ?? ''), areaId: row.area_id ? String(row.area_id) : '', status: row.status as ProjectV3['status'], targetDate: row.target_date ? String(row.target_date) : null, color: String(row.color), softColor: previous?.softColor ?? '#F9E5DC', position: Number(row.position), progress: previous?.progress ?? 0, tasksDone: previous?.tasksDone ?? 0, tasksTotal: previous?.tasksTotal ?? 0, spaceId: row.space_id ? String(row.space_id) : null, createdBy: String(row.owner_id), revision: Number(row.revision), deletedAt: row.deleted_at ? String(row.deleted_at) : null };
}

function mapComment(row: DbRow): TaskComment {
  return { id: String(row.id), taskId: String(row.task_id), spaceId: String(row.space_id), authorId: String(row.author_id), body: String(row.body), mentionedUserIds: Array.isArray(row.mentioned_user_ids) ? row.mentioned_user_ids.map(String) : [], createdAt: String(row.created_at), updatedAt: String(row.updated_at), deletedAt: row.deleted_at ? String(row.deleted_at) : null };
}

function mapNotification(row: DbRow): WorkspaceNotification {
  return { id: String(row.id), userId: String(row.user_id), spaceId: row.space_id ? String(row.space_id) : null, kind: row.kind as WorkspaceNotification['kind'], entityId: String(row.entity_id), title: String(row.title), body: String(row.body ?? ''), createdAt: String(row.created_at), readAt: row.read_at ? String(row.read_at) : null };
}

function mapActivity(row: DbRow): ActivityEvent {
  return { id: String(row.id), spaceId: String(row.space_id), actorId: String(row.actor_id), entity: row.entity_type as ActivityEvent['entity'], entityId: String(row.entity_id), action: String(row.action), createdAt: String(row.created_at) };
}

export async function synchronizeDirWorkspace(client: SupabaseClient, workspace: WorkspaceV3, userId: string): Promise<WorkspaceV3> {
  const remoteTaskResult = await client.from('dir_tasks').select('*').order('updated_at', { ascending: true });
  const remoteTaskRows = requiredRows(remoteTaskResult.data as DirTaskRow[] | null, remoteTaskResult.error);
  const mergedTasks = mergeDirTasks(workspace.tasks, remoteTaskRows);

  const profileResult = await client.from('dir_profiles').upsert({ user_id: userId, display_name: workspace.profile.displayName, avatar_color: workspace.profile.avatarColor, timezone: workspace.profile.timezone, appearance: workspace.profile.appearance, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  if (profileResult.error) throw profileResult.error;

  const ownedSpaces = workspace.spaces.filter((space) => space.createdBy === userId);
  if (ownedSpaces.length) {
    const result = await client.from('dir_spaces').upsert(ownedSpaces.map((space) => ({ id: space.id, name: space.name, description: space.description, color: space.color, created_by: userId, revision: space.revision, created_at: space.createdAt, updated_at: space.updatedAt, deleted_at: space.deletedAt })), { onConflict: 'id' });
    if (result.error) throw result.error;
  }
  const ownMemberships = workspace.memberships.filter((member) => member.userId === userId);
  if (ownMemberships.length) {
    const result = await client.from('dir_space_members').upsert(ownMemberships.map((member) => ({ id: member.id, space_id: member.spaceId, user_id: userId, role: member.role, status: member.status, joined_at: member.joinedAt })), { onConflict: 'id' });
    if (result.error) throw result.error;
  }

  if (workspace.areas.length) {
    const result = await client.from('dir_life_areas').upsert(workspace.areas.map((area) => ({ id: area.id, owner_id: userId, name: area.name, icon: area.icon, color: area.color, position: area.position, deleted_at: area.archivedAt })), { onConflict: 'id' });
    if (result.error) throw result.error;
  }
  if (workspace.projects.length) {
    const result = await client.from('dir_projects').upsert(workspace.projects.map((project) => ({ id: project.id, owner_id: project.createdBy === 'local-profile' ? userId : project.createdBy, space_id: project.spaceId, area_id: project.spaceId ? null : project.areaId || null, name: project.name, outcome: project.outcome, status: project.status, target_date: project.targetDate, color: project.color, position: project.position, revision: project.revision, deleted_at: project.deletedAt })), { onConflict: 'id' });
    if (result.error) throw result.error;
  }
  if (mergedTasks.length) {
    const result = await client.from('dir_tasks').upsert(mergedTasks.map((task) => toDirTaskRow(task, task.createdBy === 'local-profile' ? userId : task.createdBy, `sync-${userId}-${task.id}-${task.revision}`)), { onConflict: 'id' });
    if (result.error) throw result.error;
  }
  const authoredComments = workspace.comments.filter((comment) => comment.authorId === userId);
  if (authoredComments.length) {
    const result = await client.from('dir_task_comments').upsert(authoredComments.map((comment) => ({ id: comment.id, task_id: comment.taskId, space_id: comment.spaceId, author_id: comment.authorId, body: comment.body, mentioned_user_ids: comment.mentionedUserIds, created_at: comment.createdAt, updated_at: comment.updatedAt, deleted_at: comment.deletedAt })), { onConflict: 'id' });
    if (result.error) throw result.error;
  }

  const [spacesResult, membershipsResult, projectsResult, tasksResult, commentsResult, notificationsResult, activityResult] = await Promise.all([
    client.from('dir_spaces').select('*').is('deleted_at', null),
    client.from('dir_space_members').select('*').neq('status', 'removed'),
    client.from('dir_projects').select('*').is('deleted_at', null).order('position'),
    client.from('dir_tasks').select('*').is('deleted_at', null).order('position'),
    client.from('dir_task_comments').select('*').is('deleted_at', null).order('created_at'),
    client.from('dir_notifications').select('*').order('created_at', { ascending: false }),
    client.from('dir_activity_events').select('*').order('created_at', { ascending: false }).limit(200),
  ]);
  const spaces = requiredRows(spacesResult.data as DbRow[] | null, spacesResult.error).map(mapSpace);
  const memberships = requiredRows(membershipsResult.data as DbRow[] | null, membershipsResult.error).map((row) => mapMembership(row, workspace.memberships.find((member) => member.id === row.id)));
  const projects = requiredRows(projectsResult.data as DbRow[] | null, projectsResult.error).map((row) => mapProject(row, workspace.projects.find((project) => project.id === row.id)));
  const projectNames = new Map(projects.map((project) => [project.id, project.name]));
  const tasks = mergeDirTasks(mergedTasks, requiredRows(tasksResult.data as DirTaskRow[] | null, tasksResult.error)).map((task) => ({ ...task, project: task.projectId ? projectNames.get(task.projectId) ?? task.project : 'Inbox', syncState: 'clean' as const }));
  const comments = requiredRows(commentsResult.data as DbRow[] | null, commentsResult.error).map(mapComment);
  const notifications = requiredRows(notificationsResult.data as DbRow[] | null, notificationsResult.error).map(mapNotification);
  const activity = requiredRows(activityResult.data as DbRow[] | null, activityResult.error).map(mapActivity);
  return { ...workspace, spaces, memberships, projects, tasks, comments, notifications, activity, syncQueue: [], syncCursor: new Date().toISOString() };
}
