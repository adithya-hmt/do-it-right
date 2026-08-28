-- DIR collaborative workspace v3. All client-visible identifiers are text so
-- legacy local ids survive account claiming without remapping.

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table public.dir_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 60),
  avatar_color text not null default '#C44F2B',
  timezone text not null default 'UTC',
  appearance jsonb not null default '{"mode":"system","paletteId":"warm","customAccent":null}'::jsonb,
  notification_preferences jsonb not null default '{"invitation":true,"assignment":true,"mention":true,"comment":true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.dir_spaces (
  id text primary key,
  name text not null check (char_length(trim(name)) between 1 and 80),
  description text not null default '',
  color text not null default '#C44F2B',
  created_by uuid not null references auth.users(id) on delete cascade,
  revision bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.dir_space_members (
  id text primary key,
  space_id text not null references public.dir_spaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  status text not null default 'active' check (status in ('invited', 'active', 'removed')),
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (space_id, user_id)
);

create or replace function private.dir_space_role(target_space_id text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role
  from public.dir_space_members
  where space_id = target_space_id
    and user_id = (select auth.uid())
    and status = 'active'
  limit 1
$$;
revoke all on function private.dir_space_role(text) from public, anon;
grant execute on function private.dir_space_role(text) to authenticated;

create table public.dir_invitations (
  id text primary key,
  space_id text not null references public.dir_spaces(id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  invited_by uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.dir_life_areas (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 60),
  icon text not null default 'heart',
  color text not null default '#C44F2B',
  position integer not null default 0,
  revision bigint not null default 0,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.dir_projects (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  space_id text references public.dir_spaces(id) on delete cascade,
  area_id text references public.dir_life_areas(id) on delete set null,
  name text not null check (char_length(trim(name)) between 1 and 100),
  outcome text not null default '',
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'archived')),
  target_date date,
  color text not null default '#C44F2B',
  position integer not null default 0,
  revision bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (space_id is null or area_id is null)
);

create table public.dir_tasks (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  space_id text references public.dir_spaces(id) on delete cascade,
  project_id text references public.dir_projects(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete cascade,
  assignee_id uuid references auth.users(id) on delete set null,
  title text not null check (char_length(trim(title)) between 1 and 300),
  notes text not null default '',
  status text not null default 'inbox' check (status in ('inbox', 'planned', 'in_progress', 'completed', 'cancelled')),
  due_date date,
  due_time time,
  reminder_at timestamptz,
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  estimate_minutes integer not null default 25 check (estimate_minutes between 1 and 1440),
  position integer not null default 0,
  revision bigint not null default 0,
  client_mutation_id text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.dir_task_comments (
  id text primary key,
  task_id text not null references public.dir_tasks(id) on delete cascade,
  space_id text not null references public.dir_spaces(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 4000),
  mentioned_user_ids uuid[] not null default '{}',
  revision bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.dir_activity_events (
  id bigint generated always as identity primary key,
  space_id text not null references public.dir_spaces(id) on delete cascade,
  actor_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null,
  entity_id text not null,
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.dir_notifications (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  space_id text references public.dir_spaces(id) on delete cascade,
  kind text not null check (kind in ('invitation', 'assignment', 'mention', 'comment')),
  entity_id text not null,
  title text not null,
  body text not null default '',
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table public.dir_device_push_tokens (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null unique,
  platform text not null check (platform in ('android', 'ios', 'web')),
  updated_at timestamptz not null default now()
);

create table public.dir_sync_tombstones (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  space_id text references public.dir_spaces(id) on delete cascade,
  entity_type text not null,
  entity_id text not null,
  revision bigint not null,
  deleted_at timestamptz not null default now(),
  unique (entity_type, entity_id, revision)
);

create index dir_members_user_space_idx on public.dir_space_members(user_id, space_id) where status = 'active';
create index dir_tasks_owner_updated_idx on public.dir_tasks(owner_id, updated_at, id);
create index dir_tasks_space_updated_idx on public.dir_tasks(space_id, updated_at, id) where space_id is not null;
create index dir_projects_space_idx on public.dir_projects(space_id, position);
create index dir_comments_task_idx on public.dir_task_comments(task_id, created_at);
create index dir_activity_space_idx on public.dir_activity_events(space_id, created_at desc);
create index dir_notifications_user_idx on public.dir_notifications(user_id, read_at, created_at desc);
create index dir_tombstones_owner_idx on public.dir_sync_tombstones(owner_id, deleted_at, id);

alter table public.dir_profiles enable row level security;
alter table public.dir_spaces enable row level security;
alter table public.dir_space_members enable row level security;
alter table public.dir_invitations enable row level security;
alter table public.dir_life_areas enable row level security;
alter table public.dir_projects enable row level security;
alter table public.dir_tasks enable row level security;
alter table public.dir_task_comments enable row level security;
alter table public.dir_activity_events enable row level security;
alter table public.dir_notifications enable row level security;
alter table public.dir_device_push_tokens enable row level security;
alter table public.dir_sync_tombstones enable row level security;

grant select, insert, update, delete on public.dir_profiles, public.dir_spaces, public.dir_space_members,
  public.dir_invitations, public.dir_life_areas, public.dir_projects, public.dir_tasks, public.dir_task_comments,
  public.dir_notifications, public.dir_device_push_tokens to authenticated;
grant select on public.dir_activity_events, public.dir_sync_tombstones to authenticated;

create policy "dir profiles own" on public.dir_profiles for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "dir spaces members read" on public.dir_spaces for select to authenticated
  using (created_by = (select auth.uid()) or private.dir_space_role(id) is not null);
create policy "dir spaces create" on public.dir_spaces for insert to authenticated
  with check (created_by = (select auth.uid()));
create policy "dir spaces admins update" on public.dir_spaces for update to authenticated
  using (created_by = (select auth.uid()) or private.dir_space_role(id) in ('owner', 'admin'))
  with check (created_by = (select auth.uid()) or private.dir_space_role(id) in ('owner', 'admin'));
create policy "dir spaces owners delete" on public.dir_spaces for delete to authenticated
  using (created_by = (select auth.uid()) or private.dir_space_role(id) = 'owner');

create policy "dir members visible in space" on public.dir_space_members for select to authenticated
  using (user_id = (select auth.uid()) or private.dir_space_role(space_id) is not null);
create policy "dir members admins create" on public.dir_space_members for insert to authenticated
  with check (
    private.dir_space_role(space_id) in ('owner', 'admin')
    or (
      user_id = (select auth.uid())
      and role = 'owner'
      and exists (
        select 1 from public.dir_spaces
        where id = space_id and created_by = (select auth.uid())
      )
    )
  );
create policy "dir members admins update" on public.dir_space_members for update to authenticated
  using (private.dir_space_role(space_id) in ('owner', 'admin'))
  with check (private.dir_space_role(space_id) in ('owner', 'admin'));
create policy "dir members admins delete" on public.dir_space_members for delete to authenticated
  using (private.dir_space_role(space_id) in ('owner', 'admin') or user_id = (select auth.uid()));

create policy "dir invitations admins" on public.dir_invitations for all to authenticated
  using (private.dir_space_role(space_id) in ('owner', 'admin'))
  with check (private.dir_space_role(space_id) in ('owner', 'admin') and invited_by = (select auth.uid()));

create policy "dir life areas own" on public.dir_life_areas for all to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "dir projects visible" on public.dir_projects for select to authenticated
  using (owner_id = (select auth.uid()) or (space_id is not null and private.dir_space_role(space_id) is not null));
create policy "dir projects writable" on public.dir_projects for all to authenticated
  using (owner_id = (select auth.uid()) or (space_id is not null and private.dir_space_role(space_id) is not null))
  with check (
    (space_id is null and owner_id = (select auth.uid()))
    or (space_id is not null and private.dir_space_role(space_id) is not null)
  );
create policy "dir tasks visible" on public.dir_tasks for select to authenticated
  using (owner_id = (select auth.uid()) or (space_id is not null and private.dir_space_role(space_id) is not null));
create policy "dir tasks writable" on public.dir_tasks for all to authenticated
  using (owner_id = (select auth.uid()) or (space_id is not null and private.dir_space_role(space_id) is not null))
  with check (
    (space_id is null and owner_id = (select auth.uid()))
    or (space_id is not null and private.dir_space_role(space_id) is not null)
  );
create policy "dir comments visible" on public.dir_task_comments for select to authenticated
  using (private.dir_space_role(space_id) is not null);
create policy "dir comments create" on public.dir_task_comments for insert to authenticated
  with check (author_id = (select auth.uid()) and private.dir_space_role(space_id) is not null);
create policy "dir comments own update" on public.dir_task_comments for update to authenticated
  using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()) and private.dir_space_role(space_id) is not null);
create policy "dir comments own delete" on public.dir_task_comments for delete to authenticated
  using (author_id = (select auth.uid()) or private.dir_space_role(space_id) in ('owner', 'admin'));
create policy "dir activity visible" on public.dir_activity_events for select to authenticated
  using (private.dir_space_role(space_id) is not null);
create policy "dir notifications own" on public.dir_notifications for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "dir push tokens own" on public.dir_device_push_tokens for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "dir tombstones visible" on public.dir_sync_tombstones for select to authenticated
  using (owner_id = (select auth.uid()) or (space_id is not null and private.dir_space_role(space_id) is not null));

create or replace function private.dir_record_task_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := coalesce((select auth.uid()), new.created_by);
  action_name text := case when tg_op = 'INSERT' then 'created' when new.status = 'completed' and old.status <> 'completed' then 'completed' else 'updated' end;
begin
  if new.space_id is null then return new; end if;
  insert into public.dir_activity_events (space_id, actor_id, entity_type, entity_id, action, payload)
    values (new.space_id, actor, 'task', new.id, action_name, jsonb_build_object('title', new.title));
  if new.assignee_id is not null and new.assignee_id <> actor and (tg_op = 'INSERT' or new.assignee_id is distinct from old.assignee_id) then
    insert into public.dir_notifications (id, user_id, space_id, kind, entity_id, title, body)
      values ((gen_random_uuid())::text, new.assignee_id, new.space_id, 'assignment', new.id, 'A task was assigned to you', new.title);
  end if;
  return new;
end
$$;

create or replace function private.dir_record_comment_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  task_row public.dir_tasks;
  target_user uuid;
begin
  select * into task_row from public.dir_tasks where id = new.task_id;
  insert into public.dir_activity_events (space_id, actor_id, entity_type, entity_id, action, payload)
    values (new.space_id, new.author_id, 'comment', new.id, 'commented', jsonb_build_object('taskId', new.task_id));
  foreach target_user in array array_append(new.mentioned_user_ids, task_row.assignee_id) loop
    if target_user is not null and target_user <> new.author_id then
      insert into public.dir_notifications (id, user_id, space_id, kind, entity_id, title, body)
        values ((gen_random_uuid())::text, target_user, new.space_id,
          case when target_user = any(new.mentioned_user_ids) then 'mention' else 'comment' end,
          new.task_id, 'New task conversation', left(new.body, 180));
    end if;
  end loop;
  return new;
end
$$;

revoke all on function private.dir_record_task_activity() from public, anon, authenticated;
revoke all on function private.dir_record_comment_activity() from public, anon, authenticated;
create trigger dir_task_activity after insert or update on public.dir_tasks for each row execute function private.dir_record_task_activity();
create trigger dir_comment_activity after insert on public.dir_task_comments for each row execute function private.dir_record_comment_activity();

alter publication supabase_realtime add table public.dir_spaces, public.dir_space_members, public.dir_projects,
  public.dir_tasks, public.dir_task_comments, public.dir_notifications;
