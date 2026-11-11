---
title: Horizontal bar chart
---

# Horizontal bar chart

> Single-series horizontal bar chart for long category labels and ranked bars.

`bar-horizontal` is the same encoding as a vertical bar chart turned on its side — categories run down the left, bars extend to the right. It honours `sort`, `sortMode`, `valueLabels`, and `valueLabelPosition`. The alias `horizontal-bar` is registered against the same renderer.

## When to use

- Category labels are long (country names, survey responses, product names)
- Ranking displays — high-to-low from top to bottom reads intuitively
- Mobile-friendly layouts — horizontal bars grow vertically, adapting to narrow screens

## When NOT to use

- Time-based data (the horizontal axis conventionally represents time — use [`line`](./line))
- A handful of categories with short labels — [`bar-vertical`](./bar-vertical) is more compact

## Example

```bpc
chart bar-horizontal {
  title = "Japan leads in life expectancy while the US lags behind"
  description = "Selected countries, years (2023)"
  source = "World Bank"
  sourceUrl = "https://data.worldbank.org"
  note = "Figures are estimates and may differ from national statistics"
  sort = descending
  colors = "#59a14f"
  horizontalLabelPosition = off
  horizontalGridStyle = none

  colorize "United States" {
    color = "#e15759"
  }

  data {
    "Japan" = 84.8
    "Switzerland" = 83.8
    "Australia" = 83.5
    "Sweden" = 83.1
    "Canada" = 82.7
    "France" = 82.5
    "Germany" = 81.4
    "United Kingdom" = 81.2
    "United States" = 78.5
    "China" = 78.2
  }
}
```


<!-- options:start -->

## Properties

Every property `bar-horizontal` accepts, beside the [frame and layout keys](/reference/dsl/properties) every chart shares. Anything absent from this table is rejected by `validateChart` and ignored by the renderer.

| Property | Type | Default |
| --- | --- | --- |
| `colors` | colors | (unset) |
| `colorPalette` | select, see [Palettes](/guide/palettes) | `Blueprint` |
| `autoContrast` | boolean | `false` |
| `allowDarkMode` | boolean | `true` |
| `legend` | boolean | `true` |
| `legendPosition` | select: `top`, `bottom`, `left`, `right` | `top` |
| `directLabelling` | select: `""`, `auto`, `outside`, `inside` | `auto` |
| `swapLabelValue` | boolean | `false` |
| `barBackground` | boolean | `false` |
| `barSeparators` | boolean | `false` |
| `barGap` | text | `60` |
| `connectedColumns` | boolean | `false` |
| `connectionsOpacity` | text | `0.15` |
| `waterfall` | boolean | `false` |
| `waterfallTotal` | boolean | `false` |
| `categoryLabelLine` | boolean | `false` |
| `showVerticalAxis` | boolean | `true` |
| `verticalAxisDirection` | select: `left`, `right` | `left` |
| `showVerticalTicks` | boolean | `false` |
| `verticalLabelPosition` | select: `auto`, `inside`, `outside`, `off` | `auto` |
| `verticalGridStyle` | select: `solid`, `dashed`, `dotted`, `none` | `none` |
| `verticalNumberFormat` | numberFormat | (unset) |
| `showHorizontalAxis` | boolean | `false` |
| `showHorizontalTicks` | boolean | `false` |
| `horizontalLabelPosition` | select: `auto`, `inside`, `outside`, `off` | `off` |
| `horizontalLabelRotation` | select: `auto`, `horizontal`, `vertical` | `horizontal` |
| `horizontalGridStyle` | select: `solid`, `dashed`, `dotted`, `none` | `none` |
| `horizontalNumberFormat` | numberFormat | (unset) |
| `horizontalScaleType` | select: `linear`, `log` | `linear` |
| `horizontalRangeMin` | text | (unset) |
| `horizontalRangeMax` | text | (unset) |
| `horizontalTickValues` | text | (unset) |
| `valueLabels` | boolean | `true` |
| `valueLabelPosition` | select: `auto`, `outside`, `inside` | `auto` |
| `tooltips` | boolean | `false` |
| `crosshair` | boolean | `false` |
| `crosshairDirection` | select: `both`, `vertical`, `horizontal` | `both` |
| `crosshairStyle` | select: `solid`, `dashed`, `dotted` | `dashed` |
| `crosshairColor` | text | `#999` |

<!-- options:end -->

## Overlays

Overlays add reference marks on each bar: a value mark (one extra column) or a range band (two extra columns), such as a confidence interval or last year's value. Overlay columns are not bars, so they never add bars or change the category count. With `waterfall`, each overlay is drawn relative to the running total at the start of its step, so the marks follow the floating bars. By default (`directLabelling = auto`) overlays are labelled directly on the first bar; set `directLabelling = ""` to show a key instead.

Cues change the bars themselves. On a range overlay, `muteIfCrosses = 0` fades every bar whose range includes zero. On a value overlay, `aboveColor` and `belowColor` color each bar by whether it reaches its mark, and add matching entries to the key. The cue entries go in the key even when overlay titles are labelled directly.

See [`overlay`](/reference/dsl/annotations#overlay) for the keys and an example.

From `packages/lib/src/samples/nato-defence-spending.bpc`. A value overlay marks the 2% guideline and colors each ally by whether it reaches it.

```bpc
chart bar-horizontal {
  title = "Every NATO ally but Slovenia expects to spend at least 2% of GDP on core defence in 2026"
  description = "Core defence expenditure as a share of real GDP, 2026 estimates, percent"
  source = "NATO, Defence Investment of NATO Countries (2014-2026), Table 3"
  sourceUrl = "https://www.nato.int/content/dam/nato/webready/documents/finance/def-exp-2026-en.pdf"
  note = "Figures are NATO estimates. Iceland has no armed forces and is not in NATO's tables. Slovenia's figure dates from before its new government's review of defence spending."
  sort = descending

  overlay "Target" {
    title = "2% guideline"
    aboveColor = "#2a9d8f"
    belowColor = "#e15759"
  }

  data {
    series = "Share of GDP","Target"
    "Lithuania" = 5.33,2
    "Estonia" = 5.10,2
    "Latvia" = 4.92,2
    "Poland" = 4.68,2
    "Greece" = 3.65,2
    "Denmark" = 3.49,2
    "Sweden" = 3.22,2
    "Norway" = 3.17,2
    "United States" = 3.17,2
    "Türkiye" = 2.85,2
    "Germany" = 2.69,2
    "Finland" = 2.65,2
    "Netherlands" = 2.58,2
    "United Kingdom" = 2.56,2
    "Romania" = 2.43,2
    "Bulgaria" = 2.22,2
    "France" = 2.22,2
    "Montenegro" = 2.17,2
    "Albania" = 2.15,2
    "Canada" = 2.13,2
    "Italy" = 2.10,2
    "Portugal" = 2.10,2
    "Hungary" = 2.09,2
    "North Macedonia" = 2.09,2
    "Croatia" = 2.03,2
    "Luxembourg" = 2.03,2
    "Slovak Republic" = 2.02,2
    "Czechia" = 2.01,2
    "Belgium" = 2.00,2
    "Spain" = 2.00,2
    "Slovenia" = 1.61,2
  }
}
```

## Common pitfalls

- Forgetting to sort — an unranked horizontal bar chart loses most of its power
- Mixing the horizontal axis with time, which reads as a flipped line chart
- Long labels still cause issues at very narrow widths; truncate or shorten before publishing

## Related types

- [`bar-vertical`](./bar-vertical) — when labels are short and you have room horizontally
- [`bar-stacked`](./bar-stacked) — when each bar should break down into segments
- [`bar-split`](./bar-split) — when values can be positive or negative

## See also

- [Choosing the right chart](/handbook/choosing)
- [Design principles](/handbook/design-principles)
