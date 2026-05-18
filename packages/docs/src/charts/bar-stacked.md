---
title: Stacked bar chart
---

# Stacked bar chart

> Stacked horizontal bar chart for composition within a category, emphasising the total.

`bar-stacked` segments horizontal bars into subcategories, showing both the individual parts and the total. Honours `stackMode` and `stackPercent` — flip to a 100 % view for pure composition.

## When to use

- Showing how a total breaks down into parts
- Comparing totals across categories while keeping the composition visible
- 100 % stacked view (`stackPercent = true`) when relative proportions matter more than absolute values
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
    _series = "0-14","15-64","65+"
    "China" = 249,987,191
    "India" = 365,948,100
    "USA" = 60,215,58
    "Indonesia" = 66,191,18
    "Brazil" = 42,150,22
  }
}
```


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
