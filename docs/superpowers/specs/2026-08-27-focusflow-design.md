# Do It Right design

## Product

Do It Right is a portfolio-ready mobile productivity dashboard for people who want a calmer, more intentional day. It turns a short list of meaningful work into a daily brief, shows the shape of active projects, and gives the user one place to capture the next thought.

The first release is local-first so it can run in Expo Go even when accounts or network access are unavailable. Supabase is an optional private sync layer. The UI is inspired by Material UI's restrained use of surfaces, strong primary actions, clear hierarchy, and reusable component tokens, translated into native React Native primitives.

## User flow

1. The user completes a three-step onboarding flow and names the kind of attention they want to protect.
2. Today shows a brief, a Daily Three, optional read-only calendar context, and the rest of the day’s tasks.
3. Plan turns an open task list into one intention and up to three clear starts; routines are checked without streak pressure.
4. The user can capture a task into Inbox or an active project, then begin a lightweight focus session.
5. Projects show progress derived from actual tasks. You holds private signals, life areas, a weekly review, settings, export, and account linking.

## Visual direction

- Warm canvas: `#F6F7F9` with deep ink text and quiet dividers.
- Violet primary: `#6D4AFF`, used for selected states and the main action.
- Coral accent: `#F06A5F` for energy and attention without making the app feel aggressive.
- Rounded, continuous surfaces with subtle shadows and compact spacing.
- Typography uses the platform system font; display text is large and editorial, body text is compact and readable.

## Technical shape

- Expo SDK 57 + Expo Router + TypeScript.
- Routes live under `src/app`, with a root stack and a four-tab group for Today, Plan, Projects, and You.
- Shared UI components live under `src/components`; domain types and rules live under `src/domain`.
- Workspace state is persisted locally through the Expo SQLite-backed localStorage adapter and synchronized through a queued Supabase task API when configured.
- Supabase tables use per-user ownership and Row Level Security. Calendar and reminders are isolated behind platform adapters with web fallbacks.
- All controls use React Native primitives, `ScrollView` for responsive content, `Pressable` for tactile states, and Reanimated entry animations already supported by the Expo template.

## Out of scope

Drag-and-drop scheduling, collaborative workspaces, social profiles, and analytics dashboards remain intentionally out of scope. The goal is a useful private tool with a small surface area and a clear path for community contributions.

## Verification

- TypeScript check with `npx tsc --noEmit`.
- Expo static export with `npx expo export --platform web` to catch route and bundling errors.
- Start with `npx expo start` so the user can scan the QR code in Expo Go.
