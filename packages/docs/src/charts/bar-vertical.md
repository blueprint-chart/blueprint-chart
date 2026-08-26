---
title: Vertical bar chart
---

# Vertical bar chart

> Single-series vertical bar chart for ranked categorical comparison, small N.

`bar-vertical` compares discrete categories using the height of rectangular bars. It honours `sort`, `sortMode`, `valueLabels`, and `valueLabelPosition`. The alias `vertical-bar` is registered against the same renderer so `.bpc` documents can read either way.

## When to use

- Comparing quantities across a small number of categories (< 12)
- Ranking items when the category labels are short enough to fit horizontally
- A few data points over time (e.g. annual totals for 5 years)

## When NOT to use

- Continuous data distributions (no built-in histogram type)
- Many time periods — use [`line`](./line) for trends
- Long category labels that would need rotation — use [`bar-horizontal`](./bar-horizontal)

## Example

```bpc
chart bar-vertical {
  title = "Brazil produces more coffee than the next three countries combined"
  description = "Million 60-kg bags, 2023/24 crop year"
  source = "USDA Foreign Agricultural Service"
  sourceUrl = "https://www.fas.usda.gov/data/coffee-world-markets-and-trade"
  colorPalette = "Harvey"
  valueLabels = true
  valueLabelPosition = "auto"

  data {
    "Brazil" = 66.4
    "Vietnam" = 27.5
    "Colombia" = 12.76
    "Ethiopia" = 9.13
    "Indonesia" = 7.65
    "Honduras" = 5.5
  }

  colorize "Brazil" {
    color = "#a4432d"
  }

  transform sort {
    column = "value"
    direction = descending
  }
}
```


<!-- options:start -->

## Properties

Every property `bar-vertical` accepts, beside the [frame and layout keys](/reference/dsl/properties) every chart shares. Anything absent from this table is rejected by `validateChart` and ignored by the renderer.

| Property | Type | Default |
| --- | --- | --- |
| `colors` | colors | (unset) |
| `colorPalette` | select, see [Palettes](/guide/palettes) | `Blueprint` |
| `autoContrast` | boolean | `false` |
| `allowDarkMode` | boolean | `true` |
| `swapLabelValue` | boolean | `false` |
| `barBackground` | boolean | `false` |
| `barSeparators` | boolean | `false` |
| `barGap` | text | `60` |
| `connectedColumns` | boolean | `false` |
| `connectionsOpacity` | text | `0.15` |
| `waterfall` | boolean | `false` |
| `waterfallTotal` | boolean | `false` |
| `categoryLabelLine` | boolean | `false` |
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

- Truncating the y-axis exaggerates differences and misleads readers — always start at zero
- Too many categories create visual clutter; group small ones into "Other"
- 3D effects distort the encoding — Blueprint Chart doesn't offer them, and you shouldn't fake them

## Related types

- [`bar-horizontal`](./bar-horizontal) — when labels are long or you want a ranked list
- [`bar-multi`](./bar-multi) — when you need to compare two or more series side by side
- [`bar-stacked`](./bar-stacked) — when the parts of each bar sum to a meaningful total

## See also

- [Choosing the right chart](/handbook/choosing)
- [Design principles](/handbook/design-principles)
