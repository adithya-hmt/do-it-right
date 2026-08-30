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

Copy `.env.example` to `.env.local` and provide the project URL and publishable key.

### Auth redirect setup

The native Android/iOS app always sends Supabase to `doitright://auth/callback`. Expo web uses the current browser origin, or the explicit `EXPO_PUBLIC_WEB_AUTH_REDIRECT_URL` value when deployed. This keeps native email links out of `localhost`.

In Supabase Dashboard → Authentication → URL Configuration, set the Site URL to the public web URL for the deployed web app. If you have no web deployment, use `doitright://auth/callback` as the Site URL for native-only testing. Then add these exact Additional Redirect URLs:

```text
doitright://auth/callback
doitright://invite
https://YOUR-WEB-DOMAIN/auth/callback
http://localhost:8081/auth/callback
```

Keep `http://localhost:8081/auth/callback` only for local web testing. The native callback must remain in the list even when the Site URL is your web domain. If you use a different Expo web port, add that exact callback URL too.

Do not replace `{{ .ConfirmationURL }}` in the Supabase email template with a hardcoded localhost URL. Supabase generates the confirmation link from the redirect passed by the app and the allow-list above.

For a deployed Expo web build, set this before building:

```bash
EXPO_PUBLIC_WEB_AUTH_REDIRECT_URL=https://YOUR-WEB-DOMAIN/auth/callback
```

Keep Email enabled for passwordless one-time links. Apply the database migration and deploy the account functions:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
npx supabase functions deploy invite-member
npx supabase functions deploy accept-invitation
npx supabase functions deploy delete-account
```

The migration creates the `dir_profiles`, `dir_spaces`, `dir_space_members`, `dir_tasks`, and related tables used for signed-in users and shared Spaces. `supabase/config.toml` configures a local Supabase instance; it does not change the hosted project's Dashboard URL allow-list or database.

Personal work requires no account. Email OTP or Google sign-in enables backup and shared Spaces.

Google sign-in is optional. If you enable it in Authentication → Providers, configure the Google web client ID/secret and add Supabase's provider callback (`https://<project-ref>.supabase.co/auth/v1/callback`) in Google Cloud. The app uses the native `doitright://auth/callback` redirect and reports a setup message when the provider is not enabled.

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
