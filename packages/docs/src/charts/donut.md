---
title: Donut chart
---

# Donut chart

> Circular part-to-whole chart with a central label slot.

`donut` is a pie chart with the centre removed, opening a slot for a total, key metric, or icon. Honours `displayAsPercentage`, `showTotal`, `showLabels`, `showValues`, `sliceMax`, and `sliceGroupLabel`.

## When to use

- Same situations as a [`pie`](./pie) chart, but where a central metric adds context (total value, share of target, KPI badge)
- Editorial layouts where the modern aesthetic suits the surrounding design
- When arc length needs to read slightly more cleanly than wedge area

## When NOT to use

- More than 5–6 slices — use `sliceMax` to merge the tail into "Other"
- Comparing several donut charts against each other (small multiples of bar charts win)
- When precise value reading matters

## Example

```bpc
chart donut {
  title = "Coal still generates a third of the world's electricity"
  description = "Share by source, 2024"
  source = "IEA"
  sourceUrl = "https://iea.org"
  byline = "Pierre Romera"
  note = "Percentages may not sum to 100 due to rounding"
  colors = "#76b7b2, #4e79a7, #59a14f, #f28e2b, #edc949, #e15759, #b07aa1"
  legendPosition = "right"
  tooltips = true
  displayAsPercentage = true

  data {
    "Coal" = 34.2
    "Natural Gas" = 22.1
    "Hydro" = 14.8
    "Nuclear" = 9.4
    "Wind" = 9.5
    "Solar" = 6.2
    "Other" = 3.8
  }
}
```


## Common pitfalls

- Filling the centre slot with decoration instead of a meaningful metric wastes the chart's main affordance
- Inner radius too thin reads like a pie; too thick collapses the ring into a stripe
- Same caveats as a pie: too many slices, similar sizes, and side-by-side comparisons all hurt readability

## Related types

- [`pie`](./pie) — when there's no central metric worth showing
- [`bar-horizontal`](./bar-horizontal) — when precise comparison matters
- [`bar-stacked`](./bar-stacked) — composition across several totals

## See also

- [Choosing the right chart](/handbook/choosing)
- [Design principles](/handbook/design-principles)
