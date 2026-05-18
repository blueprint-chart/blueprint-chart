---
title: Horizontal bar chart
---

# Horizontal bar chart

> Single-series horizontal bar chart for long category labels and ranked bars.

`bar-horizontal` is the same encoding as a vertical bar chart turned on its side — categories run down the left, bars extend to the right. It honours `sort`, `sortMode`, `valueLabels`, and `valueLabelPosition`. The alias `horizontal-bar` is registered against the same renderer.

## When to use

- Category labels are long (country names, survey responses, product names)
- Ranking displays — high-to-low from top to bottom reads intuitively
- Mobile-friendly layouts — horizontal bars grow vertically, adapting to narrow screens

## When NOT to use

- Time-based data (the horizontal axis conventionally represents time — use [`line`](./line))
- A handful of categories with short labels — [`bar-vertical`](./bar-vertical) is more compact

## Example

```bpc
chart bar-horizontal {
  title = "Japan leads in life expectancy while the US lags behind"
  description = "Selected countries, years (2023)"
  source = "World Bank"
  sourceUrl = "https://data.worldbank.org"
  note = "Figures are estimates and may differ from national statistics"
  sort = descending
  colors = "#59a14f"
  horizontalLabelPosition = off
  horizontalGridStyle = none

  colorize "United States" {
    color = "#e15759"
  }

  data {
    "Japan" = 84.8
    "Switzerland" = 83.8
    "Australia" = 83.5
    "Sweden" = 83.1
    "Canada" = 82.7
    "France" = 82.5
    "Germany" = 81.4
    "United Kingdom" = 81.2
    "United States" = 78.5
    "China" = 78.2
  }
}
```


## Common pitfalls

- Forgetting to sort — an unranked horizontal bar chart loses most of its power
- Mixing the horizontal axis with time, which reads as a flipped line chart
- Long labels still cause issues at very narrow widths; truncate or shorten before publishing

## Related types

- [`bar-vertical`](./bar-vertical) — when labels are short and you have room horizontally
- [`bar-stacked`](./bar-stacked) — when each bar should break down into segments
- [`bar-split`](./bar-split) — when values can be positive or negative

## See also

- [Choosing the right chart](/handbook/choosing)
- [Design principles](/handbook/design-principles)
