BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SELECT plan(14);

SELECT has_table('public', 'dir_tasks', 'DIR tasks table exists');
SELECT has_table('public', 'dir_spaces', 'DIR spaces table exists');
SELECT has_table('public', 'dir_space_members', 'DIR memberships table exists');
SELECT has_table('public', 'dir_task_comments', 'DIR task comments table exists');
SELECT has_table('public', 'dir_notifications', 'DIR notifications table exists');
SELECT has_table('public', 'dir_activity_events', 'DIR activity table exists');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid = 'public.dir_tasks'::regclass), 'Task RLS is enabled');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid = 'public.dir_spaces'::regclass), 'Space RLS is enabled');

INSERT INTO auth.users (id, aud, role, email) VALUES
  ('11111111-1111-4111-8111-111111111111', 'authenticated', 'authenticated', 'owner@dir.test'),
  ('22222222-2222-4222-8222-222222222222', 'authenticated', 'authenticated', 'member@dir.test');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
INSERT INTO public.dir_profiles (user_id, display_name) VALUES ('11111111-1111-4111-8111-111111111111', 'Owner');
INSERT INTO public.dir_spaces (id, name, created_by) VALUES ('space-test', 'Test space', '11111111-1111-4111-8111-111111111111');
INSERT INTO public.dir_space_members (id, space_id, user_id, role, status) VALUES ('membership-owner', 'space-test', '11111111-1111-4111-8111-111111111111', 'owner', 'active');
SELECT is((SELECT role FROM public.dir_space_members WHERE id = 'membership-owner'), 'owner', 'Creator can establish the owner membership');

RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
SELECT is_empty('SELECT id FROM public.dir_spaces WHERE id = ''space-test''', 'A non-member cannot read a private space');
SELECT throws_ok(
  $$ INSERT INTO public.dir_space_members (id, space_id, user_id, role, status) VALUES ('escalation', 'space-test', '22222222-2222-4222-8222-222222222222', 'owner', 'active') $$,
  '42501',
  'new row violates row-level security policy for table "dir_space_members"',
  'A user cannot self-promote into another space'
);

RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
INSERT INTO public.dir_space_members (id, space_id, user_id, role, status) VALUES ('membership-peer', 'space-test', '22222222-2222-4222-8222-222222222222', 'member', 'active');
INSERT INTO public.dir_tasks (id, owner_id, space_id, created_by, assignee_id, title)
  VALUES ('task-test', '11111111-1111-4111-8111-111111111111', 'space-test', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'Ship the DIR test');
SELECT is((SELECT count(*)::integer FROM public.dir_activity_events WHERE entity_id = 'task-test'), 1, 'Task changes produce space activity');
RESET ROLE;
SELECT is((SELECT count(*)::integer FROM public.dir_notifications WHERE user_id = '22222222-2222-4222-8222-222222222222' AND entity_id = 'task-test'), 1, 'Assignment creates a notification');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
SELECT lives_ok(
  $$ UPDATE public.dir_tasks SET status = 'completed', revision = 1 WHERE id = 'task-test' $$,
  'Space members can update shared work'
);

SELECT * FROM finish();
ROLLBACK;
