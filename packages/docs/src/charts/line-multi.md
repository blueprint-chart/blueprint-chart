---
title: Multi-line chart
---

# Multi-line chart

> Multi-series line chart for comparing several time series or trends.

`line-multi` plots two or more series on shared axes so readers can see divergence, convergence, and ranking shifts over an ordered domain. Supports `interpolation`, `lineSymbols`, `crosshair`, and `tooltips`.

## When to use

- Comparing trends across 2–4 series on the same scale
- Showing divergence or convergence between groups over time
- Highlighting one key series against grey "context" lines

## When NOT to use

- More than 5–6 series — the chart becomes a spaghetti tangle
- Series with very different scales (avoid dual axes; consider small multiples instead)
- Composition over time, where readers need to see how parts add up (use [`area-stacked`](./area-stacked))

## Example

```bpc
chart line-multi {
  title = "Germany stagnated while the US and China bounced back"
  description = "Annual percentage change in real GDP"
  source = "IMF World Economic Outlook"
  sourceUrl = "https://imf.org"
  colorPalette = "SolLeWitt"
  legend = false
  tooltips = true

  data {
    _series = "United States","China","Germany"
    "2018" = 2.9,6.7,1.0
    "2019" = 2.3,6.0,1.1
    "2020" = -2.8,2.2,-3.7
    "2021" = 5.9,8.4,3.2
    "2022" = 2.1,3.0,1.8
    "2023" = 2.5,5.2,-0.1
    "2024" = 2.8,5.0,-0.2
  }
}
```

[View in the editor →](https://blueprintchart.com)

## Common pitfalls

- Five or more lines crossing each other defeats the chart — either highlight one and grey the rest, or split into small multiples
- Two y-axes with different scales imply a correlation that may not exist
- Inconsistent colour assignment between charts in the same story confuses readers

## Related types

- [`line`](./line) — when you only need a single series
- [`area-stacked`](./area-stacked) — when the running total across series matters
- [`bar-grouped`](./bar-grouped) — when the x-axis is categorical, not continuous

## See also

- [Choosing the right chart](/handbook/choosing)
- [Design principles](/handbook/design-principles)
