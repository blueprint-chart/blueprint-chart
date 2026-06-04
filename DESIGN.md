# Blueprint Chart Design System

This file is the design contract for the editor and UI packages. It records the
system as built, so changes are deliberate rather than drift. The runtime
source of truth for every value below is
`packages/ui/src/styles/tokens.scss`. If this file and tokens.scss disagree,
tokens.scss wins; update this file.

Classifier: the editor is an APP UI (workspace wizard, data-dense,
task-focused). Calm surfaces, strong typography, few colors, dense but
readable. The landing page is marketing and may be louder, but draws from the
same tokens.

## Typography

Three faces, each with one job:

| Face | Role | Notes |
|---|---|---|
| Geist Sans (variable) | Body, UI chrome, nav, forms | Bootstrap `$font-family-sans-serif`. Inter and system-ui are fallbacks only, never targets. |
| Geist Mono | DSL editor, embed code, data, kbd chips, chart-type badges | `$font-family-monospace` |
| DM Serif Display | Display moments: landing hero, page headlines, gallery card titles, panel section titles. Apply via `.bc-display`. | See the 400-only rule below. |

Rules:

- **DM Serif Display ships weight 400 only.** Never set `font-weight: 700` (or
  any non-400 weight) on a `.bc-display` element. The browser synthesizes a
  fake bold that reads like a Times New Roman fallback. If a serif title needs
  more presence, increase the size, not the weight.
- `.bc-display` is never applied to chart frame text (`.bc-frame-*`). Chart
  frames stay sans and neutral; the serif belongs to the app shell.
- Type scale lives in tokens as `--bs-font-size-*`:
  xs 12px (eyebrow labels, badges), sm 14px (sub-body, DSL code), md 16px
  (body, nav, breadcrumbs), lg 20px (panel/page section titles), xl 30px
  (page h1), 2xl 38px (dashboard title), hero 64px (landing h1).
- Body text never below 16px; captions never below 12px.
- Every page has exactly one `h1`, no skipped heading levels below it.
- Ellipsis is the character `…`, never three dots. Loading labels end with `…`.
- Keyboard hints derive from `usePlatformShortcut`
  (`packages/editor/src/composables/usePlatformShortcut.ts`). Never hardcode
  `⌘` or `Ctrl` in markup; the composable picks the right modifier per
  platform and keeps hint and handler in sync.

## Color

Brand scale is Prussian Blue (`$prussian-50` through `$prussian-900`), with
`$prussian-500` `#2563A0` as `$primary`. Semantic colors: success `#2D8659`,
info `$prussian-300`, warning `#D4A63A`, danger `#C94044`.

Rules:

- One accent. UI chrome is neutral; Prussian blue marks primary actions,
  selection, focus, and links. If a second accent feels necessary, the layout
  is probably shouting; fix hierarchy first.
- Neutrals are cool and come from tokens, never ad-hoc hex. Surface hierarchy
  (void > tile > elevated): `--bc-chrome-bg`, `--bc-content-bg`,
  `--bc-tile-bg`, `--bc-tile-bg-elevated`.
- Hairlines and washes are alpha-based tokens (`--bc-hairline`,
  `--bc-hairline-strong`, `--bc-wash-soft/firm/input/input-hover`) so they
  work on any surface in both themes.
- Dark mode is a full token swap on `[data-bs-theme="dark"]` (aliased to
  `.dark` for the docs site). Dark surfaces use elevation steps, not plain
  lightness inversion. Never branch on theme in component CSS when a token
  can carry the difference.
- Tooltips follow Bootstrap 5.3's inverted convention (dark-on-light theme
  shows dark tooltips, dark theme shows light tooltips). This is intentional;
  do not override per-component.
- The blueprint canvas (`--bc-canvas-bg` `#244a7c` with white grid lines) is
  the product's brand moment. It is identical in light and dark themes and is
  not a general-purpose surface.
- Contrast floors: body text 4.5:1, large text and UI components 3:1. Never
  encode meaning with color alone.

## Spacing, radius, elevation

- Spacing follows Bootstrap's rem scale; sub-rem fine-tuning uses simple
  fractions (0.25/0.5/0.625/0.75rem). No magic pixel values in new code.
- Radius tokens: `--bc-radius-xs` 4px, `sm` 6px, `md` 8px, `lg` 12px,
  `pill` 999px. Pick by nesting depth, not taste: outer containers get larger
  radii than inner elements. No uniform bubbly radius on everything.
- Shadows: `--bc-shadow-overlay` for floating UI (pickers, strips, popovers).
  Cards on tiles use hairline borders, not shadows (`--bs-card-box-shadow`
  is none on purpose).

## Motion

- Easing: `--bc-ease` (cubic-bezier 0.4, 0, 0.2, 1).
- Durations: `--bc-duration-fast` 100ms, `base` 150ms, `slow` 250ms. All three
  collapse to 0ms under `prefers-reduced-motion: reduce`; never animate with
  raw durations because they bypass that.
- Animate `transform` and `opacity` only. List transition properties
  explicitly; `transition: all` is banned.

## Interaction states

- Every interactive element has hover, focus-visible, and (where applicable)
  disabled states. Focus uses `--bc-focus-ring`; never `outline: none`
  without a replacement.
- **Hover is an enhancement, never the only path.** Anything that expands or
  reveals on mouseenter must also open on click/Enter, or touch and keyboard
  users cannot reach it (see CanvasModePicker for the pattern).
- Disabled buttons use a neutral wash surface with muted text and
  `cursor: not-allowed`. Never fade the primary color: washed primary with
  white text reads as a rendering bug.
- Button labels never wrap (`ButtonIcon` enforces `white-space: nowrap`).
  Constrained containers use the `truncate` prop for an ellipsis.
- Icon-only buttons always carry an `aria-label`.
- Breadcrumbs: wayfinding link crumbs ("My Charts") stay whole; the active
  chart-title crumb absorbs truncation.

## Layout and responsive

- Breakpoints are Bootstrap's (sm 576, md 768, lg 992, xl 1200, xxl 1400).
  Narrow behavior keys off `useBreakpoint` (default md), not ad-hoc media
  queries in script.
- Narrow viewports get real layout changes, not crushed desktop rows: the
  navbar drops the wordmark (logo stays), search collapses to a fixed icon
  square, the floating scene timeline is replaced by the dock + bottom
  drawer.
- Fixed-size floating controls in flex rows need `flex-shrink: 0`; otherwise
  a crowded row crushes them.
- Anything overlaying a scrollable region must leave the underlying content
  reachable. CodeMirror and other internal scrollers need bottom clearance
  equal to the overlay height (`--fst-clearance` pattern in ChartEditPanel).

## SVG and chart serialization

- Charts are serialized to data-URI thumbnails and downloadable SVG. XML 1.0
  forbids control characters in attribute values, and multi-series chart
  types build d3 join keys as `label + '\u0000' + series`. Any value stamped
  into a DOM attribute must be encoded first; `encodeKeyForAttr` in
  `packages/lib/src/transitions/feature-join.ts` is the canonical encoder
  (control chars become U+241F). If you add a new attribute that carries
  composite keys, run it through the same encoder and encode lookups
  identically.

## Conventions

- BEM-ish class naming (`block__element--modifier`), `bc-` prefix for shared
  design-system classes and CSS variables.
- Component CSS is scoped; cross-component contracts travel through CSS
  variables (`--fst-*`, `--canvas-*`, `--bc-*`), documented where defined.
- Copy: utility language for the app (orientation, status, action). Button
  labels say what they do ("Load data", "Copy embed code"), never "Submit".
  Be upfront about constraints ("Whole chart baked into the URL. Works
  anywhere, no account needed." is the house style). No em dashes, no
  repeated sentence openers in UI copy.
- Cards earn their existence: a card is an interaction target (sample picker,
  gallery item) or a framed artifact (the chart), never decoration.

## Review checklist for UI changes

1. Values come from tokens, not literals.
2. One h1, no skipped heading levels, body text 16px or larger.
3. `.bc-display` elements are weight 400.
4. Hover-revealed UI also opens on click/Enter.
5. New flex-row controls survive 375px without wrapping or crushing.
6. Both themes checked; no per-component theme branches where a token works.
7. Animations use motion tokens and stick to transform/opacity.
8. Attribute values that can carry user data or composite keys are
   XML-safe.
