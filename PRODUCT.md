# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

## Users

Primary users are people managing personal life, work, study, home, health, and shared projects from an Android phone, especially people with variable attention who need to capture an idea quickly and start the next action without a heavy planning ritual.

## Product Purpose

DIR — Do It Right is a local-first task companion. It helps a person get a task out of their head, make one useful next decision, and finish what matters without shame, noisy automation, or an AI intermediary.

## Positioning

The product's differentiator is a human-controlled loop: capture quickly, review what was understood, choose a small next action, and keep personal work private on-device until sharing is intentional.

## Operating Context

The app is used in short bursts throughout a day on Android. The primary loop is capture → clarify just enough → choose one next task → focus or complete → undo if needed. Inbox, Today, Upcoming, projects, shared Spaces, Daily Three, Focus, routines, weekly reviews, Search, settings, and account management remain available one level deep.

## Capabilities and Constraints

- SQLite is authoritative on-device; optional Supabase sync supports backup and collaboration.
- The five primary destinations are Inbox, Today, Upcoming, Spaces, and You.
- Quick Add supports natural dates, projects, assignees, multiple dictated tasks, notes, priority, and estimates, with visible review before saving.
- Voice capture is opt-in and reviewable; the product does not create tasks from voice invisibly.
- Preserve stable task IDs, existing routes, local-first behavior, optional authentication, collaboration, completion undo, Daily Three, focus timer, routines, and theme preferences.
- Android is the release-quality reference; iOS and web remain functional.

## Brand Commitments

The product is DIR — Do It Right, pronounced “deer.” The right-path deer is a calm guide and check-shaped antler: the next right action without pressure or shame. Preserve the production deer mark and the tagline “The next right thing.”

## Evidence on Hand

- Existing product decisions: `docs/dir-product-design.md`
- Existing brand rules and assets: `assets/brand/BRAND.md` and `assets/brand/`
- Existing runnable implementation: `src/app/`, `src/components/`, `src/context/`, `src/domain/`
- No customer research, testimonials, or commercial claims are supplied; do not invent any.

## Product Principles

- Human control over automation.
- Low-friction capture with visible review.
- Make the next action smaller and more obvious.
- Calm support for variable attention, without guilt or gamification.
- Private by default; collaboration is intentional.

## Accessibility & Inclusion

The interface must support ADHD-friendly use: low cognitive load, clear single-step primary actions, forgiving empty states, plain language, undo for completion, reduced motion, generous touch targets, readable contrast, and no shame-based urgency or streak pressure. Support system light/dark mode and larger text without clipping.
