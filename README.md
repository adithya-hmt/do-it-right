# DIR — Do It Right

DIR is a warm, local-first task companion for personal life, work, study, family, and shared projects. It combines Inbox, Today, Upcoming, projects, shared Spaces, Daily Three, a focus timer, routines, and weekly reviews without putting an AI agent between people and their work.

Built with Expo SDK 57, Expo Router, React Native, SQLite, and optional Supabase sync. Android is the release-quality target; iOS and web remain functional.

## Run locally

```bash
npm install
npm start
```

Voice capture uses the native `expo-speech-recognition` module and therefore needs a development or release build rather than Expo Go:

```bash
npx expo run:android
```

## Supabase

Copy `.env.example` to `.env.local` and provide the project URL and publishable key. Apply the migrations, then deploy the invitation, invitation-acceptance, and account-deletion functions:

```bash
npx supabase db push
npx supabase functions deploy invite-member
npx supabase functions deploy accept-invitation
npx supabase functions deploy delete-account
```

Personal work requires no account. Email OTP or Google sign-in enables backup and shared Spaces.

## Verification

```bash
npm test
npx tsc --noEmit
npm run lint
npx supabase db lint --local --level warning
npx supabase test db
npx expo export --platform android
```

Product and design decisions are documented in [`docs/dir-product-design.md`](docs/dir-product-design.md). Brand assets and rules are in [`assets/brand/BRAND.md`](assets/brand/BRAND.md).
