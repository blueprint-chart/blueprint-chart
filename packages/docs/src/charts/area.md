---
title: Area chart
---

# Area chart

> Single-series area chart for magnitude over time; pairs with `areaFill`.

`area` is a line chart with the region below the line filled in, emphasising the magnitude of a single series rather than just its direction. See [Properties](#properties) for every key it accepts. The `area-fill` block that shades a band between two series is rendered by [`line-multi`](./line-multi), not here.

## When to use

- When the cumulative total or visual volume matters, not just the trend
- A single series where the filled region adds emotional weight to the story
- Editorial contexts where the chart needs to read at a glance

## When NOT to use

- Overlapping multiple un-stacked series — filled regions obscure each other
- When readers need precise value reading (the fill blurs the line)
- When you have multiple series — use [`area-stacked`](./area-stacked) instead

## Example

```bpc
chart area {
  title = "Apple stock climbed 36 % through 2024"
  description = "Monthly closing price in USD"
  source = "Yahoo Finance"
  sourceUrl = "https://finance.yahoo.com"

  data {
    "Jan" = 183
    "Feb" = 182
    "Mar" = 171
    "Apr" = 170
    "May" = 192
    "Jun" = 210
    "Jul" = 222
    "Aug" = 229
    "Sep" = 233
    "Oct" = 225
    "Nov" = 237
    "Dec" = 249
  }
}
```


<!-- options:start -->

## Properties

Every property `area` accepts, beside the [frame and layout keys](/reference/dsl/properties) every chart shares. Anything absent from this table is rejected by `validateChart` and ignored by the renderer.

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
| `verticalRangeMin` | text | `0` |
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

- The y-axis must start at zero — the filled area encodes magnitude
- The fill sits at 0.25 opacity so the line stays readable, and `area` exposes no key to change it; [`area-stacked`](./area-stacked) does, via `areaFillOpacity`
- Don't stack two area charts by overlapping them; reach for [`area-stacked`](./area-stacked)

## Related types

- [`line`](./line) — when the trend matters and the magnitude doesn't
- [`area-stacked`](./area-stacked) — when you have multiple series to compose
- [`bar-vertical`](./bar-vertical) — when the x-axis is categorical

## See also

- [Choosing the right chart](/handbook/choosing)
- [Design principles](/handbook/design-principles)
