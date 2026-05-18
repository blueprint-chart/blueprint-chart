---
title: Chart Types
---

# Chart Types

Blueprint Chart ships 13 chart types organized into four families: bar, line, area, and part-to-whole.

## Bar family

- [`bar-vertical`](./bar-vertical) — single-series vertical bars; ranked categorical comparison
- [`bar-horizontal`](./bar-horizontal) — single-series horizontal bars; long labels
- [`bar-multi`](./bar-multi) — multi-series side-by-side bars
- [`bar-grouped`](./bar-grouped) — grouped clusters across a second dimension
- [`bar-split`](./bar-split) — diverging values around a shared baseline
- [`bar-stacked`](./bar-stacked) — stacked horizontal bars; composition emphasising the total
- [`column-stacked`](./column-stacked) — stacked vertical columns; supports percent stacking

## Line family

- [`line`](./line) — single-series trend over an ordered domain
- [`line-multi`](./line-multi) — multi-series time-series comparison

## Area family

- [`area`](./area) — single-series magnitude over time
- [`area-stacked`](./area-stacked) — composition over time; supports percent stacking

## Part-to-whole

- [`pie`](./pie) — circular part-to-whole, very small N
- [`donut`](./donut) — circular part-to-whole with a central label slot

::: tip Choosing the right chart
Not sure which type fits your data? Start with the decision framework in the [choosing the right chart](/handbook/choosing) handbook entry.
:::
