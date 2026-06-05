---
title: Multi-series bar chart
---

# Multi-series bar chart

> Multi-series vertical bar chart for side-by-side comparison of a small group of series.

`bar-multi` places several series next to each other within each category, so readers can compare them at a glance. Honours `sort`, `sortMode`, `valueLabels`, and `valueLabelPosition`.

## When to use

- Comparing 2–3 series across the same categories (e.g. medals by colour, revenue by product line)
- When individual series values matter more than their totals
- A small, fixed set of categories where the comparison is the story

## When NOT to use

- More than 3–4 series per group — the clusters become unreadable
- When the total across series is the headline number — use [`bar-stacked`](./bar-stacked) or [`column-stacked`](./column-stacked)
- When the second dimension is itself a grouping (use [`bar-grouped`](./bar-grouped))

## Example

```bpc
chart bar-multi {
  title = "USA tops Paris 2024 with 126 medals across all categories"
  description = "2024 Paris Summer Games — top six nations"
  source = "Olympics.com"
  sourceUrl = "https://olympics.com"
  colors = "#eeca3b, #c0c0c0, #cd7f32"
  legendPosition = "top"
  valueLabels = true
  sort = descending

  data {
    series = "Gold","Silver","Bronze"
    "USA" = 40,44,42
    "China" = 38,32,18
    "Japan" = 27,14,17
    "Great Britain" = 22,21,22
    "Australia" = 17,7,22
    "France" = 16,20,23
  }
}
```


## Common pitfalls

- Too many bars per group overwhelms the reader; cap at 3–4 series
- Inconsistent colour encoding across charts in the same dashboard
- Sorting by the wrong series — make sure the sort matches the comparison you want readers to make

## Related types

- [`bar-grouped`](./bar-grouped) — when the categories themselves cluster into a higher group
- [`bar-stacked`](./bar-stacked) — when the total across series is the headline
- [`column-stacked`](./column-stacked) — composition over a small number of discrete columns

## See also

- [Choosing the right chart](/handbook/choosing)
- [Design principles](/handbook/design-principles)
