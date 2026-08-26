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
| `sortMode` | select: `none`, `total`, `within-groups` | `total` |
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
| `verticalRangeMin` | text | `0` |
| `verticalRangeMax` | text | (unset) |
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
