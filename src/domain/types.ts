export type TaskStatus = 'inbox' | 'planned' | 'in_progress' | 'completed' | 'cancelled';
export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';
export type RoutineAnchor = 'morning' | 'day' | 'evening';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskCategory = 'Work' | 'Personal';
export type ThemePreference = 'system' | 'light' | 'dark';
export type SyncState = 'clean' | 'pending' | 'failed' | 'conflicted';
export type SpaceRole = 'owner' | 'admin' | 'member';
export type MembershipStatus = 'invited' | 'active' | 'removed';

export type AppearancePreference = {
  mode: ThemePreference;
  paletteId: 'warm' | 'forest' | 'ocean' | 'berry' | 'gold' | 'custom';
  customAccent: string | null;
};

export type Profile = {
  id: string;
  displayName: string;
  email: string | null;
  avatarColor: string;
  timezone: string;
  weekStartsOn: 0 | 1;
  morningTime: string;
  eveningTime: string;
  focusIntent: string;
  theme: ThemePreference;
  reducedMotion: boolean;
  onboardingComplete: boolean;
};

export type LifeArea = {
  id: string;
  name: string;
  icon: string;
  color: string;
  position: number;
  archivedAt: string | null;
};

export type Project = {
  id: string;
  name: string;
  eyebrow: string;
  outcome: string;
  summary: string;
  areaId: string;
  status: ProjectStatus;
  targetDate: string | null;
  color: string;
  softColor: string;
  position: number;
  progress: number;
  tasksDone: number;
  tasksTotal: number;
};

export type Task = {
  id: string;
  title: string;
  notes: string;
  projectId: string | null;
  project: string;
  category: TaskCategory;
  status: TaskStatus;
  due: string;
  dueAt: string | null;
  plannedDate: string | null;
  dueDate: string | null;
  dueTime: string | null;
  reminderAt: string | null;
  position: number;
  priority: TaskPriority;
  estimateMinutes: number;
  completed: boolean;
  completedAt: string | null;
  syncState: SyncState;
  createdAt: string;
  updatedAt: string;
};

export type DayPlan = {
  date: string;
  intention: string;
  dailyThree: string[];
  energy: number | null;
  reflection: string;
  closedAt: string | null;
};

export type Routine = {
  id: string;
  title: string;
  anchor: RoutineAnchor;
  days: number[];
  estimateMinutes: number;
  active: boolean;
};

export type RoutineCompletion = {
  routineId: string;
  date: string;
  completedAt: string;
};

export type FocusSession = {
  id: string;
  taskId: string | null;
  projectId: string | null;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number;
  interrupted: boolean;
};

export type WeeklyReview = {
  weekStart: string;
  wins: string;
  friction: string;
  nextWeekIntention: string;
  completedAt: string | null;
};

export type SyncOperation = {
  id: string;
  entity: 'task' | 'profile' | 'project' | 'day_plan' | 'routine' | 'review';
  entityId: string;
  operation: 'upsert' | 'delete';
  payload: unknown;
  createdAt: string;
  attempts: number;
  lastError: string | null;
};

export type SyncMutation = {
  id: string;
  entity: 'profile' | 'area' | 'project' | 'task' | 'day_plan' | 'routine' | 'review' | 'space' | 'membership' | 'comment' | 'notification';
  entityId: string;
  operation: 'upsert' | 'delete';
  payload: unknown;
  baseRevision: number;
  createdAt: string;
  attempts: number;
  lastError: string | null;
};

export type WorkspaceV2 = {
  schemaVersion: 2;
  profile: Profile;
  areas: LifeArea[];
  projects: Project[];
  tasks: Task[];
  dayPlans: Record<string, DayPlan>;
  routines: Routine[];
  routineCompletions: RoutineCompletion[];
  focusSessions: FocusSession[];
  weeklyReviews: Record<string, WeeklyReview>;
  syncQueue: SyncOperation[];
  syncCursor: string | null;
};

export type Space = {
  id: string;
  name: string;
  description: string;
  color: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  revision: number;
  deletedAt: string | null;
};

export type SpaceMember = {
  id: string;
  spaceId: string;
  userId: string;
  displayName: string;
  email: string | null;
  avatarColor: string;
  role: SpaceRole;
  status: MembershipStatus;
  joinedAt: string | null;
};

export type Invitation = {
  id: string;
  spaceId: string;
  email: string;
  role: Exclude<SpaceRole, 'owner'>;
  invitedBy: string;
  expiresAt: string;
  acceptedAt: string | null;
};

export type TaskComment = {
  id: string;
  taskId: string;
  spaceId: string;
  authorId: string;
  body: string;
  mentionedUserIds: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type ActivityEvent = {
  id: string;
  spaceId: string;
  actorId: string;
  entity: 'space' | 'project' | 'task' | 'comment' | 'member';
  entityId: string;
  action: string;
  createdAt: string;
};

export type WorkspaceNotification = {
  id: string;
  userId: string;
  spaceId: string | null;
  kind: 'invitation' | 'assignment' | 'mention' | 'comment';
  entityId: string;
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

export type TaskV3 = Task & {
  spaceId: string | null;
  createdBy: string;
  assigneeId: string | null;
  revision: number;
  deletedAt: string | null;
};

export type ProjectV3 = Project & {
  spaceId: string | null;
  createdBy: string;
  revision: number;
  deletedAt: string | null;
};

export type ProfileV3 = Profile & { appearance: AppearancePreference };

export type WorkspaceV3 = Omit<WorkspaceV2, 'schemaVersion' | 'profile' | 'projects' | 'tasks' | 'syncQueue'> & {
  schemaVersion: 3;
  profile: ProfileV3;
  projects: ProjectV3[];
  tasks: TaskV3[];
  spaces: Space[];
  memberships: SpaceMember[];
  invitations: Invitation[];
  comments: TaskComment[];
  activity: ActivityEvent[];
  notifications: WorkspaceNotification[];
  syncQueue: SyncMutation[];
};

export type LegacyTaskV1 = Omit<Task, 'dueDate' | 'dueTime' | 'reminderAt' | 'position'>;

export type LegacyWorkspaceV1 = Omit<WorkspaceV2, 'schemaVersion' | 'tasks'> & {
  tasks: LegacyTaskV1[];
};

/** @deprecated Prefer WorkspaceV2. Retained as a compatibility name for existing consumers. */
export type WorkspaceSnapshot = WorkspaceV2;
