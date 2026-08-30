alter table public.dir_invitations
  alter column email drop not null;

alter table public.dir_invitations
  add column if not exists revoked_at timestamptz;

create index if not exists dir_invitations_space_pending_idx
  on public.dir_invitations(space_id, created_at desc)
  where accepted_at is null and revoked_at is null;
