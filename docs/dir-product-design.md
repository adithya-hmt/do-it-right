# DIR — Do It Right

DIR is a warm, local-first task companion for the whole of a person’s life: private work, shared work, home, study, relationships, routines, and focused effort. It helps people capture a next action quickly and then gets out of the way.

## Product principles

- Human before automation: no generative assistant, no opaque reprioritization, and no task created from voice without a visible review.
- Low-friction capture: one Quick Add surface handles natural dates, projects, assignees, multiple dictated tasks, notes, priority, and estimates.
- Calm for variable attention: compact hierarchy, plain language, forgiving empty states, Daily Three, timeboxes, reduced motion, and completion undo.
- Private until shared: personal work stays device-local without an account. Authentication is requested only for cloud backup or collaboration.
- One model everywhere: Inbox, Today, Upcoming, projects, spaces, comments, activity, and notifications all reference stable task IDs.
- Personal expression: warm defaults with system/light/dark modes, curated palettes, and a validated custom accent.

## Navigation

The five primary destinations are Inbox, Today, Upcoming, Spaces, and You. Quick Add remains reachable from task views, while Search, projects, Focus, Daily Three, routines, weekly review, settings, and account management are one level deep.

Android is the release-quality reference. Tab scenes reserve the status-bar inset, the tab bar reserves the gesture/navigation inset, and floating controls sit inside the scene rather than over system navigation. iOS uses native tabs; web retains the same information architecture through JavaScript tabs.

## Brand

The right-path deer mark combines a gentle guide with an upward check path. Warm terracotta and parchment are the default, with near-black ink and coral reserved for destructive/error states. The mascot is a quiet companion, never a gamified judge.

Production assets and usage rules live in [`assets/brand/BRAND.md`](../assets/brand/BRAND.md).

## Data and collaboration

SQLite is authoritative on-device. `WorkspaceV3` retains every v2 entity and adds spaces, memberships, invitations, task comments, activity, notifications, task assignment, revisions, tombstones, and adaptive appearance. Migration is idempotent; the v1/v2 stores remain untouched for rollback.

Authenticated sync targets normalized `dir_*` Supabase tables protected by row-level security. Personal rows are owner-only. Shared rows are visible to active members; only owners/admins manage membership. Realtime task changes merge by revision and timestamp, while local mutations retry without blocking offline work.
