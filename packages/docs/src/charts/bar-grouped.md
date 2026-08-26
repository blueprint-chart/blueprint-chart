---
title: Grouped bar chart
---

# Grouped bar chart

> Multi-series grouped vertical bar chart for grouped categorical comparison across a second dimension.

`bar-grouped` clusters bars from several series under each category, exposing a second dimension of comparison. Reorder categories with `sortMode`; the top-level `sort` property is read only by `bar-vertical`, `bar-horizontal`, and `donut`. See [Properties](#properties) for every key it accepts.

## When to use

- Comparing 2–3 series across categories where the second dimension matters (revenue by product by quarter, capacity by source by region)
- When individual series values matter more than their sum
- A small, fixed list of groups — the structure stays legible

## When NOT to use

- More than 3–4 series per group — the clusters become unreadable
- When the cumulative total per group is the story (use [`bar-stacked`](./bar-stacked))
- When series share the same units and you want a direct comparison without a grouping dimension (use [`bar-multi`](./bar-multi))

## Example

```bpc
chart bar-grouped {
  title = "Asia Pacific holds more renewable capacity than all other regions combined"
  description = "Installed capacity in gigawatts (GW)"
  source = "IRENA"
  sourceUrl = "https://www.irena.org"
  valueLabels = true

  data {
    series = "Solar","Wind","Hydro"
    "Asia Pacific"  = 680,540,840
    "Europe"        = 250,300,200
    "North America" = 200,180,190
    "Latin America" = 30,50,200
    "Africa"        = 15,10,40
  }
}
```


<!-- options:start -->

## Properties

Every property `bar-grouped` accepts, beside the [frame and layout keys](/reference/dsl/properties) every chart shares. Anything absent from this table is rejected by `validateChart` and ignored by the renderer.

| Property | Type | Default |
| --- | --- | --- |
| `colors` | colors | (unset) |
| `colorPalette` | select, see [Palettes](/guide/palettes) | `Blueprint` |
| `autoContrast` | boolean | `false` |
| `allowDarkMode` | boolean | `true` |
| `sortMode` | select: `none`, `total`, `within-groups` | `total` |
| `legend` | boolean | `true` |
| `legendAnchor` | select: `start`, `middle`, `end` | `start` |
| `legendPosition` | select: `top`, `bottom`, `left`, `right` | `top` |
| `barBackground` | boolean | `false` |
| `barSeparators` | boolean | `false` |
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

- Too many bars per group overwhelms the reader — keep series to three or fewer
- Inconsistent colour encoding across groups or across charts in a dashboard
- Sorting by the wrong dimension when both groups and series carry meaning

## Related types

- [`bar-multi`](./bar-multi) — side-by-side series without a grouping dimension
- [`bar-stacked`](./bar-stacked) — when the total per group matters
- [`column-stacked`](./column-stacked) — vertical composition over discrete columns

## See also

- [Choosing the right chart](/handbook/choosing)
- [Design principles](/handbook/design-principles)
