export type TaskStatus = 'inbox' | 'planned' | 'in_progress' | 'completed' | 'cancelled';
export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';
export type RoutineAnchor = 'morning' | 'day' | 'evening';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskCategory = 'Work' | 'Personal';
export type ThemePreference = 'system' | 'light' | 'dark';
export type SyncState = 'clean' | 'pending' | 'failed' | 'conflicted';

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

export type WorkspaceSnapshot = {
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
