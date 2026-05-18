---
title: Annotations
---

# Annotations

> Annotations guide the reader to the story in the data. They explain design elements, highlight significant values, and provide context the chart alone cannot convey. Used well, they do most of the storytelling.

## Purpose

Annotations guide the reader to the story in the data. They explain design elements, highlight significant values, and provide context that the chart alone cannot convey.

A chart without annotations presents data. A chart *with* annotations tells a story.

## Types of annotations

| Type | Description | Use for |
|------|-------------|---------|
| **Reference line (horizontal)** | Line at a specific y-value | Averages, targets, benchmarks, thresholds |
| **Reference line (vertical)** | Line at a specific x-value | Events in time, policy changes, milestones |
| **Range band (horizontal)** | Shaded region between two y-values | Acceptable zones, confidence intervals |
| **Range band (vertical)** | Shaded region between two x-values | Time periods (recessions, campaigns) |
| **Point annotation** | Marker + label at a specific data point | Outliers, peaks, significant individual values |
| **Callout** | Label with connector line | Explanations positioned away from crowded areas |

## Best practices

- Maximum **3-4 annotations per chart** to avoid overwhelming readers
- Position explanatory text as close to the relevant data as possible
- Use **two text hierarchy levels** within annotations (e.g., bold primary, regular secondary) — not more
- Use text outlines when annotations overlay grid lines
- On mobile, hide less important annotations or move them below the chart
- Write annotations that add context beyond what the data shows ("why" not just "what")

## Annotations as storytelling

::: tip
"If everything is emphasized, nothing is." Prioritize ruthlessly. The annotation should match the chart's headline — reinforce the main point, don't dilute it with tangential observations.
:::

A good annotation reads like a caption to a photograph: it tells the reader what matters here and why. Avoid restating what the axis already shows.

::: info Example
**Bad:** "March: 2,300 units" (redundant with the data label)

**Good:** "New packaging launched March 3 — unit sales jumped 40%"
:::

## How Blueprint Chart applies annotations

Blueprint Chart implements annotations as first-class citizens: **Point**, **Range**, and **Free** annotations are part of the DSL grammar and the rendering pipeline. Annotations are ordered and rendered above the chart geometry but below tooltips, so they sit visually in the foreground without interfering with hover interaction.

```bpc
chart line {
  title = "Unit sales jumped after new packaging launched"

  data {
    "Jan" = 1600
    "Feb" = 1700
    "Mar" = 2300
    "Apr" = 2350
    "May" = 2420
  }

  annotation point {
    at    = "Mar"
    label = "New packaging launched March 3"
  }
}
```

See the [BPC DSL Specification](/spec/dsl) for the full annotation grammar.

## See also

- [Frame Elements](/handbook/frame-elements)
- [Labels & Legends](/handbook/labels)
- [Design Principles](/handbook/design-principles)
- [BPC DSL Specification](/spec/dsl)
