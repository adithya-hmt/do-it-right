# FocusFlow design

## Product

FocusFlow is a portfolio-ready mobile productivity dashboard for people who want a calmer, more intentional day. It turns a short list of meaningful work into a daily brief, shows the shape of active projects, and gives the user one place to capture the next thought.

The first release is local and self-contained so it can run in Expo Go without accounts, network permissions, or a backend. The UI is inspired by Material UI's restrained use of surfaces, strong primary actions, clear hierarchy, and reusable component tokens, translated into native React Native primitives.

## User flow

1. The user opens Today and immediately sees their focus score, the current date, and the next three meaningful tasks.
2. They tap a task checkbox to mark it complete; the score and progress update in place.
3. They switch between All, Work, and Personal filters to reduce visual noise.
4. They tap the floating “Add task” action, enter a title, choose a project, and save it.
5. They browse Projects for a higher-level view and Insights for a small weekly reflection.

## Visual direction

- Warm canvas: `#F6F7F9` with deep ink text and quiet dividers.
- Material-inspired primary blue: `#1976D2`, used for selected states and the main action.
- Coral accent: `#F06A5F` for energy and attention without making the app feel aggressive.
- Rounded, continuous surfaces with subtle shadows and compact spacing.
- Typography uses the platform system font; display text is large and editorial, body text is compact and readable.

## Technical shape

- Expo SDK 55 + Expo Router + TypeScript.
- Routes live under `src/app`, with a root stack and a tab group for Today, Projects, and Insights.
- Shared UI components live under `src/components`; tokens and mock data live under `src/constants`.
- State is local React state in the tab layout, passed through a small context so tasks persist while navigating tabs during a session.
- All controls use React Native primitives, `ScrollView` for responsive content, `Pressable` for tactile states, and Reanimated entry animations already supported by the Expo template.

## Out of scope

Authentication, cloud sync, push notifications, drag-and-drop scheduling, and analytics backend are intentionally deferred. The goal is a polished, believable first slice that is easy to extend.

## Verification

- TypeScript check with `npx tsc --noEmit`.
- Expo static export with `npx expo export --platform web` to catch route and bundling errors.
- Start with `npx expo start` so the user can scan the QR code in Expo Go.
