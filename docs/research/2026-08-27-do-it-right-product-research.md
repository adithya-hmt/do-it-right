# Do It Right product research

Date: 2026-08-27  
Scope: current productivity-app landscape and the smallest product surface that would make the local Do It Right Expo app feel complete.

## Executive conclusion

Do It Right already has a coherent point of view: a private, local-first workspace that turns a short list of meaningful work into a calm daily brief, Daily Three, project context, focus sessions, reminders, calendar context, and a weekly reset. That is a stronger identity than “another task list.”

To become a complete product, it should make the whole loop reliable:

`capture → clarify → plan across days → execute → adapt → review → trust the data`

The highest-value additions are: a first-class Inbox and search; dates, deadlines, recurrence, subtasks, notes, tags, and a proper task detail model; Today/Upcoming/Someday views; calendar-aware time planning with explicit write-back boundaries; reliable local notifications; offline conflict-safe sync and account recovery; and a lightweight export/import/backup story. Collaboration, analytics dashboards, AI scheduling, and drag-and-drop scheduling should remain optional or later-stage because they would pull the product away from its private, humane premise.

## Current scope observed in the repository

The README describes a private personal operating system built with Expo SDK 57, Expo Router, React Native, and Supabase, with local-first behavior and optional per-user cloud sync. The workflow includes onboarding, Today, Plan, Projects, Focus, You, weekly reflection, account linking, export, read-only calendar context, and opt-in reminders. [README.md](../../README.md)

The product spec says the first release is local-first, exposes Today/Plan/Projects/You tabs, derives project progress from tasks, persists through an Expo SQLite-backed localStorage adapter, and isolates calendar/reminder integrations behind platform adapters. It explicitly keeps drag-and-drop scheduling, collaboration, social profiles, and analytics dashboards out of scope. [FocusFlow design spec](../superpowers/specs/2026-08-27-focusflow-design.md)

The routes reinforce that scope: Today contains the morning brief, Daily Three, read-only calendar commitments, task filters, projects, and capture; Plan handles intention, selected tasks, routines, and the open list; Projects and project detail show task-derived progress; Focus starts a timer; You links to review, settings, account, export, calendar, and reminders. [Today route](../../src/app/(tabs)/index.tsx) [Plan route](../../src/app/(tabs)/plan.tsx) [Project routes](../../src/app/(tabs)/projects.tsx) [Focus route](../../src/app/focus.tsx) [You route](../../src/app/(tabs)/you.tsx) [Settings route](../../src/app/settings.tsx)

## Observed features in current products

### Todoist: mature task mechanics and retrieval

Todoist supports list, board, day-calendar, week-calendar, and month-calendar layouts, plus grouping and sorting by fields such as date, priority, and project. [Todoist view documentation](https://staging.todoist.com/help/articles/customize-views-in-todoist-AoHhBxFdZ)

Its filters can query task names, dates, projects, labels, priorities, creation dates, subtask status, and more; built-in Today, Upcoming, and Priority views complement custom filters. [Todoist filters](https://www.todoist.com/help/articles/introduction-to-filters-V98wIH)

Todoist’s recurring dates can be entered in natural language, shift to the next occurrence on completion, and support start/end dates and completion-based recurrence. [Todoist recurring dates](https://www.todoist.com/help/articles/introduction-to-recurring-dates-YUYVJJAV)

Its reminders include automatic, custom, recurring, and location-based types, although its documentation notes recurring reminders are not supported on Android. [Todoist reminders](https://www.todoist.com/help/articles/introduction-to-reminders-9PezfU)

### Sunsama: ritualized planning and shutdown

Sunsama positions itself as a daily planner built around a step-by-step daily planning ritual, a full-day view, prioritization, and reduced context switching. [Sunsama daily planning and shutdown](https://www.sunsama.com/features/daily-planning-and-shutdown)

### Structured: timeline, inbox, routines, and lightweight detail

Structured combines tasks and events in a daily timeline and keeps undated items in an Inbox. Its task model includes timeline, all-day, and recurring tasks. [Structured task documentation](https://help.structured.app/en/articles/338050)

Structured also supports subtasks and notes, routines, calendar sync, and moving Inbox tasks onto the timeline. [Structured getting started](https://help.structured.app/en/articles/380546)

### Motion: automated scheduling as a distinct category

Motion auto-schedules tasks using availability, duration, deadlines, priorities, recurring rules, breaks, and existing calendar events; it re-optimizes when the schedule changes and flags work that cannot fit. [Motion auto-scheduling](https://www.usemotion.com/help/time-management/auto-scheduling) [Motion scheduling details](https://www.usemotion.com/help/time-management/auto-scheduling/reference-auto-scheduling/how-auto-scheduling-works-behind-the-scenes)

This is a materially different promise from Do It Right’s intentional manual selection. It is evidence that time-aware planning can be a product category, not evidence that Do It Right should automate the user’s priorities.

### TickTick: bundled execution tools

TickTick combines calendar, Pomodoro, habit tracking, Eisenhower Matrix, statistics, integrations, collaboration, and time-zone support in one product. [TickTick features](https://beta.ticktick.com/features?language=en_US) [TickTick about](https://www.ticktick.com/about)

### Things: calm hierarchy and long-horizon lists

Things separates Today, Upcoming, Anytime, Someday, Inbox, and Logbook; it distinguishes a start date from a deadline and supports projects, areas, headings, checklists, tags, notes, repeating tasks, reminders, calendar events, and natural-language scheduling. [Things scheduling](https://culturedcode.com/things/support/articles/2803579/) [Things Today/Upcoming/Anytime/Someday](https://culturedcode.com/things/support/articles/4001304/) [Things features](https://culturedcode.com/things/features/)

### Notion, Google, and Apple: systems of record and interoperability

Google Tasks provides capture across devices, details, subtasks, due dates, notifications, and creation from Gmail and Calendar. [Google Tasks](https://support.google.com/tasks/answer/7675772?hl=en)

Google Calendar tasks can have a start date/time, planned duration, deadline, and description. [Google Calendar tasks](https://support.google.com/calendar/answer/9901136?hl=en-uk)

Apple Reminders supports tags, templates, and Smart Lists that filter across lists by tags, dates, times, locations, flags, and priority. [Apple Reminders organization](https://support.apple.com/en-euro/119953) [Apple Smart Lists](https://support.apple.com/guide/iphone/use-smart-lists-iphe882772ed/26/ios/26)

Notion was not used as a feature source here because the relevant official product/help pages were not sufficiently retrievable in this research pass; no Notion-specific claim is used in the recommendations.

## Recommendations for a complete Do It Right product

These are recommendations, not claims that the competitors require a particular implementation.

### P0 — close the core loop

1. **Make Inbox first-class.** Every capture should land in Inbox without requiring a date, project, or category. Add a fast capture surface from every tab, then a deliberate clarify flow that assigns project, date, estimate, recurrence, notes, and Daily Three eligibility. This is the clearest gap versus the Inbox patterns documented by Structured and Things. [Structured](https://help.structured.app/en/articles/380546) [Things](https://culturedcode.com/things/support/articles/4001304/)

2. **Upgrade the task model.** Add stable fields for start date, deadline, optional time, duration, recurrence rule, priority, tags, notes, subtasks/checklist, completion timestamp, and archive/logbook state. Keep the default UI quiet by progressively disclosing these fields. The data model should distinguish “when I can start,” “when it must be done,” and “when I want a reminder,” as Things does. [Things scheduling](https://culturedcode.com/things/support/articles/2803579/)

3. **Add horizon views.** Keep Today as the product’s emotional center, then add Upcoming, Anytime, Someday, and completed history. Without these, unfinished work has nowhere humane to go and users cannot trust that a task was deferred rather than lost. The proposed views are grounded in the established date-based model documented by Things. [Things date-based lists](https://culturedcode.com/things/support/articles/4001304/)

4. **Add recurrence that survives completion and editing.** Support daily/weekly/monthly/custom cadence, selected weekdays, and “after completion” recurrence; show the next occurrence clearly and prevent accidental duplicate instances. Todoist and Things both treat recurrence as core task infrastructure. [Todoist recurrence](https://www.todoist.com/help/articles/introduction-to-recurring-dates-YUYVJJAV) [Things repeating to-dos](https://culturedcode.com/things/support/articles/2803564/)

5. **Make rescheduling humane.** Every missed or intentionally deferred task needs a one-tap “tomorrow,” “this week,” “someday,” or “keep in Inbox” action, with no shame language. Preserve the original deadline when the user moves the start date.

### P1 — make planning useful in real time

6. **Move from read-only calendar context to a clear two-way calendar strategy.** First support dependable read-only import across the day and week, with calendar colors, all-day events, time zones, refresh state, and privacy controls. Then offer optional write-back for Do It Right time blocks, with a dedicated calendar and an explicit preview before creating events. Expo’s SDK 55 calendar module can interact with device calendars, events, and reminders and can open native calendar UI; the app should use those capabilities without silently mutating a user’s calendar. [Expo Calendar SDK 55](https://docs.expo.dev/versions/v55.0.0/sdk/calendar/)

7. **Add a lightweight timeline, not automatic calendar Tetris.** Let users place a selected task into an available block, show duration and buffer, and surface overload before the user commits. Treat Motion’s automatic rescheduling as a later experiment because it conflicts with the current product promise of choosing what matters. [Motion auto-scheduling](https://www.usemotion.com/help/time-management/auto-scheduling)

8. **Turn Focus into execution feedback.** Persist focus sessions, associate them with task/project, allow pause/resume, and reflect elapsed focus in the task and weekly review. Add a gentle end-of-session choice: complete, continue, reschedule, or capture a note.

9. **Strengthen routines without streak pressure.** Routines should be reusable templates with schedule, duration, optional checklist, skip/adjust controls, and a quiet history. Structured and Apple both demonstrate the utility of reusable routines/templates. [Structured shortcuts and routines](https://help.structured.app/en/articles/929922) [Apple Reminders templates](https://support.apple.com/en-euro/guide/iphone/iph3735c6147/ios)

### P1 — make the local-first promise trustworthy

10. **Define offline and sync semantics.** Persist an operation log or versioned mutations, expose last-synced time, retry automatically, and provide a conflict screen for rare same-record edits. Account linking must preserve the anonymous local workspace and make recovery testable.

11. **Ship backup and portability as product features.** Export a documented JSON format plus CSV, include schema/version metadata, and add import/restore with a preview. “Export” should be verifiably usable even without Supabase.

12. **Make reminders reliable and understandable.** Support task-specific reminders in addition to morning/evening anchors, notification actions for complete/snooze/open, permission status, rescheduling after edits, and a notification test. Expo documents one-off and repeating local notifications, but remote push is unavailable in Expo Go on Android from SDK 53; local reminders are therefore the right baseline for the Expo Go product path, while push belongs to a development/release build. [Expo Notifications SDK 55](https://docs.expo.dev/versions/v55.0.0/sdk/notifications/)

13. **Add observability without an analytics dashboard.** Capture local diagnostics such as sync errors, queue depth, failed reminder schedules, and export failures; make them visible only in a support/debug area. This protects trust without violating the spec’s analytics-dashboard boundary.

### P2 — improve daily usability and defensibility

14. **Add fast retrieval.** Global search, saved views, tags, project/area filters, and overdue review are the minimum needed once the workspace grows. Todoist’s filter model and Apple’s Smart Lists show why retrieval should be a first-class capability. [Todoist filters](https://www.todoist.com/help/articles/introduction-to-filters-V98wIH) [Apple Smart Lists](https://support.apple.com/guide/iphone/use-smart-lists-iphe882772ed/26/ios/26)

15. **Support platform entry points.** Add share-sheet capture, home-screen/widget entry where the target platform supports it, deep links from notifications, and keyboard/command shortcuts on web/tablet. Things and Structured expose these pathways through widgets, Shortcuts, and share capture. [Things integrations](https://culturedcode.com/things/features/) [Structured Shortcuts](https://help.structured.app/en/articles/929922)

16. **Create a review that closes the loop.** Weekly review should summarize completed work, carried-forward work, focus time, routine consistency, calendar load, and abandoned/paused items, then ask for one next-week intention. Keep it reflective rather than score-driven.

17. **Protect the product’s differentiation.** Keep Daily Three, intention, focus window, humane rescheduling, private/local-first defaults, and “less mental noise” as the center of gravity. Do not add collaboration, public profiles, broad dashboards, or AI auto-prioritization until retention evidence shows the core loop is working.

## Suggested release sequence

### Release 1: trustworthy personal task manager

Inbox, full task detail model, recurrence, subtasks/checklists, Upcoming/Anytime/Someday, search/filtering, reliable local reminders, export/import, and offline-sync diagnostics.

### Release 2: time-aware intentional planner

Week/timeline view, task durations, calendar refresh/time zones, optional write-back preview, rescheduling flows, focus-session history, and reusable routines.

### Release 3: ecosystem and optional intelligence

Widgets/share capture/Shortcuts, richer calendar integrations, conflict resolution UX, and only then experiments with assisted scheduling or natural-language capture. Motion’s capabilities show the ceiling of this category, but they should not define Do It Right’s identity. [Motion AI task manager](https://www.usemotion.com/features/ai-task-manager)

## Completion criteria

The app is product-complete for its stated audience when a user can:

- capture any thought in under a few seconds, offline;
- clarify it later without losing it;
- see what matters today and what happens next week;
- model real work with dates, deadlines, recurrence, duration, notes, and subtasks;
- plan around calendar commitments without unexpected calendar writes;
- start and finish focus sessions with durable history;
- receive, snooze, and act on reminders reliably;
- survive offline use, account linking, reinstall/recovery, and sync conflicts;
- export and restore their workspace;
- finish a weekly review that informs the next plan.

That definition preserves the current design’s small, private surface while covering the practical expectations established by current personal productivity products.

## Source notes

All competitor and platform facts in this report use first-party product pages, help centers, or official platform documentation. Observed features are intentionally separated from recommendations. Source pages were accessed on 2026-08-27.
