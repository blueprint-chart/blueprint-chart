---
title: Accessibility
---

# Accessibility

> WCAG contrast checks, colour-vision-deficiency simulation, and palette-safety audits — built into the library.

## Why this matters

Around 8% of men and 0.5% of women have some form of colour vision deficiency. Many readers consume charts at thumbnail sizes, in dim rooms, or in dark mode. Blueprint Chart bakes the toolkit for these cases into `@blueprint-chart/lib`: WCAG contrast ratio + grading, automatic palette tuning for the actual background, programmatic CVD simulation, and an SVG filter you can drop on a live chart for instant preview.

## Quickstart

Audit a colour pair, then a whole palette:

```ts
import {
  wcagContrastRatio,
  wcagLevel,
  resolvePalette,
  checkCvdColors,
} from '@blueprint-chart/lib'

const ratio = wcagContrastRatio('#ffffff', '#2563A0')
wcagLevel(ratio) // 'AA' — 4.5 ≤ ratio < 7

const palette = resolvePalette('Egypt')!
const issues = checkCvdColors(palette)
// issues is empty if every pair stays distinguishable under
// protanopia / deuteranopia / tritanopia (ΔE ≥ 10)
```

In the editor, the CVD toggle in the toolbar swaps in an SVG filter so authors can preview their chart through each dichromacy live. No layout shift; the chart stays interactive.

## How it works

Two toolkits ship from `packages/lib/src/charts/`:

- **`contrast.ts`** — WCAG 2.1 contrast ratio (`wcagContrastRatio`) and grading (`wcagLevel` → `'AAA' | 'AA' | 'Fail'`). It also provides `resolveBackgroundColor(el)` which walks up the DOM until it finds a non-transparent background, and `adjustColorsForBackground(colors, bg)` which nudges palette lightness until every entry clears WCAG AA against the background **and** every adjacent pair has a CIE2000 deltaE of at least 12. Hue and saturation are preserved; only lightness moves.

- **`colorblind.ts`** — Three Viénot dichromacy matrices (`protanopia`, `deuteranopia`, `tritanopia`) applied two ways: programmatically by `simulateCvdColor(hex, type)` (linearise sRGB → matrix multiply → companding) and at render time via `createCvdSvgFilter(type)`, which builds an `<feColorMatrix>` filter you apply through CSS `filter: url(#bc-cvd-deuteranopia)`. Both paths share the same matrices, so on-screen preview matches programmatic checks.

`checkCvdColors(palette)` runs `simulateCvdColor` over every pair, for every dichromacy, and reports any pair whose simulated colours collapse below ΔE 10 — the threshold where chart marks start to read as "the same colour".

> [!warning]
> The `CvdType` union covers the three dichromacies only — `'protanopia' | 'deuteranopia' | 'tritanopia'`. The editor's UI toggle includes an "off" state, but the typed surface in `colorblind.ts` has three values.

## Recipes

### Audit a palette before publishing

A common build-time check: pick a palette, validate it against the background you actually ship on, and flag CVD collisions.

```ts
import {
  resolvePalette,
  wcagContrastRatio,
  wcagLevel,
  checkCvdColors,
} from '@blueprint-chart/lib'

const palette = resolvePalette('Blueprint')!
const bg = '#ffffff'

const contrastReport = palette.map((color) => ({
  color,
  ratio: wcagContrastRatio(color, bg),
  level: wcagLevel(wcagContrastRatio(color, bg)),
}))

const cvdIssues = checkCvdColors(palette)
if (cvdIssues.length > 0) {
  for (const issue of cvdIssues) {
    console.warn(issue.label, issue.pairs)
  }
}
```

### Build a CVD-safe palette from scratch

`checkCvdColors` returns the pairs that need attention. The cheapest fix is usually to vary lightness — keep the hues, but pull adjacent entries further apart on the L* axis. `adjustColorsForBackground` does exactly that for the WCAG dimension; you can apply it before running `checkCvdColors` to compress the failure surface:

```ts
import { adjustColorsForBackground, checkCvdColors } from '@blueprint-chart/lib'

const tuned = adjustColorsForBackground(myCandidates, '#0a0a0a')
const remainingIssues = checkCvdColors(tuned)
```

If a pair still collides, replace one entry or pair the encoding with a non-colour affordance (direct label, shape, pattern). The [accessibility handbook](/handbook/accessibility) calls this out as the most important rule: never encode information in a single visual channel.

### Auto-tune chart marks to the actual background

Opt a chart into automatic contrast adjustment by setting `autoContrast = true` in the DSL. At render time the engine calls `resolveBackgroundColor(container)` on the chart's frame and runs `adjustColorsForBackground` over the resolved palette before the chart-type renderer paints marks. Same `.bpc` source works in light and dark themes.

### Preview a chart under CVD in a non-editor consumer

The SVG filter pattern works in any DOM context — drop the filter into your page once, then toggle the `filter` style on the chart container.

```ts
import { createCvdSvgFilter, getCvdFilterId, type CvdType } from '@blueprint-chart/lib'

function installCvdFilter(type: CvdType) {
  const ns = 'http://www.w3.org/2000/svg'
  let host = document.querySelector<SVGSVGElement>('#bc-cvd-host')
  if (!host) {
    host = document.createElementNS(ns, 'svg')
    host.id = 'bc-cvd-host'
    host.style.position = 'absolute'
    host.style.width = '0'
    host.style.height = '0'
    document.body.appendChild(host)
  }
  host.appendChild(createCvdSvgFilter(type))
}

installCvdFilter('deuteranopia')
chartContainer.style.filter = `url(#${getCvdFilterId('deuteranopia')})`
```

### Validate text contrast on titles, axes, and annotations

WCAG AA wants 4.5:1 for body text, 3:1 for large text (18px+ bold or 24px+ regular). `wcagContrastRatio` accepts any chroma-parseable input — hex, named colours, `rgb(…)` — so it pairs well with `getComputedStyle()`:

```ts
import { wcagContrastRatio, wcagLevel } from '@blueprint-chart/lib'

function checkLabel(labelEl: HTMLElement) {
  const style = getComputedStyle(labelEl)
  const ratio = wcagContrastRatio(style.color, style.backgroundColor || '#ffffff')
  return { ratio, level: wcagLevel(ratio) }
}
```

## API surface

Exported from `@blueprint-chart/lib`:

| Symbol | One-liner |
| --- | --- |
| `wcagContrastRatio(fg, bg)` | WCAG 2.1 relative-luminance ratio between two colours (1–21). |
| `wcagLevel(ratio)` | Maps a ratio to `'AAA' \| 'AA' \| 'Fail'`. |
| `resolveBackgroundColor(el)` | Walks ancestors until it finds a non-transparent background; falls back to `#fff`. |
| `adjustColorsForBackground(colors, bg)` | Returns a copy of `colors` tuned for WCAG ≥ 4.5 and adjacent ΔE ≥ 12 against `bg`. |
| `simulateCvdColor(hex, type)` | Returns the perceived hex under a given dichromacy. |
| `createCvdSvgFilter(type)` | Builds an `<feColorMatrix>` filter element, applied via CSS `filter: url(#…)`. |
| `getCvdFilterId(type)` | Deterministic filter id, e.g. `'bc-cvd-deuteranopia'`. |
| `checkCvdColors(colors)` | Returns `CvdIssue[]` for every dichromacy where any pair collapses (ΔE < 10). |
| `CvdType` (type) | `'protanopia' \| 'deuteranopia' \| 'tritanopia'`. |
| `CvdIssue` (type) | `{ type, label, pairs: { a, b, deltaE }[] }`. |

See [the API reference](/api/#color-and-accessibility) for the full export list.

## See also

- [Accessibility handbook](/handbook/accessibility) — CVD, contrast, alt text, keyboard, multi-channel encoding.
- [Palettes guide](/guide/palettes) — picking and overriding palettes.
- [Colour handbook](/handbook/color) — the lightness-variance and blue-orange rules.
- [BPC DSL — Properties](/spec/dsl#properties) for `autoContrast`.
