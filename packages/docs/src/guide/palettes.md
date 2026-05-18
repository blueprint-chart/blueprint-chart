---
title: Palettes
---

# Palettes

> 50+ curated categorical palettes, plus the helpers to resolve, audit, and adjust them for the background you render against.

## Why this matters

Color is the second most powerful encoding after position — and the easiest to misuse. Blueprint Chart ships a curated catalogue of palettes (sourced from [pypalettes](https://github.com/y-sunflower/pypalettes), MIT) so chart authors can pick a tested set instead of hand-rolling one. Each palette is perceptually balanced enough to read at small sizes; the accompanying helpers let you contrast-check and CVD-check before publishing.

## Quickstart

Pick a palette by name in a `.bpc` document:

```bpc
chart bar-multi {
  title = "Software overtakes hardware as the top revenue driver"
  description = "USD billions"
  colorPalette = "Egypt"
  legendPosition = "top"

  data {
    _series = "Hardware","Software","Services"
    "Q1 2024" = 14.2,9.8,7.4
    "Q2 2024" = 13.8,11.0,8.1
    "Q3 2024" = 15.5,12.1,8.9
    "Q4 2024" = 18.9,13.4,10.2
  }
}
```

Or pull the colours into TypeScript:

```ts
import { resolvePalette, listPalettes } from '@blueprint-chart/lib'

resolvePalette('Egypt')
// → ['#dd5129', '#0f7ba2', '#43b284', '#fab255']

listPalettes()
// → PaletteEntry[] with every palette currently registered
```

`resolvePalette()` returns a mutable copy of the underlying readonly array, so you can safely shuffle, slice, or reorder.

## How it works

Palettes are pure data — `packages/lib/src/charts/palettes.ts` declares a `PALETTES` array of `{ name, label, colors }` entries, indexed into a `PALETTE_MAP` for O(1) lookup. At render time:

1. The chart's `colorPalette` property (a palette `name`) is resolved by `resolvePalette()` into an array of hex strings.
2. Each series is mapped to a palette entry by `resolveSeriesColor`. Per-series overrides — `colors`, `series { color = … }`, `colorize "<name>"` — take precedence.
3. When `autoContrast = true`, `adjustColorsForBackground(colors, bg)` nudges the lightness of each colour until every series clears WCAG AA against the frame background **and** every adjacent pair has at least CIE2000 ΔE ≥ 12. Hue and saturation are preserved.

The library uses [chroma-js](https://gka.github.io/chroma.js/) under the hood for parsing, deltaE, and perceptual interpolation. See the [color handbook](/handbook/color) for the underlying theory (sequential vs. diverging vs. categorical, the perceptual-uniformity trap, ten ways to use less colour).

## Recipes

### Use a palette in a chart

The `colorPalette` property accepts any registered palette `name`. For a one-off override on a single series, drop `colors = "<hex>"` (single value) or `colors = "#a","#b","#c"` (per-series list):

```bpc
chart line {
  title = "2024 was the hottest year on record"
  description = "Deviation from the 1951–1980 average, in °C"
  colors = "#e15759"

  data {
    "1980" = 0.26
    "2000" = 0.42
    "2024" = 1.29
  }
}
```

### Override a single category

`colorize "<name>"` re-paints one entry without disturbing the rest of the palette:

```bpc
chart bar-vertical {
  title = "China emits more CO₂ than the US and India combined"

  data {
    "China" = 11.9
    "United States" = 4.78
    "India" = 2.88
  }

  colorize "China" {
    color = "#e15759"
  }
}
```

### Auto-tune the palette to the frame background

Opt a chart into automatic contrast adjustment by setting `autoContrast = true`. The renderer reads the effective background colour through `resolveBackgroundColor(container)` and nudges each palette entry until WCAG AA and a minimum perceptual distance are both satisfied — useful when the same chart ships in both light and dark themes.

### Audit a palette before shipping

The contrast and CVD helpers run outside any chart instance, which makes them handy for build-time linting:

```ts
import {
  resolvePalette,
  wcagContrastRatio,
  wcagLevel,
  checkCvdColors,
} from '@blueprint-chart/lib'

const palette = resolvePalette('Egypt')!
const bg = '#ffffff'

for (const color of palette) {
  const ratio = wcagContrastRatio(color, bg)
  console.log(color, ratio.toFixed(2), wcagLevel(ratio))
}

const issues = checkCvdColors(palette)
// issues[].pairs lists colours that collapse under each dichromacy
```

See [Accessibility](/guide/accessibility) for the full audit workflow.

### Browse the catalogue at runtime

`listPalettes()` returns every entry currently registered, including its human-readable `label`. Drop it into a picker, a Histoire story, or a unit test:

```ts
import { listPalettes } from '@blueprint-chart/lib'

const options = listPalettes().map((p) => ({
  value: p.name,
  label: p.label,
  swatch: p.colors,
}))
```

A small sampling of the catalogue (run `listPalettes()` for the current full list):

| name | label | colours |
| --- | --- | --- |
| `Blueprint` | Blueprint | 6 |
| `JosefAlbers` | Albers | 5 |
| `Egypt` | Egypt | 4 |
| `Klimt` | Klimt | 6 |
| `Maya` | Maya | 5 |
| `Sunset` | Sunset | 7 |
| `TheovanDoesburg` | Van Doesburg | 5 |

## API surface

Exported from `@blueprint-chart/lib`:

| Symbol | One-liner |
| --- | --- |
| `resolvePalette(name)` | Returns a mutable `string[]` of hex colours for a palette name, or `undefined`. |
| `listPalettes()` | Returns every `PaletteEntry` currently registered. |
| `PaletteEntry` (type) | `{ name: string, label: string, colors: readonly string[] }`. |
| `resolveSeriesColor(...)` | Resolves a series to its final colour, respecting overrides. |
| `resolveSeriesInterpolation(...)` | Resolves the interpolation function for a series (line / area charts). |
| `isSeriesHidden(...)` | Whether a series is hidden by a scene or override. |
| `resolveBackgroundColor(el)` | Walks ancestors until it finds a non-transparent background. |
| `adjustColorsForBackground(colors, bg)` | Returns a legibility-tuned copy of the palette for the given background. |

For the accessibility helpers (`wcagContrastRatio`, `wcagLevel`, `checkCvdColors`, …) see the [Accessibility guide](/guide/accessibility).

## See also

- [Accessibility](/guide/accessibility) — WCAG and CVD utilities.
- [Colour handbook](/handbook/color) — palette theory and reduction techniques.
- [BPC DSL — Color directives](/spec/dsl#color-directives) for `colorize`, `highlight`, `areafill`.
- [API reference](/api/#palettes) for the full export list.
