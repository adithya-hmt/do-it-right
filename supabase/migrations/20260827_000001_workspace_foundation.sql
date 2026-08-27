-- Do It Right workspace foundation.
-- The existing public.todos table remains the compatibility task API while
-- the richer workspace tables are introduced for self-hosted deployments.

create extension if not exists pgcrypto;

alter table if exists public.todos add column if not exists notes text not null default '';
alter table if exists public.todos add column if not exists status text not null default 'planned' check (status in ('inbox', 'planned', 'in_progress', 'completed', 'cancelled'));
alter table if exists public.todos add column if not exists planned_date date;
alter table if exists public.todos add column if not exists due_at timestamptz;
alter table if exists public.todos add column if not exists estimate_minutes integer not null default 25 check (estimate_minutes between 1 and 1440);
alter table if exists public.todos add column if not exists completed_at timestamptz;
alter table if exists public.todos add column if not exists updated_at timestamptz not null default now();
alter table if exists public.todos add column if not exists deleted_at timestamptz;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Friend' check (char_length(trim(display_name)) between 1 and 60),
  email text,
  avatar_color text not null default '#6D4AFF',
  timezone text not null default 'UTC',
  week_starts_on smallint not null default 1 check (week_starts_on in (0, 1)),
  morning_time time not null default '08:00',
  evening_time time not null default '20:30',
  theme text not null default 'system' check (theme in ('system', 'light', 'dark')),
  reduced_motion boolean not null default false,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.life_areas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null check (char_length(trim(name)) between 1 and 60),
  icon text not null default 'spark',
  color text not null default '#6D4AFF',
  position integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  area_id uuid references public.life_areas(id) on delete set null,
  name text not null check (char_length(trim(name)) between 1 and 100),
  outcome text not null default '',
  notes text not null default '',
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'archived')),
  target_date date,
  color text not null default '#6D4AFF',
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.day_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  plan_date date not null,
  intention text not null default '',
  energy smallint check (energy between 1 and 5),
  reflection text not null default '',
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, plan_date)
);

create table if not exists public.day_plan_tasks (
  day_plan_id uuid not null references public.day_plans(id) on delete cascade,
  task_id uuid not null references public.todos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  role text not null default 'daily_three' check (role in ('daily_three', 'other')),
  position smallint not null default 0,
  primary key (day_plan_id, task_id)
);

create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null check (char_length(trim(title)) between 1 and 100),
  anchor text not null default 'morning' check (anchor in ('morning', 'day', 'evening')),
  days smallint[] not null default '{0,1,2,3,4,5,6}',
  estimate_minutes integer not null default 5 check (estimate_minutes between 1 and 240),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.routine_completions (
  routine_id uuid not null references public.routines(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  completion_date date not null,
  completed_at timestamptz not null default now(),
  primary key (routine_id, completion_date)
);

create table if not exists public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  task_id uuid references public.todos(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_minutes integer not null default 0 check (duration_minutes between 0 and 1440),
  interrupted boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.weekly_reviews (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  week_start date not null,
  wins text not null default '',
  friction text not null default '',
  next_week_intention text not null default '',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, week_start)
);

create index if not exists life_areas_user_position_idx on public.life_areas (user_id, position);
create index if not exists projects_user_status_position_idx on public.projects (user_id, status, position);
create index if not exists day_plans_user_date_idx on public.day_plans (user_id, plan_date desc);
create index if not exists day_plan_tasks_user_idx on public.day_plan_tasks (user_id, day_plan_id, position);
create index if not exists routines_user_active_idx on public.routines (user_id, active);
create index if not exists focus_sessions_user_started_idx on public.focus_sessions (user_id, started_at desc);

alter table public.profiles enable row level security;
alter table public.life_areas enable row level security;
alter table public.projects enable row level security;
alter table public.day_plans enable row level security;
alter table public.day_plan_tasks enable row level security;
alter table public.routines enable row level security;
alter table public.routine_completions enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.weekly_reviews enable row level security;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.life_areas, public.projects, public.day_plans, public.day_plan_tasks, public.routines, public.routine_completions, public.focus_sessions, public.weekly_reviews to authenticated;

drop policy if exists "Users can read their profile" on public.profiles;
create policy "Users can read their profile" on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can create their profile" on public.profiles;
create policy "Users can create their profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can update their profile" on public.profiles;
create policy "Users can update their profile" on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Users can manage their life areas" on public.life_areas;
create policy "Users can manage their life areas" on public.life_areas for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users can manage their projects" on public.projects;
create policy "Users can manage their projects" on public.projects for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users can manage their day plans" on public.day_plans;
create policy "Users can manage their day plans" on public.day_plans for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users can manage their planned tasks" on public.day_plan_tasks;
create policy "Users can manage their planned tasks" on public.day_plan_tasks for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users can manage their routines" on public.routines;
create policy "Users can manage their routines" on public.routines for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users can manage their routine completions" on public.routine_completions;
create policy "Users can manage their routine completions" on public.routine_completions for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users can manage their focus sessions" on public.focus_sessions;
create policy "Users can manage their focus sessions" on public.focus_sessions for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users can manage their weekly reviews" on public.weekly_reviews;
create policy "Users can manage their weekly reviews" on public.weekly_reviews for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
