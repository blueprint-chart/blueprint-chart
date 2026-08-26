---
title: Line chart
---

# Line chart

> Single-series line chart for continuous trend over an ordered domain.

`line` connects data points to show how a single measure changes across an ordered axis — typically time. See [Properties](#properties) for every key it accepts.

## When to use

- Showing trends, patterns, or changes over time
- Continuous data where the order matters
- Revealing rate of change — the slope communicates speed
- A single series; readers focus on direction rather than precise totals

## When NOT to use

- Categorical data with no inherent order — lines imply sequence
- When the cumulative magnitude matters more than the trend (use [`area`](./area))
- When you want to compare two or more series (use [`line-multi`](./line-multi))

## Example

```bpc
chart line {
  title = "2024 was the hottest year on record"
  description = "Deviation from the 1951–1980 average, in °C"
  source = "NASA GISS"
  sourceUrl = "https://data.giss.nasa.gov/gistemp/"
  colors = "#e15759"
  interpolation = "monotoneX"
  lineSymbols = true
  lineSymbolShowOn = "firstLast"
  tooltips = true

  data {
    "1980" = 0.26
    "1990" = 0.45
    "2000" = 0.42
    "2010" = 0.72
    "2020" = 1.02
    "2024" = 1.29
  }
}
```


<!-- options:start -->

## Properties

Every property `line` accepts, beside the [frame and layout keys](/reference/dsl/properties) every chart shares. Anything absent from this table is rejected by `validateChart` and ignored by the renderer.

| Property | Type | Default |
| --- | --- | --- |
| `colors` | colors | (unset) |
| `colorPalette` | select, see [Palettes](/guide/palettes) | `Blueprint` |
| `autoContrast` | boolean | `false` |
| `allowDarkMode` | boolean | `true` |
| `interpolation` | select: `linear`, `monotoneX`, `step`, `stepBefore`, `stepAfter`, `basis`, `cardinal`, `catmullRom` | `monotoneX` |
| `edgePadding` | boolean | `false` |
| `showVerticalAxis` | boolean | `false` |
| `verticalAxisDirection` | select: `left`, `right` | `left` |
| `showVerticalTicks` | boolean | `false` |
| `verticalLabelPosition` | select: `auto`, `inside`, `outside`, `off` | `auto` |
| `verticalGridStyle` | select: `solid`, `dashed`, `dotted`, `none` | `dashed` |
| `verticalNumberFormat` | numberFormat | (unset) |
| `verticalScaleType` | select: `linear`, `log` | `linear` |
| `verticalRangeMin` | text | `auto` |
| `verticalRangeMax` | text | `auto` |
| `showHorizontalAxis` | boolean | `true` |
| `showHorizontalTicks` | boolean | `false` |
| `horizontalLabelPosition` | select: `auto`, `inside`, `outside`, `off` | `auto` |
| `horizontalLabelRotation` | select: `auto`, `horizontal`, `vertical` | `horizontal` |
| `horizontalGridStyle` | select: `solid`, `dashed`, `dotted`, `none` | `none` |
| `horizontalNumberFormat` | numberFormat | (unset) |
| `horizontalRangeMin` | text | `auto` |
| `horizontalRangeMax` | text | `auto` |
| `valueLabels` | boolean | `false` |
| `tooltips` | boolean | `false` |
| `crosshair` | boolean | `true` |
| `crosshairDirection` | select: `both`, `vertical`, `horizontal` | `vertical` |
| `crosshairStyle` | select: `solid`, `dashed`, `dotted` | `dashed` |
| `crosshairColor` | text | `#999` |
| `lineSymbols` | boolean | `false` |
| `lineSymbolShape` | select: `circle`, `square`, `diamond`, `triangle`, `triangleDown`, `cross`, `star` | `circle` |
| `lineSymbolShowOn` | select: `firstLast`, `first`, `last`, `all` | `firstLast` |
| `lineSymbolStyle` | select: `filled`, `hollow` | `filled` |
| `lineSymbolSize` | text | `3.5` |
| `lineSymbolOpacity` | text | `1` |

<!-- options:end -->

## Common pitfalls

- Aggressively truncating the y-axis exaggerates small movements
- Forcing the y-axis to start at zero when the data sits in a narrow band flattens the trend — unlike bars, line charts don't require a zero baseline
- Smoothing with `basis` interpolation can overshoot the data; prefer `monotoneX` when fidelity matters

## Related types

- [`line-multi`](./line-multi) — when you need to compare two or more series on the same axes
- [`area`](./area) — when the magnitude of the value matters as much as the trend
- [`bar-vertical`](./bar-vertical) — when the x-axis is categorical, not continuous

## See also

- [Choosing the right chart](/handbook/choosing)
- [Design principles](/handbook/design-principles)
