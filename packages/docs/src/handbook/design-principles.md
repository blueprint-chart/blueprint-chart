---
title: Design Principles
---

# Design Principles

> The core principles behind every good chart: purposefulness, clarity, data-ink ratio, restraint, consistency, starting with grey, the power of comparisons, and the refusal to use 3D.

## Purposefulness

Every visual element must advance the communicative goal. If it doesn't help the reader understand the data, remove it. A decorative stroke, a background gradient, a stray shadow — each is a distraction tax. The test is simple: *delete it and see if anything is lost*.

## Clarity over aesthetics

Prioritize legibility and interpretation accuracy. A clear chart that looks plain is better than a beautiful one that misleads or confuses. Beauty follows from clarity, not the other way around.

## Data-ink ratio

Maximize the share of ink (pixels) devoted to data. Reduce grid lines, borders, backgrounds, and decorative elements. As Tufte prescribed: **erase non-data-ink**.

::: tip
If a line doesn't carry data, ask whether it can be lighter, thinner, or simply removed. Most grid lines can be dropped entirely when value labels sit on the data.
:::

## Restraint

- Remove redundant elements
- Use the minimum number of colors needed
- Avoid 3D effects, shadows, gradients, and decorative illustrations
- Do not add features, axes, or dimensions that don't serve the story

Restraint is the discipline that separates editorial charts from dashboard clutter. A chart is not a brochure.

## Consistency

- Use the same color for the same category across all charts in a dashboard
- Maintain consistent axis scales when comparing charts side by side
- Use the same number format throughout

Consistency reduces cognitive load. A reader who has learned that "blue = Q1" in chart A should not have to relearn it in chart B.

## Start with grey

::: tip
Grey everything out first. Then selectively add color and emphasis to the elements that carry the story. This forces intentional hierarchy.
:::

When grey is the default, color becomes meaningful. Every colored element must earn its place.

## Comparisons make the story

Data in isolation has no meaning. Data in context — compared to another time period, another category, a target, an average — becomes insight. The comparison you choose determines the story you tell.

::: info Example
"Unemployment is 4.1%" is a number. "Unemployment is 4.1%, down from 6.5% two years ago" is a story. The comparison does the work.
:::

## Avoid 3D

::: warning
Unanimously across all sources: **avoid 3D charts entirely**. Tilted surfaces create perceived differences where none exist. Accurate value reading requires mental projection against axis walls — a task humans perform poorly.
:::

No 3D bar charts. No 3D pie charts. No extruded columns. No perspective shading.

## Worked example: start with grey, then highlight one thing

```bpc
chart bar-vertical {
  title = "Brazil produces more coffee than the next three countries combined"
  description = "Million 60-kg bags, 2023/24 crop year"
  source = "International Coffee Organization"
  colorPalette = "Harvey"

  data {
    "Brazil" = 66.4
    "Vietnam" = 27.5
    "Colombia" = 12.76
    "Ethiopia" = 9.13
    "Indonesia" = 7.65
    "Honduras" = 5.5
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

::: info Adapted from `packages/lib/src/samples/coffee-production.bpc`
Five bars stay in muted neutrals; the `colorize "Brazil"` block lifts the one bar the title is about. Direct labels carry the precise numbers by default, removing the need for a y-axis altogether, and gridlines drop out entirely. Restraint, purposefulness, and "start with grey" applied in a single chart.
:::

## How Blueprint Chart applies these principles

These principles drive the project's visual defaults: grey axis lines, minimal grid, flat geometry, direct labeling where possible, and brand tokens that nudge toward restraint. The renderer leans toward removal — every default exists because it earns its place.

## See also

- [Color & Palettes](/handbook/color)
- [Anti-Patterns](/handbook/anti-patterns)
- [Axes & Grid Lines](/handbook/axes)
- [Frame Elements](/handbook/frame-elements)
