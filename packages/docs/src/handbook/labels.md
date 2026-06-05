---
title: Labels & Legends
---

# Labels & Legends

> Direct labeling beats legends wherever possible. When you must use a legend, place it where it helps. Use value labels when precision matters and the layout allows.

## Direct labeling is preferred

Place labels directly on or adjacent to data elements instead of using a separate legend. This eliminates the back-and-forth eye movement between legend and data.

**Direct labeling works well for:**

- **Line charts** — label at the end of each line
- **Bar charts** — label at the end of each bar
- **Pie / donut charts** — label each slice
- **Area charts** — label within or adjacent to each area

::: tip
**Match label color to data color** for instant association.
:::

## When to use legends

- Mobile or small screens where direct labels would overlap
- Too many series to label directly without clutter
- When the same visualization appears at multiple sizes

**Legend placement:**

- **Top of chart (horizontal legend)** — default for most charts
- Adjacent to the relevant data (right side of line chart)
- Never covering data
- Never at the bottom where it's missed

## Value labels

- Show value labels when precision matters to the reader
- On bar charts: inside the bar (if wide enough) or at the end
- On line charts: at key data points only, not every point
- On pie / donut charts: outside for small slices, inside for large ones
- Position labels to avoid overlap; use tooltips as a fallback for dense data
- Use "auto" positioning that chooses inside vs. outside based on available space

::: warning
Labeling every point on a dense line chart creates visual noise. Label extremes (peaks, troughs, end values) and let the reader rely on the axis or tooltip for the rest.
:::

## Label legibility checklist

- Does the label color contrast enough with its background?
- Is there a text outline (stroke) when the label overlays data or grid lines?
- Can the label be read without rotation? (Never rotate.)
- Does the label use the chart's number formatter so units match the axis?

## How Blueprint Chart applies labels

Blueprint Chart exposes a legend renderer with placement, orientation, and wrapping options. Direct labels are available for line, bar, and pie-family charts; the renderer falls back to legends on narrow layouts automatically. See the [API reference](/reference/api/) for `renderLegend` and the per-chart label options.

## Worked example: value labels replace the axis

```bpc
chart bar-vertical {
  title = "E is the most frequent letter in English"
  description = "How often each letter appears in typical English text"
  sort = descending
  valueLabels = true
  verticalLabelPosition = off
  verticalGridStyle = none

  data {
    "E" = 12.70
    "T" = 9.06
    "A" = 8.17
    "O" = 7.51
    "I" = 6.97
  }
}
```

::: info From `packages/lib/src/samples/letter-frequency.bpc`
`valueLabels = true` puts the precise number at the end of every bar, so the y-axis label position can be set to `off` and the gridlines removed entirely. Direct labelling replaces both the legend and the axis labels — a clean application of the data-ink rule.
:::

## Worked example: legend at the top, direct value labels at the bar end

```bpc
chart bar-multi {
  title = "USA tops Paris 2024 with 126 medals across all categories"
  description = "2024 Paris Summer Games — top six nations"
  colors = "#eeca3b, #c0c0c0, #cd7f32"
  legendPosition = "top"
  valueLabels = true
  verticalGridStyle = none
  verticalLabelPosition = off
  sort = descending

  data {
    series = "Gold","Silver","Bronze"
    "USA" = 40,44,42
    "China" = 38,32,18
    "Japan" = 27,14,17
  }
}
```

::: info From `packages/lib/src/samples/medal-count.bpc`
A multi-series bar chart needs a legend to map the three hues to Gold / Silver / Bronze — placed at the top so the eye reaches it before scanning the bars. Inside each bar, `valueLabels = true` prints the exact count, eliminating the need to read against a vertical scale.
:::

## See also

- [Typography](/handbook/typography)
- [Annotations](/handbook/annotations)
- [Tooltips & Interaction](/handbook/tooltips)
- [Accessibility](/handbook/accessibility)
