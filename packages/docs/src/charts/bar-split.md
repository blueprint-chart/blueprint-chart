---
title: Split bar chart
---

# Split bar chart

> Diverging vertical bar chart for values around a shared baseline (positive/negative).

`bar-split` plots values that radiate out from a shared baseline — positive and negative, gain and loss, opinion for and against. It uses signed values directly; no explicit "diverging" toggle is required.

## When to use

- Net change scenarios where some values are positive and some are negative (sentiment, election swing, year-on-year deltas)
- Polling spreads and ranges around a central estimate
- Comparing a small group of categories where direction is part of the story

## When NOT to use

- All-positive datasets — a regular [`bar-vertical`](./bar-vertical) reads more cleanly
- When the absolute total is what matters, not the spread
- Many categories with subtle differences — the diverging baseline amplifies noise

## Example

```bpc
chart bar-split {
  title = "Phoenix summers hit 37 °C while Chicago winters drop below zero"
  description = "Mean monthly temperature (°C), NOAA 30-year climate normals 1991–2020"
  source = "NOAA"
  sourceUrl = "https://www.ncei.noaa.gov/products/land-based-station/us-climate-normals"
  valueLabels = true

  data {
    series = "Winter (Jan)","Spring (Apr)","Summer (Jul)"
    "Miami"       = 20,26,29
    "Los Angeles" = 14,17,23
    "Phoenix"     = 13,24,37
    "Seattle"     = 5,10,19
    "New York"    = 1,12,25
    "Chicago"     = -4,10,24
  }
}
```


<!-- options:start -->

## Properties

Every property `bar-split` accepts, beside the [frame and layout keys](/reference/dsl/properties) every chart shares. Anything absent from this table is rejected by `validateChart` and ignored by the renderer.

| Property | Type | Default |
| --- | --- | --- |
| `colors` | colors | (unset) |
| `colorPalette` | select, see [Palettes](/guide/palettes) | `Blueprint` |
| `autoContrast` | boolean | `false` |
| `allowDarkMode` | boolean | `true` |
| `sharedScale` | boolean | `false` |
| `sortMode` | select: `none`, `total`, `within-groups` | `none` |
| `legend` | boolean | `true` |
| `legendAnchor` | select: `start`, `middle`, `end` | `start` |
| `legendPosition` | select: `top`, `bottom`, `left`, `right` | `top` |
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
| `horizontalRangeMin` | text | `0` |
| `horizontalRangeMax` | text | (unset) |
| `valueLabels` | boolean | `true` |
| `valueLabelPosition` | select: `auto`, `outside`, `inside` | `auto` |
| `tooltips` | boolean | `false` |
| `crosshair` | boolean | `false` |
| `crosshairDirection` | select: `both`, `vertical`, `horizontal` | `both` |
| `crosshairStyle` | select: `solid`, `dashed`, `dotted` | `dashed` |
| `crosshairColor` | text | `#999` |

<!-- options:end -->

## Common pitfalls

- Forgetting that the chart is encoding sign; readers should be able to tell what zero means without reading the axis label
- Mixing categories that don't share the same scale or meaning around the baseline
- Sorting that hides the diverging pattern — sort by net change, not by absolute value

## Related types

- [`bar-vertical`](./bar-vertical) — when all values share the same sign
- [`bar-multi`](./bar-multi) — when you need side-by-side comparison rather than divergence
- [`bar-stacked`](./bar-stacked) — when the parts of each bar sum to a meaningful total

## See also

- [Choosing the right chart](/handbook/choosing)
- [Design principles](/handbook/design-principles)
