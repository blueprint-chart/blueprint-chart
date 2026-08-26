---
title: Stacked bar chart
---

# Stacked bar chart

> Stacked horizontal bar chart for composition within a category, emphasising the total.

`bar-stacked` segments horizontal bars into subcategories, showing both the individual parts and the total. Set `stackMode = "percent"` to flip to a 100 % view for pure composition. See [Properties](#properties) for every key it accepts.

## When to use

- Showing how a total breaks down into parts
- Comparing totals across categories while keeping the composition visible
- 100 % stacked view (`stackMode = "percent"`) when relative proportions matter more than absolute values
- Categories with long labels that suit the horizontal orientation

## When NOT to use

- When comparing individual segments across categories — only the segment on the baseline is easy to read
- When there are many small segments — they become invisible
- When precise segment-to-segment comparison is needed (use [`bar-multi`](./bar-multi) or [`bar-grouped`](./bar-grouped))

## Example

```bpc
chart bar-stacked {
  title = "India's working-age population now surpasses China's"
  description = "Millions of people, 2023"
  source = "UN Population Division"
  sourceUrl = "https://population.un.org"
  horizontalGridStyle = none
  horizontalLabelPosition = off

  data {
    series = "0-14","15-64","65+"
    "China" = 249,987,191
    "India" = 365,948,100
    "USA" = 60,215,58
    "Indonesia" = 66,191,18
    "Brazil" = 42,150,22
  }
}
```


<!-- options:start -->

## Properties

Every property `bar-stacked` accepts, beside the [frame and layout keys](/reference/dsl/properties) every chart shares. Anything absent from this table is rejected by `validateChart` and ignored by the renderer.

| Property | Type | Default |
| --- | --- | --- |
| `colors` | colors | (unset) |
| `colorPalette` | select, see [Palettes](/guide/palettes) | `Blueprint` |
| `autoContrast` | boolean | `false` |
| `allowDarkMode` | boolean | `true` |
| `stackMode` | select: `normal`, `percent` | `normal` |
| `sortMode` | select: `none`, `total`, `within-groups` | `none` |
| `legend` | boolean | `true` |
| `legendAnchor` | select: `start`, `middle`, `end` | `start` |
| `legendPosition` | select: `top`, `bottom`, `left`, `right` | `top` |
| `directLabelling` | select: `""`, `auto`, `outside`, `inside` | `""` |
| `directLabelAnchor` | select: `start`, `middle`, `end` | `middle` |
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
| `valueLabels` | boolean | `true` |
| `valueLabelPosition` | select: `auto`, `outside`, `inside` | `auto` |
| `tooltips` | boolean | `false` |
| `crosshair` | boolean | `false` |
| `crosshairDirection` | select: `both`, `vertical`, `horizontal` | `both` |
| `crosshairStyle` | select: `solid`, `dashed`, `dotted` | `dashed` |
| `crosshairColor` | text | `#999` |

<!-- options:end -->

## Common pitfalls

- Segments not on the baseline are nearly impossible to compare accurately — put the most important segment first
- Too many segments create visual noise without insight — cap at 3–5 and group the rest into "Other"
- Inconsistent segment ordering across bars breaks the visual rhythm

## Related types

- [`column-stacked`](./column-stacked) — vertical equivalent for time-like x-axes
- [`bar-multi`](./bar-multi) — when you'd rather compare series side by side than stack them
- [`bar-horizontal`](./bar-horizontal) — single-series horizontal bars

## See also

- [Choosing the right chart](/handbook/choosing)
- [Design principles](/handbook/design-principles)
