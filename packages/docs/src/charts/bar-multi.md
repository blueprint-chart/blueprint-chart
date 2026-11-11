---
title: Multi-series bar chart
---

# Multi-series bar chart

> Multi-series vertical bar chart for side-by-side comparison of a small group of series.

`bar-multi` places several series next to each other within each category, so readers can compare them at a glance. Reorder categories with `sortMode`; the top-level `sort` property is read only by `bar-vertical`, `bar-horizontal`, and `donut`. See [Properties](#properties) for every key it accepts.

## When to use

- Comparing 2–3 series across the same categories (e.g. medals by colour, revenue by product line)
- When individual series values matter more than their totals
- A small, fixed set of categories where the comparison is the story

## When NOT to use

- More than 3–4 series per group — the clusters become unreadable
- When the total across series is the headline number — use [`bar-stacked`](./bar-stacked) or [`column-stacked`](./column-stacked)
- When the second dimension is itself a grouping (use [`bar-grouped`](./bar-grouped))

## Example

```bpc
chart bar-multi {
  title = "USA tops Paris 2024 with 126 medals across all categories"
  description = "2024 Paris Summer Games — top six nations"
  source = "Olympics.com"
  sourceUrl = "https://olympics.com"
  colors = "#eeca3b, #c0c0c0, #cd7f32"
  legendPosition = "top"
  valueLabels = true
  sort = descending

  data {
    series = "Gold","Silver","Bronze"
    "USA" = 40,44,42
    "China" = 38,32,18
    "Japan" = 27,14,17
    "Great Britain" = 22,21,22
    "Australia" = 17,7,22
    "France" = 16,20,23
  }
}
```


<!-- options:start -->

## Properties

Every property `bar-multi` accepts, beside the [frame and layout keys](/reference/dsl/properties) every chart shares. Anything absent from this table is rejected by `validateChart` and ignored by the renderer.

| Property | Type | Default |
| --- | --- | --- |
| `colors` | colors | (unset) |
| `colorPalette` | select, see [Palettes](/guide/palettes) | `Blueprint` |
| `autoContrast` | boolean | `false` |
| `allowDarkMode` | boolean | `true` |
| `barGap` | text | `60` |
| `sortMode` | select: `none`, `total`, `within-groups`, `series` | `total` |
| `sortSeries` | select | `""` |
| `sortReverse` | boolean | `false` |
| `legend` | boolean | `false` |
| `legendAnchor` | select: `start`, `middle`, `end` | `start` |
| `legendPosition` | select: `top`, `bottom`, `left`, `right` | `top` |
| `directLabelling` | select: `""`, `auto`, `outside`, `inside` | `auto` |
| `directLabelAnchor` | select: `start`, `middle`, `end` | `middle` |
| `showVerticalAxis` | boolean | `false` |
| `verticalAxisDirection` | select: `left`, `right` | `left` |
| `showVerticalTicks` | boolean | `false` |
| `verticalLabelPosition` | select: `auto`, `inside`, `outside`, `off` | `off` |
| `verticalGridStyle` | select: `solid`, `dashed`, `dotted`, `none` | `none` |
| `verticalNumberFormat` | numberFormat | (unset) |
| `verticalScaleType` | select: `linear`, `log` | `linear` |
| `verticalRangeMin` | text | (unset) |
| `verticalRangeMax` | text | (unset) |
| `verticalTickValues` | text | (unset) |
| `showHorizontalAxis` | boolean | `true` |
| `showHorizontalTicks` | boolean | `false` |
| `horizontalLabelPosition` | select: `auto`, `inside`, `outside`, `off` | `auto` |
| `horizontalLabelRotation` | select: `auto`, `horizontal`, `vertical` | `horizontal` |
| `horizontalGridStyle` | select: `solid`, `dashed`, `dotted`, `none` | `none` |
| `horizontalNumberFormat` | numberFormat | (unset) |
| `valueLabels` | boolean | `true` |
| `valueLabelPosition` | select: `auto`, `outside`, `inside` | `auto` |
| `tooltips` | boolean | `false` |
| `crosshair` | boolean | `false` |
| `crosshairDirection` | select: `both`, `vertical`, `horizontal` | `both` |
| `crosshairStyle` | select: `solid`, `dashed`, `dotted` | `dashed` |
| `crosshairColor` | text | `#999` |

<!-- options:end -->

## Overlays

Overlays add a value mark (one extra column) or a range band (two extra columns) to the bars of one series, named with `bar`. Overlay columns are not series, so they never add bars. Without `bar`, or with an unknown name, an overlay goes on the first series and validation warns.

Cues apply to that series only. `muteIfCrosses` on a range overlay fades the series' bar in each category whose range includes the number. `aboveColor` and `belowColor` on a value overlay recolor that bar by whether it reaches the mark. A recolored bar loses its series color, but the series keeps its color in the key.

From `packages/lib/src/samples/election-margin.bpc`. Each candidate gets a margin of error band on their own bar.

```bpc
chart bar-multi {
  title = "Harris and Trump were within the margin of error in all seven swing states"
  description = "Final Emerson College Polling surveys of likely voters, October 30 to November 2, 2024, percent"
  source = "Emerson College Polling and The Hill, November 2024 final swing state polls"
  sourceUrl = "https://emersoncollegepolling.com/november-2024-final-swing-state-polls-too-close-to-call-election-for-president/"
  note = "Each band is the poll share plus or minus the state survey's credibility interval, from 3 to 3.4 points."
  colors = "#4e79a7, #e15759"
  legend = true
  directLabelling = ""

  overlay "Harris low" "Harris high" {
    bar = "Harris"
    title = "Harris margin of error"
    color = "#1f3d5c"
  }

  overlay "Trump low" "Trump high" {
    bar = "Trump"
    title = "Trump margin of error"
    color = "#7a1f20"
  }

  data {
    series = "Harris","Trump","Harris low","Harris high","Trump low","Trump high"
    "Arizona" = 48,50,44.8,51.2,46.8,53.2
    "Georgia" = 49,50,45.6,52.4,46.6,53.4
    "Michigan" = 50,48,46.6,53.4,44.6,51.4
    "Nevada" = 48,48,44.7,51.3,44.7,51.3
    "North Carolina" = 48,49,44.7,51.3,45.7,52.3
    "Pennsylvania" = 48,49,45,51,46,52
    "Wisconsin" = 49,49,45.6,52.4,45.6,52.4
  }
}
```

See [`overlay`](/reference/dsl/annotations#overlay) for the keys and an example.

## Common pitfalls

- Too many bars per group overwhelms the reader; cap at 3–4 series
- Inconsistent colour encoding across charts in the same dashboard
- Sorting by the wrong series — make sure the sort matches the comparison you want readers to make

## Related types

- [`bar-grouped`](./bar-grouped) — when the categories themselves cluster into a higher group
- [`bar-stacked`](./bar-stacked) — when the total across series is the headline
- [`column-stacked`](./column-stacked) — composition over a small number of discrete columns

## See also

- [Choosing the right chart](/handbook/choosing)
- [Design principles](/handbook/design-principles)
