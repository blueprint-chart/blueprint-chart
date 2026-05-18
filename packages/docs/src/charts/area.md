---
title: Area chart
---

# Area chart

> Single-series area chart for magnitude over time; pairs with `areaFill`.

`area` is a line chart with the region below the line filled in, emphasising the magnitude of a single series rather than just its direction. Honours `areaFill`, `areaFillOpacity`, and custom `areaFills: AreaFillConfig[]`. Supports `interpolation`, `lineSymbols`, `crosshair`, and `tooltips`.

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

[View in the editor →](https://blueprintchart.com)

## Common pitfalls

- The y-axis must start at zero — the filled area encodes magnitude
- A fully opaque fill hides the line itself; keep `areaFillOpacity` around 0.2–0.3
- Don't stack two area charts by overlapping them; reach for [`area-stacked`](./area-stacked)

## Related types

- [`line`](./line) — when the trend matters and the magnitude doesn't
- [`area-stacked`](./area-stacked) — when you have multiple series to compose
- [`bar-vertical`](./bar-vertical) — when the x-axis is categorical

## See also

- [Choosing the right chart](/handbook/choosing)
- [Design principles](/handbook/design-principles)
