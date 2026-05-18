---
title: Line chart
---

# Line chart

> Single-series line chart for continuous trend over an ordered domain.

`line` connects data points to show how a single measure changes across an ordered axis — typically time. It supports `interpolation`, `lineSymbols`, `crosshair`, and `tooltips`.

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
