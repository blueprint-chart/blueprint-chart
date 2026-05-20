---
title: Axes & Grid Lines
---

# Axes & Grid Lines

> When zero matters, when it doesn't, how grid lines should whisper rather than shout, how to format numbers, when to use logarithmic scales, and how aspect ratio silently changes a chart's story.

## Baseline rules

| Chart type | Must start at zero? | Reason |
|------------|---------------------|--------|
| Bar / column | **Yes** | Bar length encodes the value |
| Stacked bar | **Yes** | Area encodes the value |
| Area chart | **Yes** | Filled area encodes magnitude |
| Line chart | **No** | Position (not length) encodes the value |
| Scatter plot | **No** | Position encodes the value |

::: warning
Truncating the y-axis on a bar or area chart visually exaggerates differences. This is the single most common deceptive pattern in the wild. See [Anti-Patterns](/handbook/anti-patterns).
:::

## Grid lines

- Grid lines should be **subtle**: light grey, thin (0.5–1px)
- Y-axis grid lines are generally more useful than x-axis grid lines
- Remove grid lines entirely when value labels are shown directly on data
- Grid lines are reference aids, not primary content — they should never compete with data

## Tick marks

- Subtle or no ticks are preferred in modern chart design
- Use consistent intervals (don't skip values)
- Avoid excessive tick density — 5-7 ticks on a continuous axis is usually sufficient

## Number formatting

- Use abbreviated formats: **20k, 20m, 20b** (not "in millions")
- Remove trailing zeros: **27%** not **27.0%**
- Use thousands separators: **1,000** not **1000**
- Repeat units on axis labels: **$20k** on each tick, not just "in thousands of dollars"

## Logarithmic scales

- Use for data spanning multiple orders of magnitude
- Display relative changes and ratios
- Add horizontal reference lines at meaningful values
- Arrange symmetrically around the no-change point
- Use ratio notation (1/4, 1/2, 1, 2, 4) rather than decimal notation
- Label clearly — many audiences are unfamiliar with log scales

## Aspect ratio

- Default to roughly **4:3** or **16:9** for standard charts
- Use **1:1** (square) when both axes share the same unit or meaning (observed vs. predicted, before vs. after)
- Aspect ratio dramatically affects perceived slope and trend interpretation

::: tip
A trend that looks alarming at 3:1 can look flat at 3:4. When showing rate of change, pick an aspect ratio that reflects the underlying rate honestly — neither flattened nor exaggerated.
:::

## How Blueprint Chart applies axes

Blueprint Chart's `AxisOptions` exposes scale type (linear / log), tick count, tick format, and baseline behavior. D3 scales drive the tick layout, and a shared number formatter is used by the axis, tooltip, and direct labels so the same value is rendered identically wherever it appears.

See the [API reference](/reference/api/) for the public options that toggle grid lines, tick density, and baseline zero.

## Worked example: number format on the axis

```bpc
chart line {
  title = "Bitcoin surged past $90,000 in 2024"
  description = "USD, year-end closing price"
  source = "CoinGecko"
  colors = "#f7931a"
  verticalNumberFormat = ",.0f"
  lineSymbols = true

  data {
    "2016" = 963
    "2020" = 28949
    "2021" = 46306
    "2024" = 93429
  }
}
```

::: info From `packages/lib/src/samples/bitcoin-price.bpc`
`verticalNumberFormat = ",.0f"` uses a D3 format string to add thousands separators and drop decimals — so the axis shows `93,429` instead of `93429.00`. The same formatter feeds the tooltip and any direct value labels, so identical values render identically in every slot.
:::

## Worked example: gridlines that whisper

```bpc
chart line {
  title = "2024 was the hottest year on record"
  colors = "#e15759"
  showVerticalAxis = false
  showVerticalTicks = false
  verticalGridStyle = "dashed"
  showHorizontalAxis = true
  showHorizontalTicks = false
  horizontalGridStyle = "none"
}
```

::: info From `packages/lib/src/samples/temperature-anomaly.bpc`
The vertical axis line and ticks are off; only dashed horizontal gridlines remain as reference. The horizontal axis stays visible but loses its ticks. Net result: gridlines whisper, the line speaks.
:::

## See also

- [Labels & Legends](/handbook/labels)
- [Anti-Patterns](/handbook/anti-patterns)
- [Design Principles](/handbook/design-principles)
- [Frame Elements](/handbook/frame-elements)
