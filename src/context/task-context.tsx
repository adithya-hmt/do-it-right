import React from 'react';
import { useColorScheme } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { buildSeedWorkspace, deriveProjectProgress, getDayKey } from '@/domain/workspace';
import type {
  DayPlan,
  FocusSession,
  LifeArea,
  ProfileV3,
  ProjectV3,
  Routine,
  Space,
  SpaceMember,
  SyncMutation,
  TaskComment,
  TaskV3,
  TaskCategory,
  TaskPriority,
  TaskStatus,
  WeeklyReview,
  WorkspaceNotification,
  WorkspaceV3,
} from '@/domain/types';
import { exportLegacyWorkspace, loadWorkspace } from '@/lib/workspace-store';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { applyTheme } from '@/constants/theme';
import { exportLegacyJson, exportWorkspace } from '@/platform/data-export';
import { MigrationGate } from '@/components/migration-gate';
import { migrateWorkspaceV2ToV3 } from '@/domain/workspace-v3-migration';
import { createWorkspaceV3Repository, type WorkspaceV3Repository } from '@/lib/workspace-v3-repository';
import { workspaceV3Storage } from '@/lib/workspace-v3-storage';
import { claimGuestWorkspace, getAuthNamespace } from '@/domain/auth';
import { createAuthService, formatAuthError } from '@/lib/auth-service';
import { addTaskComment, createSharedSpace } from '@/domain/collaboration-commands';
import { synchronizeDirWorkspace } from '@/lib/dir-workspace-sync';
import { getSupabaseAuthSettings } from '@/lib/supabase-auth-settings';

export type {
  DayPlan,
  FocusSession,
  LifeArea,
  ProfileV3 as Profile,
  ProjectV3 as Project,
  Routine,
  TaskV3 as Task,
  TaskCategory,
  TaskPriority,
  TaskStatus,
  WeeklyReview,
  WorkspaceV3 as WorkspaceSnapshot,
} from '@/domain/types';

export type SyncStatus = 'loading' | 'synced' | 'demo' | 'setup' | 'error';

type NewTaskInput = {
  title: string;
  category?: TaskCategory;
  project?: string;
  projectId?: string | null;
  notes?: string;
  due?: string;
  plannedDate?: string | null;
  dueDate?: string | null;
  dueTime?: string | null;
  reminderAt?: string | null;
  priority?: TaskPriority;
  estimateMinutes?: number;
  spaceId?: string | null;
  assigneeId?: string | null;
};

type TaskPatch = Partial<Pick<TaskV3, 'title' | 'notes' | 'projectId' | 'project' | 'category' | 'due' | 'dueAt' | 'plannedDate' | 'dueDate' | 'dueTime' | 'reminderAt' | 'priority' | 'estimateMinutes' | 'status' | 'spaceId' | 'assigneeId'>>;

type TaskContextValue = {
  tasks: TaskV3[];
  projects: ProjectV3[];
  areas: LifeArea[];
  profile: ProfileV3;
  todayPlan: DayPlan;
  routines: Routine[];
  routineCompletions: WorkspaceV3['routineCompletions'];
  focusSessions: FocusSession[];
  weeklyReviews: Record<string, WeeklyReview>;
  syncStatus: SyncStatus;
  syncMessage: string | null;
  inboxCount: number;
  spaces: Space[];
  memberships: SpaceMember[];
  comments: TaskComment[];
  activity: WorkspaceV3['activity'];
  notifications: WorkspaceNotification[];
  session: Session | null;
  createSpace: (input: { name: string; description?: string; color?: string }) => string;
  addComment: (taskId: string, body: string) => void;
  markNotificationRead: (id: string) => void;
  inviteMember: (spaceId: string, email: string, role?: 'admin' | 'member') => Promise<{ error: string | null }>;
  toggleTask: (id: string) => void;
  addTask: (task: NewTaskInput) => void;
  updateTask: (id: string, patch: TaskPatch) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  setDailyThree: (ids: string[]) => void;
  setIntention: (intention: string) => void;
  completeRoutine: (id: string, date?: string) => void;
  isRoutineComplete: (id: string, date?: string) => boolean;
  startFocus: (taskId?: string | null, projectId?: string | null) => string;
  finishFocus: (id: string, interrupted?: boolean) => void;
  saveWeeklyReview: (review: WeeklyReview) => void;
  updateProfile: (patch: Partial<ProfileV3>) => void;
  finishOnboarding: () => void;
  linkEmail: (email: string) => Promise<{ error: string | null }>;
  exportData: () => Promise<boolean>;
  addProject: (input: { name: string; outcome: string; areaId: string; spaceId?: string | null }) => void;
  updateProject: (id: string, patch: Partial<ProjectV3>) => void;
  signOut: () => Promise<{ error: string | null }>;
  deleteAccount: () => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  completeAuthUrl: (url: string) => Promise<{ error: string | null }>;
  acceptInvitation: (invitationId: string, token: string) => Promise<{ spaceId: string | null; error: string | null }>;
  syncNow: () => void;
};

const TaskContext = React.createContext<TaskContextValue | null>(null);
const authService = supabase ? createAuthService(supabase) : null;

function nowIso() {
  return new Date().toISOString();
}

function formatTimeLabel(value: string | null | undefined) {
  if (!value) return 'Anytime';
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return value;
  const hour = Number(match[1]);
  if (hour > 23) return value;
  return `${hour % 12 || 12}:${match[2]} ${hour >= 12 ? 'PM' : 'AM'}`;
}

function createId(prefix: string) {
  const uuid = globalThis.crypto?.randomUUID?.();
  return uuid ?? `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getFriendlyError(error: unknown) {
  const typedError = error as { code?: string; message?: string };
  const code = typedError.code ?? '';
  const message = typedError.message ?? '';
  const lowerMessage = message.toLowerCase();
  if (code === 'PGRST205' || lowerMessage.includes("could not find the table 'public.dir_")) return 'Apply the DIR collaboration migration in Supabase to enable cloud sync.';
  if (lowerMessage.includes('invalid api key') || lowerMessage.includes('failed to fetch')) return 'Check the EXPO_PUBLIC_SUPABASE_URL and publishable key in .env.local.';
  return 'Cloud sync is unavailable right now. Your workspace is still available locally.';
}

function normalizeWorkspace(saved: WorkspaceV3 | null, day: string) {
  const seed = migrateWorkspaceV2ToV3(buildSeedWorkspace(day));
  if (!saved) return seed;
  return { ...seed, ...saved, profile: { ...seed.profile, ...saved.profile, appearance: saved.profile.appearance ?? seed.profile.appearance } } satisfies WorkspaceV3;
}

function queueTaskOperation(queue: SyncMutation[], task: TaskV3, operation: SyncMutation['operation'] = 'upsert') {
  const next: SyncMutation = { id: `op-${task.id}`, entity: 'task', entityId: task.id, operation, payload: task, baseRevision: task.revision, createdAt: nowIso(), attempts: 0, lastError: null };
  return [...queue.filter((item) => !(item.entity === 'task' && item.entityId === task.id)), next];
}

function queueEntityOperation(queue: SyncMutation[], entity: SyncMutation['entity'], entityId: string, payload: unknown, baseRevision = 0) {
  const next: SyncMutation = { id: `op-${entity}-${entityId}`, entity, entityId, operation: 'upsert', payload, baseRevision, createdAt: nowIso(), attempts: 0, lastError: null };
  return [...queue.filter((item) => !(item.entity === entity && item.entityId === entityId)), next];
}

export function TaskProvider({ children }: React.PropsWithChildren) {
  const today = getDayKey(new Date());
  const systemColorScheme = useColorScheme();
  const [workspace, setWorkspace] = React.useState<WorkspaceV3>(() => migrateWorkspaceV2ToV3(buildSeedWorkspace(today)));
  const [session, setSession] = React.useState<Session | null>(null);
  const [hydrated, setHydrated] = React.useState(false);
  const [migrationError, setMigrationError] = React.useState<string | null>(null);
  const [migrationAttempt, setMigrationAttempt] = React.useState(0);
  const [syncStatus, setSyncStatus] = React.useState<SyncStatus>(isSupabaseConfigured ? 'loading' : 'demo');
  const [syncMessage, setSyncMessage] = React.useState<string | null>(isSupabaseConfigured ? null : 'Your workspace is saved on this device. Add Supabase variables for cloud sync.');
  const workspaceRef = React.useRef(workspace);
  const repositoryRef = React.useRef<WorkspaceV3Repository | null>(null);
  const syncInFlight = React.useRef(false);

  // Theme tokens are shared by the small native UI surface. Resolve them before
  // rendering children so a preference change is visible in the same render.
  const accent = workspace.profile.appearance.customAccent ?? ({ warm: '#C44F2B', forest: '#3F7352', ocean: '#1976D2', berry: '#9C3F67', gold: '#8A6416', custom: '#C44F2B' }[workspace.profile.appearance.paletteId]);
  applyTheme(workspace.profile.appearance.mode === 'system' ? (systemColorScheme === 'dark' ? 'dark' : 'light') : workspace.profile.appearance.mode, accent);

  const replaceWorkspace = React.useCallback((next: WorkspaceV3) => {
    workspaceRef.current = next;
    setWorkspace(next);
    void repositoryRef.current?.save(next);
  }, []);

  const commit = React.useCallback((updater: (current: WorkspaceV3) => WorkspaceV3) => {
    setWorkspace((current) => {
      const next = updater(current);
      workspaceRef.current = next;
      void repositoryRef.current?.save(next);
      return next;
    });
  }, []);

  const ensureSession = React.useCallback(async () => {
    if (!supabase) return null;
    return authService?.getSession() ?? null;
  }, []);

  const hydrateRemote = React.useCallback(async (local: WorkspaceV3) => {
    if (!supabase) return;
    try {
      const session = await ensureSession();
      if (!session) return;
      const synced = await synchronizeDirWorkspace(supabase, local, session.user.id);
      replaceWorkspace(synced);
      setSyncStatus('synced');
      setSyncMessage(null);
    } catch (error) {
      setSyncStatus((error as { code?: string }).code === 'PGRST205' ? 'setup' : 'error');
      setSyncMessage(getFriendlyError(error));
    }
  }, [ensureSession, replaceWorkspace]);

  React.useEffect(() => {
    let active = true;
    const hydrate = async (nextSession: Session | null) => {
      setHydrated(false);
      setSession(nextSession);
      const namespace = getAuthNamespace(nextSession?.user.id);
      const repository = createWorkspaceV3Repository(workspaceV3Storage, {
        namespace,
        loadV2: namespace === 'guest' ? loadWorkspace : async () => null,
      });
      let loaded = await repository.load();
      if (!loaded && nextSession) {
        const guestRepository = createWorkspaceV3Repository(workspaceV3Storage, { namespace: 'guest', loadV2: loadWorkspace });
        const guest = normalizeWorkspace(await guestRepository.load(), today);
        loaded = claimGuestWorkspace(guest, nextSession.user.id);
        loaded = { ...loaded, profile: { ...loaded.profile, email: nextSession.user.email ?? null } };
        await repository.save(loaded);
      }
      if (!active) return;
      repositoryRef.current = repository;
      const local = normalizeWorkspace(loaded, today);
      workspaceRef.current = local;
      setWorkspace(local);
      setHydrated(true);
      setMigrationError(null);
      if (nextSession && isSupabaseConfigured) void hydrateRemote(local);
    };
    void (async () => {
      try {
        await hydrate(await authService?.getSession() ?? null);
      } catch (error) {
        if (!active) return;
        setMigrationError(error instanceof Error ? error.message : 'Your legacy workspace could not be migrated.');
      }
    })();
    const unsubscribe = authService?.observeSession((nextSession) => {
      void hydrate(nextSession).catch((error) => setMigrationError(error instanceof Error ? error.message : 'DIR could not switch accounts.'));
    });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [hydrateRemote, migrationAttempt, today]);

  const syncNow = React.useCallback(async () => {
    if (!supabase || !hydrated || syncInFlight.current) return;
    syncInFlight.current = true;
    setSyncStatus('loading');
    try {
      const currentSession = await ensureSession();
      if (!currentSession) return;
      const synced = await synchronizeDirWorkspace(supabase, workspaceRef.current, currentSession.user.id);
      replaceWorkspace(synced);
      setSyncStatus('synced');
      setSyncMessage(null);
    } catch (error) {
      const message = getFriendlyError(error);
      commit((current) => ({ ...current, tasks: current.tasks.map((task) => current.syncQueue.some((operation) => operation.entityId === task.id) ? { ...task, syncState: 'failed' } : task), syncQueue: current.syncQueue.map((operation) => ({ ...operation, attempts: operation.attempts + 1, lastError: message })) }));
      setSyncStatus('error');
      setSyncMessage(message);
    } finally {
      syncInFlight.current = false;
    }
  }, [commit, ensureSession, hydrated, replaceWorkspace]);

  React.useEffect(() => {
    if (!hydrated || !workspace.syncQueue.length || syncStatus === 'loading') return;
    const timer = setTimeout(() => void syncNow(), syncStatus === 'error' ? 5000 : 0);
    return () => clearTimeout(timer);
  }, [hydrated, syncNow, syncStatus, workspace.syncQueue.length]);

  React.useEffect(() => {
    if (!supabase || !session || !hydrated) return;
    const client = supabase;
    const ownMutationPrefix = `sync-${session.user.id}-`;
    const channel = client.channel(`dir-tasks-${session.user.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'dir_tasks' }, (payload) => {
      const row = payload.new as { client_mutation_id?: string };
      if (row.client_mutation_id?.startsWith(ownMutationPrefix)) return;
      void syncNow();
    }).subscribe();
    return () => { void client.removeChannel(channel); };
  }, [hydrated, session, syncNow]);

  const tasks = workspace.tasks;
  const projects = React.useMemo(() => workspace.projects.map((project) => {
    const progress = deriveProjectProgress(project.id, tasks);
    return { ...project, progress: progress.value, tasksDone: progress.completed, tasksTotal: progress.total };
  }), [tasks, workspace.projects]);
  const todayPlan = React.useMemo(() => workspace.dayPlans[today] ?? { date: today, intention: '', dailyThree: [], energy: null, reflection: '', closedAt: null }, [today, workspace.dayPlans]);

  const toggleTask = React.useCallback((id: string) => {
    commit((current) => {
      const task = current.tasks.find((item) => item.id === id);
      if (!task) return current;
      const completed = !task.completed;
      const updated = { ...task, completed, status: completed ? 'completed' as const : task.dueDate || task.projectId ? 'planned' as const : 'inbox' as const, completedAt: completed ? nowIso() : null, updatedAt: nowIso(), syncState: 'pending' as const };
      return { ...current, tasks: current.tasks.map((item) => item.id === id ? updated : item), syncQueue: queueTaskOperation(current.syncQueue, updated) };
    });
  }, [commit]);

  const addTask = React.useCallback((input: NewTaskInput) => {
    const project = projects.find((item) => item.id === input.projectId) ?? projects.find((item) => item.name === input.project);
    const dueDate = input.dueDate ?? (input.plannedDate === undefined ? today : input.plannedDate);
    const timestamp = nowIso();
    const task: TaskV3 = { id: `local-${Date.now()}`, title: input.title.trim(), notes: input.notes ?? '', projectId: project?.id ?? input.projectId ?? null, project: project?.name ?? input.project ?? 'Inbox', category: input.category ?? 'Work', status: dueDate === null && !project ? 'inbox' : 'planned', due: input.due && input.due !== input.dueTime ? input.due : formatTimeLabel(input.dueTime), dueAt: null, plannedDate: dueDate, dueDate, dueTime: input.dueTime ?? null, reminderAt: input.reminderAt ?? null, position: workspace.tasks.length, priority: input.priority ?? 'medium', estimateMinutes: input.estimateMinutes ?? 25, completed: false, completedAt: null, syncState: session ? 'pending' : 'clean', createdAt: timestamp, updatedAt: timestamp, spaceId: input.spaceId ?? project?.spaceId ?? null, createdBy: session?.user.id ?? workspace.profile.id, assigneeId: input.assigneeId ?? null, revision: 0, deletedAt: null };
    commit((current) => ({ ...current, tasks: [...current.tasks, task], syncQueue: session ? queueTaskOperation(current.syncQueue, task) : current.syncQueue }));
  }, [commit, projects, session, today, workspace.profile.id, workspace.tasks.length]);

  const updateTask = React.useCallback((id: string, patch: TaskPatch) => {
    commit((current) => {
      const existing = current.tasks.find((task) => task.id === id);
      if (!existing) return current;
      const updated = { ...existing, ...patch, completed: patch.status ? patch.status === 'completed' : existing.completed, updatedAt: nowIso(), revision: existing.revision + 1, syncState: session ? 'pending' as const : existing.syncState };
      return { ...current, tasks: current.tasks.map((task) => task.id === id ? updated : task), syncQueue: session ? queueTaskOperation(current.syncQueue, updated) : current.syncQueue };
    });
  }, [commit, session]);

  const setTaskStatus = React.useCallback((id: string, status: TaskStatus) => updateTask(id, { status }), [updateTask]);

  const setDailyThree = React.useCallback((ids: string[]) => {
    commit((current) => ({ ...current, dayPlans: { ...current.dayPlans, [today]: { ...(current.dayPlans[today] ?? { date: today, intention: '', dailyThree: [], energy: null, reflection: '', closedAt: null }), date: today, dailyThree: ids.slice(0, 3) } } }));
  }, [commit, today]);

  const setIntention = React.useCallback((intention: string) => {
    commit((current) => ({ ...current, dayPlans: { ...current.dayPlans, [today]: { ...(current.dayPlans[today] ?? { date: today, intention: '', dailyThree: [], energy: null, reflection: '', closedAt: null }), date: today, intention } } }));
  }, [commit, today]);

  const completeRoutine = React.useCallback((id: string, date = today) => {
    commit((current) => current.routineCompletions.some((item) => item.routineId === id && item.date === date) ? current : { ...current, routineCompletions: [...current.routineCompletions, { routineId: id, date, completedAt: nowIso() }] });
  }, [commit, today]);

  const isRoutineComplete = React.useCallback((id: string, date = today) => workspace.routineCompletions.some((item) => item.routineId === id && item.date === date), [today, workspace.routineCompletions]);

  const startFocus = React.useCallback((taskId: string | null = null, projectId: string | null = null) => {
    const session: FocusSession = { id: createId('focus'), taskId, projectId, startedAt: nowIso(), endedAt: null, durationMinutes: 0, interrupted: false };
    commit((current) => ({ ...current, focusSessions: [...current.focusSessions, session] }));
    return session.id;
  }, [commit]);

  const finishFocus = React.useCallback((id: string, interrupted = false) => {
    commit((current) => ({ ...current, focusSessions: current.focusSessions.map((session) => {
      if (session.id !== id || session.endedAt) return session;
      const durationMinutes = Math.max(1, Math.round((Date.now() - new Date(session.startedAt).getTime()) / 60000));
      return { ...session, endedAt: nowIso(), durationMinutes, interrupted };
    }) }));
  }, [commit]);

  const saveWeeklyReview = React.useCallback((review: WeeklyReview) => {
    commit((current) => ({ ...current, weeklyReviews: { ...current.weeklyReviews, [review.weekStart]: review } }));
  }, [commit]);

  const updateProfile = React.useCallback((patch: Partial<ProfileV3>) => {
    commit((current) => {
      const profile = { ...current.profile, ...patch };
      return { ...current, profile, syncQueue: session ? queueEntityOperation(current.syncQueue, 'profile', profile.id, profile) : current.syncQueue };
    });
  }, [commit, session]);

  const finishOnboarding = React.useCallback(() => updateProfile({ onboardingComplete: true }), [updateProfile]);

  const linkEmail = React.useCallback(async (email: string) => {
    if (!supabase) return { error: 'Add Supabase variables in .env.local before linking an account.' };
    try {
      const authSettings = await getSupabaseAuthSettings();
      if (authSettings && !authSettings.email) return { error: formatAuthError('Unsupported provider: email is not enabled', 'Email sign-in is unavailable.', 'email') };
      await authService?.signInWithEmailOtp(email.trim(), Linking.createURL('auth/callback'));
      return { error: null };
    } catch (error) {
      const message = formatAuthError(error, 'We could not start account linking.', 'email');
      return { error: message };
    }
  }, []);

  const signOut = React.useCallback(async () => {
    if (!authService) return { error: null };
    try {
      await authService.signOut();
      return { error: null };
    } catch (error) {
      return { error: formatAuthError(error, 'DIR could not sign out.') };
    }
  }, []);

  const deleteAccount = React.useCallback(async () => {
    if (!authService) return { error: 'Cloud accounts are not configured.' };
    try {
      await authService.deleteAccount();
      return { error: null };
    } catch (error) {
      return { error: formatAuthError(error, 'DIR could not delete this account.') };
    }
  }, []);

  const signInWithGoogle = React.useCallback(async () => {
    if (!authService) return { error: 'Add Supabase variables before signing in.' };
    try {
      const authSettings = await getSupabaseAuthSettings();
      if (authSettings && !authSettings.google) return { error: formatAuthError('Unsupported provider: google is not enabled', 'Google sign-in is unavailable.', 'google') };
      const redirectTo = Linking.createURL('auth/callback');
      await authService.signInWithGoogle(redirectTo, async (url, callback) => {
        const result = await WebBrowser.openAuthSessionAsync(url, callback);
        return result.type === 'success' ? result.url : null;
      });
      return { error: null };
    } catch (error) {
      return { error: formatAuthError(error, 'Google sign-in did not finish.', 'google') };
    }
  }, []);

  const completeAuthUrl = React.useCallback(async (url: string) => {
    if (!authService) return { error: 'Cloud accounts are not configured.' };
    try {
      await authService.completeAuthUrl(url);
      return { error: null };
    } catch (error) {
      return { error: formatAuthError(error, 'DIR could not complete sign-in.') };
    }
  }, []);

  const acceptInvitation = React.useCallback(async (invitationId: string, token: string) => {
    if (!supabase || !session) return { spaceId: null, error: 'Sign in with the invited email first.' };
    try {
      const { data, error } = await supabase.functions.invoke<{ spaceId: string }>('accept-invitation', { body: { invitationId, token } });
      if (error) throw error;
      return { spaceId: data?.spaceId ?? null, error: null };
    } catch (error) {
      return { spaceId: null, error: error instanceof Error ? error.message : 'DIR could not accept this invitation.' };
    }
  }, [session]);

  const exportData = React.useCallback(() => exportWorkspace(workspaceRef.current), []);

  const addProject = React.useCallback((input: { name: string; outcome: string; areaId: string; spaceId?: string | null }) => {
    const spaceId = input.spaceId ?? null;
    const project: ProjectV3 = { id: createId('project'), name: input.name.trim(), eyebrow: spaceId ? 'SHARED / ACTIVE' : 'PERSONAL / ACTIVE', outcome: input.outcome.trim(), summary: input.outcome.trim(), areaId: spaceId ? '' : input.areaId, status: 'active', targetDate: null, color: '#C44F2B', softColor: '#F9E5DC', position: workspace.projects.length, progress: 0, tasksDone: 0, tasksTotal: 0, spaceId, createdBy: session?.user.id ?? workspace.profile.id, revision: 0, deletedAt: null };
    commit((current) => ({ ...current, projects: [...current.projects, project], syncQueue: session ? queueEntityOperation(current.syncQueue, 'project', project.id, project) : current.syncQueue }));
  }, [commit, session, workspace.profile.id, workspace.projects.length]);

  const updateProject = React.useCallback((id: string, patch: Partial<ProjectV3>) => {
    commit((current) => {
      const project = current.projects.find((item) => item.id === id);
      if (!project) return current;
      const updated = { ...project, ...patch, revision: project.revision + 1 };
      return { ...current, projects: current.projects.map((item) => item.id === id ? updated : item), syncQueue: session ? queueEntityOperation(current.syncQueue, 'project', id, updated, project.revision) : current.syncQueue };
    });
  }, [commit, session]);

  const createSpace = React.useCallback((input: { name: string; description?: string; color?: string }) => {
    const id = createId('space');
    const timestamp = nowIso();
    const userId = session?.user.id ?? workspace.profile.id;
    commit((current) => {
      const next = createSharedSpace(current, { id, memberId: createId('member'), userId, name: input.name, description: input.description, color: input.color, now: timestamp });
      const space = next.spaces.find((item) => item.id === id)!;
      const member = next.memberships.find((item) => item.spaceId === id && item.userId === userId)!;
      const queue = session ? queueEntityOperation(queueEntityOperation(current.syncQueue, 'space', id, space), 'membership', member.id, member) : current.syncQueue;
      return { ...next, syncQueue: queue };
    });
    return id;
  }, [commit, session, workspace.profile]);

  const addComment = React.useCallback((taskId: string, body: string) => {
    const task = workspaceRef.current.tasks.find((item) => item.id === taskId);
    if (!task?.spaceId || !body.trim()) return;
    commit((current) => {
      const next = addTaskComment(current, { id: createId('comment'), taskId, authorId: session?.user.id ?? workspaceRef.current.profile.id, body, now: nowIso() });
      const added = next.comments[next.comments.length - 1];
      return { ...next, syncQueue: session ? queueEntityOperation(current.syncQueue, 'comment', added.id, added) : current.syncQueue };
    });
  }, [commit, session]);

  const markNotificationRead = React.useCallback((id: string) => {
    commit((current) => ({ ...current, notifications: current.notifications.map((notification) => notification.id === id ? { ...notification, readAt: nowIso() } : notification) }));
    if (supabase && session) void supabase.from('dir_notifications').update({ read_at: nowIso() }).eq('id', id);
  }, [commit, session]);

  const inviteMember = React.useCallback(async (spaceId: string, email: string, role: 'admin' | 'member' = 'member') => {
    if (!supabase || !session) return { error: 'Sign in before inviting someone.' };
    try {
      const { error } = await supabase.functions.invoke('invite-member', { body: { spaceId, email: email.trim().toLocaleLowerCase(), role } });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'DIR could not send the invitation.' };
    }
  }, [session]);

  const value = React.useMemo<TaskContextValue>(() => ({
    tasks,
    projects,
    areas: workspace.areas,
    profile: workspace.profile,
    todayPlan,
    routines: workspace.routines,
    routineCompletions: workspace.routineCompletions,
    focusSessions: workspace.focusSessions,
    weeklyReviews: workspace.weeklyReviews,
    syncStatus,
    syncMessage,
    spaces: workspace.spaces,
    memberships: workspace.memberships,
    comments: workspace.comments,
    activity: workspace.activity,
    notifications: workspace.notifications,
    session,
    inboxCount: tasks.filter((task) => task.status === 'inbox' && !task.completed).length,
    toggleTask,
    addTask,
    updateTask,
    setTaskStatus,
    setDailyThree,
    setIntention,
    completeRoutine,
    isRoutineComplete,
    startFocus,
    finishFocus,
    saveWeeklyReview,
    updateProfile,
    finishOnboarding,
    linkEmail,
    exportData,
    addProject,
    updateProject,
    createSpace,
    addComment,
    markNotificationRead,
    inviteMember,
    signOut,
    deleteAccount,
    signInWithGoogle,
    completeAuthUrl,
    acceptInvitation,
    syncNow: () => void syncNow(),
  }), [acceptInvitation, addComment, addProject, addTask, completeAuthUrl, completeRoutine, createSpace, deleteAccount, exportData, finishFocus, finishOnboarding, inviteMember, isRoutineComplete, linkEmail, markNotificationRead, projects, saveWeeklyReview, session, setDailyThree, setIntention, setTaskStatus, signInWithGoogle, signOut, startFocus, syncMessage, syncNow, syncStatus, tasks, todayPlan, toggleTask, updateProfile, updateProject, updateTask, workspace.activity, workspace.areas, workspace.comments, workspace.focusSessions, workspace.memberships, workspace.notifications, workspace.profile, workspace.routineCompletions, workspace.routines, workspace.spaces, workspace.weeklyReviews]);

  if (!hydrated) return <MigrationGate error={migrationError} onRetry={() => { setMigrationError(null); setMigrationAttempt((attempt) => attempt + 1); }} onExport={() => { void exportLegacyWorkspace().then((raw) => raw ? exportLegacyJson(raw) : false); }} />;

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const value = React.use(TaskContext);
  if (!value) throw new Error('useTasks must be used inside TaskProvider');
  return value;
}

export const useWorkspace = useTasks;
