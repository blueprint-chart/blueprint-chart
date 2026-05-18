---
title: Typography
---

# Typography

> Type in charts must be small, sharp, and legible at a glance. Use sans-serifs with unambiguous character shapes, size ruthlessly, never rotate, prefer sentence case, and left-align.

## Font selection

- Use **sans-serif fonts** for charts: Roboto, Lato, Open Sans, Source Sans Pro, Noto Sans
- Choose fonts where capital I, lowercase l, and number 1 are visibly different (Source Sans Pro, Verdana pass this test)
- For maximum accessibility: **Atkinson Hyperlegible** (Braille Institute / Google Fonts)
- Use **lining figures** (same height) for numbers in charts
- Use **tabular figures** (equal width) for aligned columns and data tables
- Maximum **two font families** in a single visualization

## Sizing

- Minimum **12-14px** for chart text on web
- Minimum **36pt** for presentations
- Title should be the largest, boldest text with highest contrast
- Axis labels and data labels at medium size
- Source and credit lines at smallest size, lowest contrast

## Readability rules

::: warning
**Never rotate text.** If axis labels don't fit, rephrase them, abbreviate, or switch to horizontal bars.
:::

- Use **sentence case** (not ALL CAPS) for readability
- **Left-align** multi-line text
- Use **bold** sparingly for emphasis; avoid italics (harder to read)
- Add text outlines (stroke in background color) when labels overlay chart elements

## Hierarchy

A chart typically has three to four type levels:

1. **Title** — largest, boldest, highest contrast (states the insight)
2. **Description / subtitle** — medium size, regular weight (context, time period, units)
3. **Axis and data labels** — medium, consistent throughout
4. **Source, note, credit** — smallest, lowest contrast

Anything beyond four levels starts competing for attention. Collapse hierarchy aggressively.

## How Blueprint Chart applies typography

The renderer defaults to a sans-serif with tabular figures for axis ticks and data labels; source lines are the smallest, greyest type in the frame. Type sizes and weights are exposed as CSS custom properties so a single theme change propagates everywhere — including the editor's stories and the component library.

```css
.bc-chart {
  --bc-font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --bc-font-size-title: 1.25rem;
  --bc-font-size-description: 0.9375rem;
  --bc-font-size-axis: 0.8125rem;
  --bc-font-size-source: 0.75rem;
}
```

## See also

- [Frame Elements](/handbook/frame-elements)
- [Labels & Legends](/handbook/labels)
- [Accessibility](/handbook/accessibility)
- [Design Principles](/handbook/design-principles)
