---
title: Stacked area chart
---

# Stacked area chart

> Multi-series stacked area chart for composition over time; supports percent stacking.

`area-stacked` layers multiple series on top of each other so readers can see both the individual trends and the cumulative total. Set `stackPercent = true` to switch to a 100 % normalised view. Supports `interpolation`, `lineSymbols`, `crosshair`, and `tooltips`.

## When to use

- Showing how composition changes over time
- When the overall total matters as much as the individual parts
- Datasets with at least ~10 time points (use [`column-stacked`](./column-stacked) for fewer)
- 100 % stacked view (`stackPercent = true`) when relative share is the story

## When NOT to use

- Data with negative values (stacking breaks down)
- Precise comparison of individual series — stacking obscures the readings above the baseline
- More than ~5 series — the layers become unreadable

## Example

```bpc
chart area-stacked {
  title = "Renewables rose from 18 % to 23 % of global energy since 2000"
  description = "Share of primary energy by source, 2000–2023"
  source = "Our World in Data"
  sourceUrl = "https://ourworldindata.org/energy-mix"
  stackPercent = true
  areaSortMode = descending
  areaFillOpacity = 0.85

  data {
    _series = "Coal","Oil","Gas","Renewables"
    "2000" = 25,36,21,18
    "2005" = 27,35,22,16
    "2010" = 29,33,23,15
    "2015" = 28,32,24,16
    "2020" = 26,30,25,19
    "2023" = 24,29,24,23
  }
}
```

[View in the editor →](https://blueprintchart.com)

## Common pitfalls

- Series above the baseline are hard to compare — put the most important one at the bottom
- Too many small categories disappear in the stack; consolidate into "Other"
- 100 % stacking hides absolute change; pair it with a separate total chart if the magnitude matters

## Related types

- [`area`](./area) — single-series area
- [`line-multi`](./line-multi) — when individual trends matter more than the total
- [`column-stacked`](./column-stacked) — same idea, but for a small number of discrete columns

## See also

- [Choosing the right chart](/handbook/choosing)
- [Design principles](/handbook/design-principles)
