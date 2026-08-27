# FocusFlow

FocusFlow is a calm, MUI-inspired productivity dashboard built with Expo SDK 55, Expo Router, and React Native. It helps you choose the next meaningful thing, keep active projects visible, and notice your weekly working rhythm.

## Run in Expo Go

```bash
npm install
npx expo start
```

Scan the QR code from the terminal with Expo Go. For devices on different networks, use:

```bash
npx expo start --tunnel
```

## Product slice

- Today: morning brief, momentum score, task filters, completion state, and quick capture.
- Projects: progress cards for active work, personal notes, and rituals.
- Insights: focus score, weekly deep-work chart, and a reflection prompt.
- Add task: modal flow with title, context, and project selection.

The current build uses local React state so it is immediately demoable in Expo Go. Authentication, sync, notifications, and a backend are intentionally left for a future slice.

## Verification

```bash
npx tsc --noEmit
npx expo lint
npx expo export --platform web
```

See [`docs/superpowers/specs/2026-08-27-focusflow-design.md`](docs/superpowers/specs/2026-08-27-focusflow-design.md) for the product and design decisions.
