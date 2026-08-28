# FocusFlow v2 — Todoist-style workspace

FocusFlow v2 uses Inbox, Today, Upcoming, and Browse as its primary navigation while preserving Daily Three, focus sessions, routines, weekly reviews, projects, local-first persistence, and optional Supabase synchronization.

## Product shape

- Inbox contains every open projectless task, including scheduled projectless tasks.
- Today separates overdue work from work due on the local calendar day and keeps Daily Three and Focus close at hand.
- Upcoming uses a compact date rail and chronological date groups.
- Browse exposes projects, search, Daily Three, Focus, routines, weekly review, completed tasks, and settings.
- Quick Add captures title, notes, project, due date/time, priority, and estimate. Recognized phrases become editable scheduling chips; unrecognized text remains part of the title.
- Task details own editing, scheduling, project assignment, priority, estimate, completion, undo, and cancellation.

## Data and persistence

`WorkspaceV2` is identified by `schemaVersion: 2`. Tasks have explicit `dueDate`, `dueTime`, `reminderAt`, and stable `position` fields while retaining legacy lifecycle fields for compatibility. Pure commands change task state; pure selectors produce each list view.

The SQLite-backed key-value store is authoritative. A migration reads a retained v1 snapshot, validates entity counts and IDs, and writes `focusflow.workspace.v2` without deleting v1. Migration failure blocks the v2 shell only long enough to offer Retry or legacy export. Supabase synchronization remains asynchronous, nonblocking, and retryable.

## Experience and rollout

The interface uses compact hierarchy, rounded dark/light surfaces, FocusFlow purple with coral accents, at least 44-point touch targets, reduced-motion support, accessible labels, keyboard avoidance, predictable Android back behavior, and functional iOS/web fallbacks. Onboarding states plainly that users can start locally and optionally link an account later in Settings.

Legacy storage remains intact for at least one successful release. Recurrence, labels, saved filters, advanced reporting, swipe actions, drag ordering, and active voice recording are outside this release.
