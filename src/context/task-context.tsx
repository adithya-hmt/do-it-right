import React from 'react';
import { useColorScheme } from 'react-native';

import { buildSeedWorkspace, deriveProjectProgress, getDayKey } from '@/domain/workspace';
import type {
  DayPlan,
  FocusSession,
  LifeArea,
  Profile,
  Project,
  Routine,
  SyncOperation,
  Task,
  TaskCategory,
  TaskPriority,
  TaskStatus,
  WeeklyReview,
  WorkspaceSnapshot,
} from '@/domain/types';
import { loadWorkspace, saveWorkspace } from '@/lib/workspace-store';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { applyTheme } from '@/constants/theme';
import { exportWorkspace } from '@/platform/data-export';

export type {
  DayPlan,
  FocusSession,
  LifeArea,
  Profile,
  Project,
  Routine,
  Task,
  TaskCategory,
  TaskPriority,
  TaskStatus,
  WeeklyReview,
  WorkspaceSnapshot,
} from '@/domain/types';

export type SyncStatus = 'loading' | 'synced' | 'demo' | 'setup' | 'error';

type RemoteTask = {
  id: string;
  name: string;
  project: string;
  category: TaskCategory;
  due: string;
  priority: TaskPriority;
  completed: boolean;
};

type NewTaskInput = {
  title: string;
  category?: TaskCategory;
  project?: string;
  projectId?: string | null;
  notes?: string;
  due?: string;
  plannedDate?: string | null;
  priority?: TaskPriority;
  estimateMinutes?: number;
};

type TaskPatch = Partial<Pick<Task, 'title' | 'notes' | 'projectId' | 'project' | 'category' | 'due' | 'dueAt' | 'plannedDate' | 'priority' | 'estimateMinutes' | 'status'>>;

type TaskContextValue = {
  tasks: Task[];
  projects: Project[];
  areas: LifeArea[];
  profile: Profile;
  todayPlan: DayPlan;
  routines: Routine[];
  routineCompletions: WorkspaceSnapshot['routineCompletions'];
  focusSessions: FocusSession[];
  weeklyReviews: Record<string, WeeklyReview>;
  syncStatus: SyncStatus;
  syncMessage: string | null;
  inboxCount: number;
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
  updateProfile: (patch: Partial<Profile>) => void;
  finishOnboarding: () => void;
  linkEmail: (email: string) => Promise<{ error: string | null }>;
  exportData: () => Promise<boolean>;
  addProject: (input: { name: string; outcome: string; areaId: string }) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  syncNow: () => void;
};

const TaskContext = React.createContext<TaskContextValue | null>(null);
const REMOTE_FIELDS = 'id,name,project,category,due,priority,completed';

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  const uuid = globalThis.crypto?.randomUUID?.();
  return uuid ?? `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toRemoteTask(task: Task) {
  return { name: task.title, project: task.project || 'Inbox', category: task.category, due: task.due || 'Anytime', priority: task.priority, completed: task.completed };
}

function getFriendlyError(error: unknown) {
  const typedError = error as { code?: string; message?: string };
  const code = typedError.code ?? '';
  const message = typedError.message ?? '';
  const lowerMessage = message.toLowerCase();
  if (code === 'PGRST205' || lowerMessage.includes("could not find the table 'public.todos'")) return 'Run supabase/todos.sql in the Supabase SQL Editor to enable cloud sync.';
  if (code === 'anonymous_provider_disabled' || lowerMessage.includes('anonymous')) return 'Enable Anonymous Sign-Ins in Supabase Authentication → Providers.';
  if (lowerMessage.includes('invalid api key') || lowerMessage.includes('failed to fetch')) return 'Check the EXPO_PUBLIC_SUPABASE_URL and publishable key in .env.local.';
  return 'Cloud sync is unavailable right now. Your workspace is still available locally.';
}

function normalizeWorkspace(saved: WorkspaceSnapshot | null, day: string) {
  const seed = buildSeedWorkspace(day);
  if (!saved) return seed;
  return {
    ...seed,
    ...saved,
    profile: { ...seed.profile, ...saved.profile, focusIntent: saved.profile.focusIntent ?? seed.profile.focusIntent },
    areas: saved.areas?.length ? saved.areas : seed.areas,
    projects: saved.projects?.length ? saved.projects : seed.projects,
    tasks: saved.tasks?.length ? saved.tasks : seed.tasks,
    dayPlans: { ...seed.dayPlans, ...saved.dayPlans },
    routines: saved.routines ?? seed.routines,
    routineCompletions: saved.routineCompletions ?? [],
    focusSessions: saved.focusSessions ?? [],
    weeklyReviews: saved.weeklyReviews ?? {},
    syncQueue: saved.syncQueue ?? [],
  } satisfies WorkspaceSnapshot;
}

function queueTaskOperation(queue: SyncOperation[], task: Task, operation: SyncOperation['operation'] = 'upsert') {
  const next: SyncOperation = { id: `op-${task.id}`, entity: 'task', entityId: task.id, operation, payload: task, createdAt: nowIso(), attempts: 0, lastError: null };
  return [...queue.filter((item) => !(item.entity === 'task' && item.entityId === task.id)), next];
}

function mapRemoteTask(remote: RemoteTask, previous: Task | undefined, day: string): Task {
  return {
    id: remote.id,
    title: remote.name,
    notes: previous?.notes ?? '',
    projectId: previous?.projectId ?? null,
    project: remote.project || previous?.project || 'Inbox',
    category: remote.category,
    status: remote.completed ? 'completed' : previous?.status === 'inbox' ? 'inbox' : 'planned',
    due: remote.due || 'Anytime',
    dueAt: previous?.dueAt ?? null,
    plannedDate: previous?.plannedDate ?? day,
    priority: remote.priority,
    estimateMinutes: previous?.estimateMinutes ?? 25,
    completed: remote.completed,
    completedAt: remote.completed ? previous?.completedAt ?? nowIso() : null,
    syncState: 'clean',
    createdAt: previous?.createdAt ?? nowIso(),
    updatedAt: nowIso(),
  };
}

export function TaskProvider({ children }: React.PropsWithChildren) {
  const today = getDayKey(new Date());
  const systemColorScheme = useColorScheme();
  const [workspace, setWorkspace] = React.useState<WorkspaceSnapshot>(() => buildSeedWorkspace(today));
  const [hydrated, setHydrated] = React.useState(false);
  const [syncStatus, setSyncStatus] = React.useState<SyncStatus>(isSupabaseConfigured ? 'loading' : 'demo');
  const [syncMessage, setSyncMessage] = React.useState<string | null>(isSupabaseConfigured ? null : 'Your workspace is saved on this device. Add Supabase variables for cloud sync.');
  const workspaceRef = React.useRef(workspace);
  const syncInFlight = React.useRef(false);

  // Theme tokens are shared by the small native UI surface. Resolve them before
  // rendering children so a preference change is visible in the same render.
  applyTheme(workspace.profile.theme === 'system' ? (systemColorScheme === 'dark' ? 'dark' : 'light') : workspace.profile.theme);

  const replaceWorkspace = React.useCallback((next: WorkspaceSnapshot) => {
    workspaceRef.current = next;
    setWorkspace(next);
    void saveWorkspace(next);
  }, []);

  const commit = React.useCallback((updater: (current: WorkspaceSnapshot) => WorkspaceSnapshot) => {
    setWorkspace((current) => {
      const next = updater(current);
      workspaceRef.current = next;
      void saveWorkspace(next);
      return next;
    });
  }, []);

  const ensureSession = React.useCallback(async () => {
    if (!supabase) return null;
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (sessionData.session) return sessionData.session;
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.session) throw error ?? new Error('Anonymous session was not created.');
    return data.session;
  }, []);

  const hydrateRemote = React.useCallback(async (local: WorkspaceSnapshot) => {
    if (!supabase) return;
    try {
      const session = await ensureSession();
      if (!session) return;
      const { data, error } = await supabase.from('todos').select(REMOTE_FIELDS).eq('user_id', session.user.id).order('created_at', { ascending: true });
      if (error) throw error;
      if (data?.length) {
        const remoteTasks = data.map((item) => mapRemoteTask(item as unknown as RemoteTask, local.tasks.find((task) => task.id === item.id), today));
        replaceWorkspace({ ...local, tasks: remoteTasks, syncQueue: [] });
        setSyncStatus('synced');
        setSyncMessage(null);
        return;
      }
      const { data: seeded, error: seedError } = await supabase.from('todos').insert(local.tasks.map(toRemoteTask)).select(REMOTE_FIELDS);
      if (seedError) throw seedError;
      const syncedTasks = seeded?.length ? seeded.map((item) => mapRemoteTask(item as unknown as RemoteTask, local.tasks.find((task) => task.title === item.name), today)) : local.tasks;
      replaceWorkspace({ ...local, tasks: syncedTasks, syncQueue: [] });
      setSyncStatus('synced');
      setSyncMessage(null);
    } catch (error) {
      setSyncStatus((error as { code?: string }).code === 'PGRST205' ? 'setup' : 'error');
      setSyncMessage(getFriendlyError(error));
    }
  }, [ensureSession, replaceWorkspace, today]);

  React.useEffect(() => {
    let active = true;
    void loadWorkspace().then((saved) => {
      if (!active) return;
      const local = normalizeWorkspace(saved, today);
      replaceWorkspace(local);
      setHydrated(true);
      if (isSupabaseConfigured) void hydrateRemote(local);
    });
    return () => {
      active = false;
    };
  }, [hydrateRemote, replaceWorkspace, today]);

  const syncNow = React.useCallback(async () => {
    if (!supabase || !hydrated || syncInFlight.current) return;
    const queued = workspaceRef.current.syncQueue.filter((operation) => operation.entity === 'task');
    if (!queued.length) {
      if (syncStatus !== 'demo') setSyncStatus('synced');
      return;
    }
    syncInFlight.current = true;
    setSyncStatus('loading');
    try {
      await ensureSession();
      for (const operation of queued) {
        const task = workspaceRef.current.tasks.find((item) => item.id === operation.entityId);
        if (!task) continue;
        const isRemoteId = !task.id.startsWith('local-') && !task.id.startsWith('task-');
        const result = isRemoteId
          ? await supabase.from('todos').update(toRemoteTask(task)).eq('id', task.id).select(REMOTE_FIELDS).single()
          : await supabase.from('todos').insert(toRemoteTask(task)).select(REMOTE_FIELDS).single();
        if (result.error) throw result.error;
        const synced = mapRemoteTask(result.data as unknown as RemoteTask, task, today);
        commit((current) => ({ ...current, tasks: current.tasks.map((item) => item.id === task.id ? synced : item), syncQueue: current.syncQueue.filter((item) => item.id !== operation.id) }));
      }
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
  }, [commit, ensureSession, hydrated, syncStatus, today]);

  React.useEffect(() => {
    if (!hydrated || !workspace.syncQueue.length) return;
    const timer = setTimeout(() => void syncNow(), 0);
    return () => clearTimeout(timer);
  }, [hydrated, syncNow, workspace.syncQueue.length]);

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
      const updated = { ...task, completed, status: completed ? 'completed' as const : 'planned' as const, completedAt: completed ? nowIso() : null, updatedAt: nowIso(), syncState: 'pending' as const };
      return { ...current, tasks: current.tasks.map((item) => item.id === id ? updated : item), syncQueue: queueTaskOperation(current.syncQueue, updated) };
    });
  }, [commit]);

  const addTask = React.useCallback((input: NewTaskInput) => {
    const project = projects.find((item) => item.id === input.projectId) ?? projects.find((item) => item.name === input.project);
    const task: Task = { id: `local-${Date.now()}`, title: input.title.trim(), notes: input.notes ?? '', projectId: project?.id ?? input.projectId ?? null, project: project?.name ?? input.project ?? 'Inbox', category: input.category ?? 'Work', status: input.plannedDate === null ? 'inbox' : 'planned', due: input.due ?? 'Anytime', dueAt: null, plannedDate: input.plannedDate === undefined ? today : input.plannedDate, priority: input.priority ?? 'medium', estimateMinutes: input.estimateMinutes ?? 25, completed: false, completedAt: null, syncState: supabase ? 'pending' : 'clean', createdAt: nowIso(), updatedAt: nowIso() };
    commit((current) => ({ ...current, tasks: [...current.tasks, task], syncQueue: supabase ? queueTaskOperation(current.syncQueue, task) : current.syncQueue }));
  }, [commit, projects, today]);

  const updateTask = React.useCallback((id: string, patch: TaskPatch) => {
    commit((current) => {
      const existing = current.tasks.find((task) => task.id === id);
      if (!existing) return current;
      const updated = { ...existing, ...patch, completed: patch.status ? patch.status === 'completed' : existing.completed, updatedAt: nowIso(), syncState: supabase ? 'pending' as const : existing.syncState };
      return { ...current, tasks: current.tasks.map((task) => task.id === id ? updated : task), syncQueue: supabase ? queueTaskOperation(current.syncQueue, updated) : current.syncQueue };
    });
  }, [commit]);

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

  const updateProfile = React.useCallback((patch: Partial<Profile>) => {
    commit((current) => ({ ...current, profile: { ...current.profile, ...patch } }));
  }, [commit]);

  const finishOnboarding = React.useCallback(() => updateProfile({ onboardingComplete: true }), [updateProfile]);

  const linkEmail = React.useCallback(async (email: string) => {
    if (!supabase) return { error: 'Add Supabase variables in .env.local before linking an account.' };
    try {
      await ensureSession();
      const { error } = await supabase.auth.updateUser({ email: email.trim() });
      if (error) throw error;
      updateProfile({ email: email.trim() });
      return { error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'We could not start account linking.';
      return { error: message };
    }
  }, [ensureSession, updateProfile]);

  const exportData = React.useCallback(() => exportWorkspace(workspaceRef.current), []);

  const addProject = React.useCallback((input: { name: string; outcome: string; areaId: string }) => {
    const project: Project = { id: createId('project'), name: input.name.trim(), eyebrow: 'PERSONAL / ACTIVE', outcome: input.outcome.trim(), summary: input.outcome.trim(), areaId: input.areaId, status: 'active', targetDate: null, color: '#6D4AFF', softColor: '#EEE9FF', position: workspace.projects.length, progress: 0, tasksDone: 0, tasksTotal: 0 };
    commit((current) => ({ ...current, projects: [...current.projects, project] }));
  }, [commit, workspace.projects.length]);

  const updateProject = React.useCallback((id: string, patch: Partial<Project>) => {
    commit((current) => ({ ...current, projects: current.projects.map((project) => project.id === id ? { ...project, ...patch } : project) }));
  }, [commit]);

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
    syncNow: () => void syncNow(),
  }), [addProject, addTask, completeRoutine, exportData, finishFocus, finishOnboarding, isRoutineComplete, linkEmail, projects, saveWeeklyReview, setDailyThree, setIntention, setTaskStatus, startFocus, syncMessage, syncNow, syncStatus, tasks, todayPlan, toggleTask, updateProfile, updateProject, updateTask, workspace.areas, workspace.focusSessions, workspace.profile, workspace.routineCompletions, workspace.routines, workspace.weeklyReviews]);

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const value = React.use(TaskContext);
  if (!value) throw new Error('useTasks must be used inside TaskProvider');
  return value;
}

export const useWorkspace = useTasks;
