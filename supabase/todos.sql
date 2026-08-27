-- Run this script in the Supabase SQL Editor before testing cloud sync.
-- The app uses anonymous auth, so enable Anonymous Sign-Ins in
-- Authentication > Providers after running this script.

create extension if not exists pgcrypto;

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null check (char_length(trim(name)) > 0),
  project text not null default 'Inbox',
  category text not null default 'Work' check (category in ('Work', 'Personal')),
  due text not null default 'Anytime',
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.todos enable row level security;

grant select, insert, update on public.todos to authenticated;

drop policy if exists "Users can read their own todos" on public.todos;
create policy "Users can read their own todos"
  on public.todos
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own todos" on public.todos;
create policy "Users can create their own todos"
  on public.todos
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own todos" on public.todos;
create policy "Users can update their own todos"
  on public.todos
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create index if not exists todos_user_created_at_idx
  on public.todos (user_id, created_at);
