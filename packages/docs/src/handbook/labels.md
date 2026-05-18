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

Blueprint Chart exposes a legend renderer with placement, orientation, and wrapping options. Direct labels are available for line, bar, and pie-family charts; the renderer falls back to legends on narrow layouts automatically. See the [API reference](/api/) for `renderLegend` and the per-chart label options.

## See also

- [Typography](/handbook/typography)
- [Annotations](/handbook/annotations)
- [Tooltips & Interaction](/handbook/tooltips)
- [Accessibility](/handbook/accessibility)
