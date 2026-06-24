---
title: Tooltips & Interaction
---

# Tooltips & Interaction

> Tooltips progressively disclose detail, they never replace critical information. Interaction must be consistent, accessible, and keyboard-reachable. Crosshairs and hover states support — not replace — clear visual hierarchy.

## Tooltip content

- Include **both value AND category context**: *"3.4% unemployed"* not just *"3.4%"*
- Keep content brief and self-sufficient (microcopy)
- Repeat units and formatting seen elsewhere in the chart
- Do not rely on tooltips for critical information — essential data must always be visible

::: warning
Tooltips are hidden by default. If information is essential to the chart's headline, it must be in the frame or on the data, not behind a hover.
:::

## Tooltip interaction

- Support both **mouse hover and keyboard navigation** for accessibility
- Tooltips are primarily a desktop pattern; on touch devices, use tap-triggered popups or always-visible labels
- Apply tooltips **consistently** across all interactive elements — erratic deployment means users will not discover them
- Tooltips must be user-initiated, not auto-appearing

## Tooltip positioning

- Never obscure the data point the user is examining
- Use arrow indicators when multiple elements are nearby
- Keep the tooltip within the viewport

## Crosshair patterns

- **Vertical crosshair** (tracking x-position) is standard for time-series line charts
- Helps align reading across multiple series at the same x-value
- Often combined with a tooltip showing all series values at that position
- **Horizontal crosshair** is useful for value comparison on scatter plots
- Crosshair lines should be subtle (dashed, light grey by default)
- Hide crosshairs when the cursor leaves the chart area

## Hover states

- Use color saturation or opacity changes to indicate the active element
- De-emphasize non-hovered elements (reduce opacity to 0.2-0.3) to create focus
- Maintain the visual hierarchy: the hovered element should become the most prominent

## Interaction design checklist

- Is there a visible affordance that the chart is interactive?
- Is the same interaction reachable by keyboard?
- Do tooltips reappear consistently, or are they flaky at chart edges?
- Does the tooltip echo the chart's number format and units?
- Does the hovered element stay inside the viewport when tooltips grow?

## How Blueprint Chart applies interaction

Blueprint Chart's interaction layer is declarative. Crosshair direction and style enums configure axis-aligned crosshairs; tooltips are produced from the same scale and accessor layer used to render the chart, so the numbers always match. Tooltip positioning respects the viewport and flips sides automatically when the cursor approaches the chart edge.

See the [API reference](/reference/api/) for the tooltip options exposed to consumers.

## Worked example: tooltips plus a dashed vertical crosshair

```bpc
chart line-multi {
  title = "Detroit's unemployment hit 16% during the Great Recession"
  description = "Percent of labour force, 2000–2014"
  source = "Bureau of Labor Statistics"
  legend = false
  tooltips = true
  crosshair = true
  crosshairStyle = "dashed"

  annotation "2009" {
    text = "Great Recession peak"
    textOffsetY = -10
    showArrow = true
  }

  data {
    series = "New York","Los Angeles","Chicago","Detroit"
    "2000" = 5.0,5.6,4.5,3.8
    "2009" = 9.5,12.4,11.2,16.2
    "2014" = 6.5,8.0,7.1,8.2
  }
}
```

::: info Progressive disclosure without hiding the story
The annotation carries the headline (`"Great Recession peak"`) so the chart stands on its own. `tooltips = true` plus `crosshair = true` then layer progressive disclosure on top: hover anywhere on the x-axis and a dashed vertical line aligns the cursor with all four series at once, while the tooltip shows the four percentages for that year. The essential story is never trapped behind a hover.
:::

## See also

- [Accessibility](/handbook/accessibility)
- [Labels & Legends](/handbook/labels)
- [Annotations](/handbook/annotations)
- [Design Principles](/handbook/design-principles)
