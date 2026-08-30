# DIR design authority

DIR is a local-first task companion for people whose attention and energy vary. The interface should reduce the cost of getting a thought out of the head and into one manageable next action.

## Thesis

Make one mark at a time. The first screen is not a dashboard of equal-weight work: it is a calm capture surface, one selected next task, and a quiet list of everything else.

## Visual world

- **Own-world:** a paper-and-ink proof sheet from a small print room.
- **Canvas:** warm paper in light mode (`#F6F1E8`), charcoal ink in dark mode (`#1F1F1F`).
- **Ink:** high-contrast text and dark action surfaces, never gradients.
- **DIR terracotta:** `#E06A3D`, used for the active mark, focus, links, and small attention cues.
- **Type:** heavy rounded system sans for task titles; monospace for labels, dates, estimates, and state names. The type specimen is interactive: direct controls show their state in-place.
- **Shape:** soft but not bubbly: 9/14/22dp radii, thin borders, restrained shadows. A control has one elevation treatment, not stacked effects.

## Core components

### Next Mark

The dark contrast card on Inbox selects one task and offers one primary action: `Start {minutes}`. Completion is a separate square action. The copy makes the scope explicit and removes guilt: “One mark is enough.”

### Quick Capture

The inline composer is the default task entry point. It accepts a rough thought, supports multiple lines, and sends everything to Inbox without requiring sorting. `Enter` / `Keep` commits; `Details` opens the full form only when structure will help.

### Add task

The full form starts with the task sentence. Date presets and timeboxes are visible because they reduce ambiguity; project, notes, people, energy, and kind stay behind `Add extra details`. Natural-language tokens are shown back to the user before save. Voice capture is a transcript input with review, never an autonomous action.

### Proof-line task rows

Rows use a clear 24dp checkbox, a two-line title limit, a compact priority label (`MUST`, `NEXT`, `COULD`), and factual metadata. The focus action is always at least 48dp. Completion removes the row from the active list and preserves the user’s sense of progress.

## Attention-friendly interaction rules

- Keep the first decision singular: capture, start, or finish.
- Make the next action concrete with a visible timebox.
- Use forgiving defaults: Inbox, Personal, medium priority, 25 minutes, no due date.
- Defer classification instead of blocking capture.
- Prefer direct manipulation and inline feedback over modal stacks.
- Use “No rush” and “one mark” language; never use urgency theater, streak pressure, or guilt copy.
- Every important action has a visible label and a 48dp minimum touch target.

## Motion and system behavior

Motion is reserved for list entry, press feedback, and focus transitions. Use short fade/translate-in transitions; avoid looping motion and decorative animation. Respect reduced-motion settings where the platform exposes them. Preserve Android system back behavior and safe-area insets. Native tabs own their platform surface; the content uses shared tokens.

## Accessibility and responsive behavior

- Keep text selectable where it carries meaning.
- Pair icon buttons with accessibility labels and hints.
- Expose selected, expanded, checked, and disabled states through native accessibility props.
- Maintain readable contrast in both modes; dark-mode selected controls use `COLORS.contrast`, not the light `COLORS.ink` token.
- Use ScrollView content inset adjustment and bottom safe-area padding for long forms.
- Let titles wrap to two lines before truncating; avoid horizontal scrolling for essential content.

## Provenance

The direction was selected from Impeccable’s required concept seed: candidate 3, **interactive type specimen**, seed `2bcd52f7`. The implementation brief and product assumptions live in [`PRODUCT.md`](./PRODUCT.md) and [`docs/2026-08-29-dir-redesign-direction.md`](./docs/2026-08-29-dir-redesign-direction.md).
