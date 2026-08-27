# Do It Right

Do It Right is a private personal operating system for choosing what matters, making a humane plan, and closing the day with less mental noise. It is built with Expo SDK 57, Expo Router, React Native, and Supabase.

## Run in Expo Go

```bash
npm install
npx expo start
```

For Android over USB, use Expo's localhost connection so the CLI can forward the
Metro port through ADB:

```bash
npm run android
```

The device must appear as `device` in `adb devices`.

Scan the QR code from the terminal with Expo Go. For devices on different networks, use:

```bash
npx expo start --tunnel
```

## The workflow

- Onboarding: choose your name, focus intent, and morning anchor.
- Today: a calm brief, Daily Three, read-only calendar context, progress, and quick capture.
- Plan: set an intention, choose up to three tasks, complete routines, and keep the rest in view.
- Projects: see real progress derived from tasks and open a project detail page.
- Focus: start a lightweight timer against a task or project; sessions stay in your private workspace.
- You: review signals, life areas, weekly reflection, settings, account linking, export, calendar, and reminders.

The workspace is local-first so it remains usable offline and immediately demoable in Expo Go. When Supabase is configured, tasks sync to a per-user cloud workspace through Row Level Security.

## Supabase setup

The app is configured for Supabase using the mobile-safe `EXPO_PUBLIC_*` variables in `.env.local`:

```bash
npm install
```

The publishable key is safe to ship in a client app when Row Level Security is enabled. Never put a Supabase service-role or secret key in Expo code.

1. Open the Supabase SQL Editor for the configured project.
2. Run [`supabase/migrations/20260827_000001_workspace_foundation.sql`](supabase/migrations/20260827_000001_workspace_foundation.sql). The older [`supabase/todos.sql`](supabase/todos.sql) file is retained as a minimal compatibility setup.
3. In Authentication → Providers, enable Anonymous Sign-Ins.
4. Restart Expo after changing environment variables:

```bash
npx expo start --clear --tunnel
```

The app creates an anonymous session, loads each user’s tasks, and seeds starter tasks for a new workspace. If the table or provider is not ready, it stays usable with local demo data and shows the setup message in Today. The account screen can later link that anonymous workspace to an email address.

The `@supabase/ssr` package from the Next.js snippet remains installed as requested, but its cookie/middleware helpers are not imported: Expo uses the native Supabase client with persisted SQLite-backed storage instead of Next.js server middleware.

The optional Supabase agent skills are installed under `.agents/skills` for future database and security work. Calendar access is read-only; reminders are opt-in. If a native device API is unavailable in the current Expo Go client, the app falls back gracefully and remains usable.

## Open source

Do It Right is MIT-licensed. See [`CONTRIBUTING.md`](CONTRIBUTING.md), [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md), and [`SECURITY.md`](SECURITY.md).

## Verification

```bash
npm test
npx tsc --noEmit
npx expo lint
npx expo export --platform web
```

See [`docs/superpowers/specs/2026-08-27-focusflow-design.md`](docs/superpowers/specs/2026-08-27-focusflow-design.md) for the product and design decisions.
