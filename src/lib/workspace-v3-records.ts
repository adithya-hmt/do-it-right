import type { WorkspaceV3 } from '@/domain/types';

export type EntityRecord = { entityId: string; payload: string };
export type WorkspaceRecordSet = {
  meta: string;
  profile: EntityRecord[];
  areas: EntityRecord[];
  projects: EntityRecord[];
  tasks: EntityRecord[];
  dayPlans: EntityRecord[];
  routines: EntityRecord[];
  routineCompletions: EntityRecord[];
  focusSessions: EntityRecord[];
  weeklyReviews: EntityRecord[];
  syncQueue: EntityRecord[];
  spaces: EntityRecord[];
  memberships: EntityRecord[];
  invitations: EntityRecord[];
  comments: EntityRecord[];
  activity: EntityRecord[];
  notifications: EntityRecord[];
};

function records<T>(values: T[], id: (value: T, index: number) => string): EntityRecord[] {
  return values.map((value, index) => ({ entityId: id(value, index), payload: JSON.stringify(value) }));
}

function values<T>(items: EntityRecord[]): T[] {
  return items.map((item) => JSON.parse(item.payload) as T);
}

export function toWorkspaceRecords(workspace: WorkspaceV3): WorkspaceRecordSet {
  return {
    meta: JSON.stringify({ schemaVersion: workspace.schemaVersion, syncCursor: workspace.syncCursor }),
    profile: records([workspace.profile], (profile) => profile.id),
    areas: records(workspace.areas, (area) => area.id),
    projects: records(workspace.projects, (project) => project.id),
    tasks: records(workspace.tasks, (task) => task.id),
    dayPlans: records(Object.values(workspace.dayPlans), (plan) => plan.date),
    routines: records(workspace.routines, (routine) => routine.id),
    routineCompletions: records(workspace.routineCompletions, (completion) => `${completion.routineId}:${completion.date}`),
    focusSessions: records(workspace.focusSessions, (session) => session.id),
    weeklyReviews: records(Object.values(workspace.weeklyReviews), (review) => review.weekStart),
    syncQueue: records(workspace.syncQueue, (mutation) => mutation.id),
    spaces: records(workspace.spaces, (space) => space.id),
    memberships: records(workspace.memberships, (member) => member.id),
    invitations: records(workspace.invitations, (invitation) => invitation.id),
    comments: records(workspace.comments, (comment) => comment.id),
    activity: records(workspace.activity, (event) => event.id),
    notifications: records(workspace.notifications, (notification) => notification.id),
  };
}

export function fromWorkspaceRecords(recordSet: WorkspaceRecordSet): WorkspaceV3 {
  const meta = JSON.parse(recordSet.meta) as Pick<WorkspaceV3, 'schemaVersion' | 'syncCursor'>;
  const profile = values<WorkspaceV3['profile']>(recordSet.profile)[0];
  if (!profile || meta.schemaVersion !== 3) throw new Error('DIR local workspace records are incomplete.');
  const dayPlans = values<WorkspaceV3['dayPlans'][string]>(recordSet.dayPlans);
  const weeklyReviews = values<WorkspaceV3['weeklyReviews'][string]>(recordSet.weeklyReviews);
  return {
    schemaVersion: 3,
    syncCursor: meta.syncCursor,
    profile,
    areas: values(recordSet.areas),
    projects: values(recordSet.projects),
    tasks: values(recordSet.tasks),
    dayPlans: Object.fromEntries(dayPlans.map((plan) => [plan.date, plan])),
    routines: values(recordSet.routines),
    routineCompletions: values(recordSet.routineCompletions),
    focusSessions: values(recordSet.focusSessions),
    weeklyReviews: Object.fromEntries(weeklyReviews.map((review) => [review.weekStart, review])),
    syncQueue: values(recordSet.syncQueue),
    spaces: values(recordSet.spaces),
    memberships: values(recordSet.memberships),
    invitations: values(recordSet.invitations),
    comments: values(recordSet.comments),
    activity: values(recordSet.activity),
    notifications: values(recordSet.notifications),
  };
}
