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
chart donut {
  title = "The richest 1% own more wealth than the entire bottom 90% combined"
  description = "Share of global wealth by group, 2021"
  source = "World Inequality Report 2022"
  sourceUrl = "https://wir2022.wid.world"
  colorPalette = "Imperator"
  legendPosition = "right"
  displayAsPercentage = true
  tooltips = true

  data {
    "Top 1%" = 38
    "Next 9%" = 38
    "Middle 40%" = 22
    "Bottom 50%" = 2
  }
}
```

::: tip From the sample library
Excerpted from `packages/lib/src/samples/browser-market.bpc` — a donut chart driven entirely by the named `Imperator` palette. Each slice picks up the next colour from the resolved palette array.
:::

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

### Use a hand-picked colour

The `colorPalette` property accepts any registered palette `name`. For a one-off brand-coloured chart, drop `colors = "<hex>"` (single value) and skip the palette entirely:

```bpc
chart line {
  title = "Bitcoin surged past $90,000 in 2024"
  description = "USD, year-end closing price"
  source = "CoinGecko"
  colors = "#f7931a"
  lineSymbols = true
  lineSymbolShowOn = "all"
  lineSymbolShape = "diamond"

  data {
    "2016" = 963
    "2020" = 28949
    "2022" = 16547
    "2024" = 93429
  }
}
```

::: tip From the sample library
This is `packages/lib/src/samples/bitcoin-price.bpc` — Bitcoin orange (`#f7931a`) hard-coded as the single series colour, so the chart matches the brand regardless of the active palette.
:::

For multi-series charts, pass a comma-separated list (`colors = "#a","#b","#c"`) — `medal-count.bpc` does exactly this with gold, silver, and bronze for the Olympic ranking.

### Override a single category

`colorize "<name>"` re-paints one entry without disturbing the rest of the palette. `letter-frequency.bpc` uses it to make the winning entry pop in red against the named `London` palette:

```bpc
chart bar-vertical {
  title = "E is the most frequent letter in English"
  description = "How often each letter appears in typical English text"
  colorPalette = "London"
  sort = descending
  valueLabels = true

  colorize "E" {
    color = "#e15759"
  }

  data {
    "E" = 12.70
    "T" = 9.06
    "A" = 8.17
    "O" = 7.51
    "I" = 6.97
    "N" = 6.75
  }
}
```

::: tip From the sample library
This is `packages/lib/src/samples/letter-frequency.bpc` — every other bar takes its colour from `London`; only `E` is overridden, drawing the eye to the headline finding.
:::

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
- [BPC DSL — Color directives](/reference/dsl/annotations#color-directives) for `colorize`, `highlight`, `area-fill`.
- [API reference](/reference/api/#palettes) for the full export list.
