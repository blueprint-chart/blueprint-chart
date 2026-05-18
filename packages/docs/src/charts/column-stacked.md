---
title: Stacked column chart
---

# Stacked column chart

> Stacked vertical column chart for composition over discrete columns; supports percent stacking.

`column-stacked` is the vertical sibling of [`bar-stacked`](./bar-stacked) — each column breaks down into segments. It's the right choice when the x-axis represents a small number of ordered steps (quarters, fiscal years, study cohorts). Honours `stackMode` and `stackPercent`.

## When to use

- Composition over a small number of discrete columns (5–10 quarters, years, or stages)
- When both the total and the breakdown matter for each column
- 100 % stacked view (`stackPercent = true`) when readers should focus on relative share

## When NOT to use

- More than ~10 time points — switch to [`area-stacked`](./area-stacked)
- Data with negative values — stacking breaks down
- When precise segment-to-segment comparison is needed across columns

## Example

```bpc
chart column-stacked {
  title = "Software revenue grew steadily while hardware spiked in Q4"
  description = "Quarterly revenue in millions, 2024"
  source = "Annual report"

  data {
    _series = "Hardware","Software","Services"
    "Q1" = 120,85,45
    "Q2" = 135,92,48
    "Q3" = 128,98,52
    "Q4" = 155,105,58
  }
}
```


## Common pitfalls

- Stacking too many series — the top layers float and lose their baseline
- Switching to `stackPercent = true` without telling the reader hides the change in absolute total
- Inconsistent segment ordering between columns destroys the visual flow

## Related types

- [`bar-stacked`](./bar-stacked) — horizontal equivalent for long category labels
- [`area-stacked`](./area-stacked) — same idea with many time points
- [`bar-multi`](./bar-multi) — when you want side-by-side comparison instead of stacking

## See also

- [Choosing the right chart](/handbook/choosing)
- [Design principles](/handbook/design-principles)
