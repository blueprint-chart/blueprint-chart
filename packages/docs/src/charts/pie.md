---
title: Pie chart
---

# Pie chart

> Circular part-to-whole chart for very small N.

`pie` divides a circle into proportional slices, each representing a category's share of the whole. See [Properties](#properties) for every key it accepts.

## When to use

- Simple proportional splits with 2–5 categories
- Values near visually meaningful fractions (25 %, 50 %, 75 %)
- General audiences where the chart needs to carry emotional weight
- Sidebar or callout context — not the main analytical chart

## When NOT to use

- More than 5 categories — small slices become meaningless; consider grouping with `sliceMax` and `sliceGroupLabel`
- Comparing similar-sized portions — the human eye is poor at judging angles
- Comparing multiple pie charts against each other (use small multiples of bar charts instead)
- When precise values matter — a bar chart is almost always more readable

## Example

```bpc
chart pie {
  title = "Asia is home to nearly 60% of the world's population"
  description = "Estimated share, 2024"
  source = "United Nations"
  sourceUrl = "https://population.un.org"
  colorPalette = "Klimt"
  legendPosition = "right"
  tooltips = true

  data {
    "Asia" = 59.4
    "Africa" = 18.3
    "Europe" = 9.3
    "Latin America" = 8.2
    "North America" = 4.8
  }
}
```


<!-- options:start -->

## Properties

Every property `pie` accepts, beside the [frame and layout keys](/reference/dsl/properties) every chart shares. Anything absent from this table is rejected by `validateChart` and ignored by the renderer.

| Property | Type | Default |
| --- | --- | --- |
| `colors` | colors | (unset) |
| `colorPalette` | select, see [Palettes](/guide/palettes) | `Blueprint` |
| `autoContrast` | boolean | `false` |
| `allowDarkMode` | boolean | `true` |
| `legend` | boolean | `false` |
| `legendAnchor` | select: `start`, `middle`, `end` | `start` |
| `legendPosition` | select: `top`, `bottom`, `left`, `right` | `top` |
| `directLabelling` | select: `""`, `auto`, `outside`, `inside` | `auto` |
| `tooltips` | boolean | `false` |
| `displayAsPercentage` | boolean | `true` |
| `showTotal` | boolean | `false` |
| `showLabels` | boolean | `true` |
| `showValues` | boolean | `true` |
| `sliceMax` | text | `5` |
| `sliceGroupLabel` | text | `Others` |

<!-- options:end -->

## Common pitfalls

- Too many slices destroy readability — cap at five and use `sliceMax` to merge the tail
- Exploded or 3D pie effects distort proportions; Blueprint Chart doesn't render them, and you shouldn't approximate them elsewhere
- As Edward Tufte famously noted: the only thing worse than a pie chart is several of them

## Related types

- [`donut`](./donut) — same encoding with a central slot for a total or label
- [`bar-horizontal`](./bar-horizontal) — almost always more readable for precise comparison
- [`bar-stacked`](./bar-stacked) — when you want composition across several totals

## See also

- [Choosing the right chart](/handbook/choosing)
- [Design principles](/handbook/design-principles)
