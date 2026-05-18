---
title: Vertical bar chart
---

# Vertical bar chart

> Single-series vertical bar chart for ranked categorical comparison, small N.

`bar-vertical` compares discrete categories using the height of rectangular bars. It honours `sort`, `sortMode`, `valueLabels`, and `valueLabelPosition`. The alias `vertical-bar` is registered against the same renderer so `.bpc` documents can read either way.

## When to use

- Comparing quantities across a small number of categories (< 12)
- Ranking items when the category labels are short enough to fit horizontally
- A few data points over time (e.g. annual totals for 5 years)

## When NOT to use

- Continuous data distributions (no built-in histogram type)
- Many time periods — use [`line`](./line) for trends
- Long category labels that would need rotation — use [`bar-horizontal`](./bar-horizontal)

## Example

```bpc
chart bar-vertical {
  title = "Brazil produces more coffee than the next three countries combined"
  description = "Million 60-kg bags, 2023/24 crop year"
  source = "International Coffee Organization"
  sourceUrl = "https://ico.org"
  colorPalette = "Harvey"
  valueLabels = true
  valueLabelPosition = "auto"

  data {
    "Brazil" = 66.4
    "Vietnam" = 29
    "Colombia" = 11.4
    "Indonesia" = 9.9
    "Ethiopia" = 8.7
    "Honduras" = 6.3
  }

  colorize "Brazil" {
    color = "#a4432d"
  }

  transform sort {
    column = "value"
    direction = descending
  }
}
```


## Common pitfalls

- Truncating the y-axis exaggerates differences and misleads readers — always start at zero
- Too many categories create visual clutter; group small ones into "Other"
- 3D effects distort the encoding — Blueprint Chart doesn't offer them, and you shouldn't fake them

## Related types

- [`bar-horizontal`](./bar-horizontal) — when labels are long or you want a ranked list
- [`bar-multi`](./bar-multi) — when you need to compare two or more series side by side
- [`bar-stacked`](./bar-stacked) — when the parts of each bar sum to a meaningful total

## See also

- [Choosing the right chart](/handbook/choosing)
- [Design principles](/handbook/design-principles)
