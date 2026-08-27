# Do It Right Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the existing Do It Right Expo app as a new public GitHub repository and produce a directly installable Android APK with EAS Build.

**Architecture:** Keep the current local-first Expo Router application and its existing Supabase integration intact. Add only the Android application identity and an EAS preview profile configured with `android.buildType: "apk"`; GitHub stores source and EAS stores the build artifact.

**Tech Stack:** Expo SDK 57, Expo Router, React Native, TypeScript, Jest, Supabase, GitHub CLI, EAS CLI.

**Spec:** `docs/superpowers/specs/2026-08-27-focusflow-design.md`

## Global Constraints

- Preserve the existing user changes in the dirty worktree.
- Do not add `.env.local`, service-role keys, signing keys, or other credentials to Git.
- Use `com.adithyahmt.doitright` as the Android package identifier.
- Use an EAS `preview` profile with `android.buildType` set to `"apk"` for direct installation.
- Run the full project verification suite before committing or claiming completion.
- Create and push the public repository `adithya-hmt/do-it-right` using the authenticated GitHub CLI session.

---

### Task 1: Confirm repository boundary and current source

**Files:**
- Read: `.gitignore`
- Read: `.env.example`
- Read: `app.json`
- Read: `package.json`
- Read: `README.md`

**Interfaces:**
- Consumes: the existing local app and current Git worktree.
- Produces: a confirmed source tree that excludes `.env.local` and other credentials.

- [ ] **Step 1: Check Git status and whitespace errors**

```bash
rtk git status --short --branch
rtk git diff --check
```

Expected: current app changes are visible; no whitespace errors are reported.

- [ ] **Step 2: Check ignored environment files**

```bash
rtk git check-ignore -v .env.local
rtk git ls-files | rg '(^|/)(\.env|.*secret.*|.*service-account.*)' || true
```

Expected: `.env.local` is ignored and no credential files are tracked.

---

### Task 2: Configure Android identity and APK output

**Files:**
- Modify: `app.json`
- Create: `eas.json`

**Interfaces:**
- Consumes: the existing Expo app configuration.
- Produces: an Android package identity and a named EAS profile that outputs an APK.

- [ ] **Step 1: Add the Android package identifier**

Add this field inside the existing `expo.android` object in `app.json`:

```json
"package": "com.adithyahmt.doitright"
```

- [ ] **Step 2: Add the minimal EAS APK profile**

Create `eas.json` with:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

- [ ] **Step 3: Validate Expo configuration**

```bash
npx expo config --type public
```

Expected: Expo resolves the configuration without errors and reports the Android package as `com.adithyahmt.doitright`.

---

### Task 3: Verify the complete application

**Files:**
- Read: `package.json`
- Read: `tests/`
- Read: `src/`

**Interfaces:**
- Consumes: the configured app and existing test suite.
- Produces: fresh evidence that the source tree can test, typecheck, lint, and export.

- [ ] **Step 1: Run unit tests**

```bash
npm test
```

Expected: exit code 0 and zero failed tests.

- [ ] **Step 2: Run TypeScript verification**

```bash
npx tsc --noEmit
```

Expected: exit code 0 with no diagnostics.

- [ ] **Step 3: Run Expo lint**

```bash
npx expo lint
```

Expected: exit code 0 with no lint errors.

- [ ] **Step 4: Run the web export smoke test**

```bash
npx expo export --platform web
```

Expected: exit code 0 and a generated export directory that remains ignored by Git.

---

### Task 4: Create and push the GitHub repository

**Files:**
- Add: all intentional current source, configuration, documentation, tests, and assets in the worktree
- Exclude: `.env.local` and the empty untracked file `0.150.1`

**Interfaces:**
- Consumes: the verified local source tree and authenticated `adithya-hmt` GitHub session.
- Produces: public remote `https://github.com/adithya-hmt/do-it-right` with branch `master`.

- [ ] **Step 1: Review the staged file list**

```bash
rtk git add -A
rtk git restore --staged -- '0.150.1'
rtk git status --short
```

Expected: all intended project files are staged; `.env.local` and `0.150.1` are not staged.

- [ ] **Step 2: Commit the source tree**

```bash
rtk git commit -m "feat: publish Do It Right mobile app"
```

Expected: one commit records the app and release configuration.

- [ ] **Step 3: Create the public GitHub repository**

```bash
gh repo create adithya-hmt/do-it-right --public --source=. --remote=origin --push
```

Expected: GitHub creates the repository, adds `origin`, and pushes `master`.

- [ ] **Step 4: Verify the remote and clean tracked state**

```bash
rtk git remote -v
rtk git status --short --branch
```

Expected: `origin` points to `adithya-hmt/do-it-right`; no intended files remain uncommitted.

---

### Task 5: Build and monitor the Android APK

**Files:**
- Read: `eas.json`
- Read: `app.json`

**Interfaces:**
- Consumes: the pushed Expo project and authenticated EAS account.
- Produces: a completed Android APK artifact URL.

- [ ] **Step 1: Initialize or link the EAS project**

```bash
npx eas-cli@latest init
```

Expected: EAS links or creates the Expo project and may add `extra.eas.projectId` to `app.json`.

- [ ] **Step 2: Commit any EAS project identifier change**

```bash
rtk git diff --check
if ! rtk git diff --quiet -- app.json; then
  rtk git add app.json
  rtk git commit -m "chore: link Expo project to EAS"
  rtk git push
fi
```

Expected: the EAS project identifier is committed and pushed if initialization changed `app.json`; otherwise no empty commit is created.

- [ ] **Step 3: Start the APK build**

```bash
npx eas-cli@latest build --platform android --profile preview
```

Expected: EAS accepts the build and reports a build ID or dashboard URL.

- [ ] **Step 4: Monitor until completion**

```bash
npx eas-cli@latest build:list --platform android --limit 1
```

Expected: the newest `preview` build reaches `finished`; capture its artifact URL and report it to the user.

---
