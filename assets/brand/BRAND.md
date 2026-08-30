# DIR identity — Warm Proof

DIR — Do It Right is pronounced “deer.” The existing right-path deer is a calm
guide whose check-shaped antler represents choosing and completing the next
right action. The official tagline is **“The next right thing.”**

> `dir-mark.svg` is the deterministic production master. Preserve its exact
> geometry. Every derived asset must continue to use that existing geometry;
> do not redraw, reinterpret, rotate, stretch, or replace the mark.

## Visual direction

**DIR Warm Proof** is a warm paper-and-ink system inspired by a precise proof
sheet from a small print studio. It is editorial, tactile, quiet, and
functional. The system uses generous negative space, restrained outlines,
heavy rounded system sans for decisions, and monospace for factual metadata
and state labels.

Do not use gradients, glass effects, neon glow, decorative blobs, 3D marks,
generic deer illustrations, fake testimonials, or stock imagery. Shadows,
when used in product UI, stay restrained and never stack multiple elevation
effects on one control.

## Production assets

| File | Purpose |
| --- | --- |
| `dir-mark.svg` | Immutable production master and geometry authority |
| `dir-lockup-light.svg` | Mark, wordmark, descriptor, and optional tagline for warm light surfaces |
| `dir-lockup-dark.svg` | Mark, wordmark, descriptor, and optional tagline for charcoal surfaces |
| `dir-warm-proof-brand-board.svg` | 2400 × 1600 implementation reference board |
| `dir-warm-proof-brand-board.png` | 2400 × 1600 direct raster rendering of the board SVG |

The `tagline` group in each lockup may be hidden when space is limited. Keep
the mark and `DIR / DO IT RIGHT` relationship unchanged.

## Light palette

| Token | Value | Use |
| --- | --- | --- |
| Canvas | `#F6F1E8` | Outer workspace and warm-paper field |
| Surface | `#FFFDF8` | Standard cards and sheets |
| Raised surface | `#FFFFFF` | Rarely elevated or selected surface |
| Primary text | `#1F1F1F` | Main copy and text on terracotta actions |
| Secondary text | `#6B665F` | Supporting copy |
| Quiet text | `#746D65` | De-emphasized factual text |
| Divider | `#D8D0C5` | Rules and subtle boundaries |
| Strong outline | `#8A8178` | Controls and construction guides |
| Brand / action | `#E06A3D` | Active mark, focus, links, and primary actions |
| Text on action | `#1F1F1F` | Required foreground on light terracotta |
| Brand text | `#A84422` | Accessible terracotta-adjacent text |
| Brand-soft surface | `#F8DED2` | Quiet active backgrounds |
| Success | `#2E7D5B` | Confirmed completion or positive status |
| Warning | `#855B00` | Caution that does not imply blame |
| Danger | `#B53A3A` | Destructive or error status |
| Information | `#2F6FB7` | Neutral informational status |

## Dark palette

| Token | Value | Use |
| --- | --- | --- |
| Canvas | `#1F1F1F` | Dark workspace field |
| Surface | `#292724` | Standard dark surface |
| Raised surface | `#302D29` | Selected or raised dark surface |
| Primary text | `#FFF9EF` | Main dark-mode copy |
| Secondary text | `#C9C1B7` | Supporting dark-mode copy |
| Quiet text | `#B3AAA0` | De-emphasized dark-mode facts |
| Divider | `#4A443D` | Dark rules and boundaries |
| Strong outline | `#8F867C` | Dark controls and construction guides |
| Brand / action | `#F07A4A` | Dark-mode active mark and primary actions |
| Text on action | `#1F1F1F` | Required foreground on bright terracotta |
| Brand-soft surface | `#442820` | Quiet active dark background |
| Success | `#8FD0A4` | Positive dark-mode status |
| Warning | `#F2C66E` | Caution in dark mode |
| Danger | `#F18A7B` | Destructive or error status in dark mode |
| Information | `#8CB6FF` | Neutral informational status in dark mode |

## Logo use

### Approved configurations

- Use the master mark alone for app icons, compact navigation, and favicons.
- Use `dir-lockup-light.svg` on Canvas, Surface, or Raised surface.
- Use `dir-lockup-dark.svg` on Canvas, Surface, or Raised surface from the dark palette.
- Use the official wordmark as uppercase `DIR`. “Do It Right” may appear as the
  compact descriptor; the public tagline remains “The next right thing.”

### Clear space

Let **x** equal one quarter of the mark width. Keep at least **x** of empty
space on every side of the standalone mark and around the outside of the full
lockup. The clear-space box is measured from the mark’s 128 × 128 viewBox, not
from the visible terracotta paths.

### Minimum size

- Standalone mark: **24 CSS px** or **8 mm** wide minimum.
- Lockup without tagline: **180 CSS px** or **38 mm** wide minimum.
- Lockup with tagline: **280 CSS px** or **55 mm** wide minimum.
- Below the tagline minimum, hide the `tagline` group rather than shrinking it
  into unreadable copy.

### Do not

Do not alter the master paths, move or recolor the eye independently, stretch
the viewBox, add outlines to the mark, place it over busy imagery, apply
gradients or glow, build a new deer variant, or use the generated presentation
board as a substitute production logo.

## Typography

Use a heavy rounded system sans for task titles, the wordmark, and important
actions. Use the platform monospace stack for labels, dates, estimates,
priority labels, and state names. Keep task titles to two lines where possible,
and make factual metadata visibly secondary.

Typography should remain live and selectable in application UI. The SVG
presentation assets use system font stacks and do not package or redistribute
font files.

## Accessibility and contrast

- Always use `#1F1F1F` text and icons on `#E06A3D` and `#F07A4A` actions.
  Their contrast ratios are approximately **4.94:1** and **5.96:1**,
  respectively. White text on these action colors does not meet WCAG AA for
  normal body text.
- `#FFF9EF` on `#1F1F1F` is approximately **15.74:1**.
- `#6B665F` on `#FFFDF8` is approximately **5.60:1**.
- `#A84422` on `#FFFDF8` is approximately **5.88:1**.
- Priority must never be communicated by color alone. Always include the text
  labels `MUST`, `NEXT`, or `COULD`.
- Keep essential controls at least **48 dp** high or wide in product UI, with a
  visible label or an accessible name.
- Preserve readable focus states, two-line task titles, screen-reader labels,
  keyboard access on web, and reduced-motion behavior.
- The brand tone is calm and factual. Never use streak pressure, urgency
  theatre, guilt, or shame-based messaging.
