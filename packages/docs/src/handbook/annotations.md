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

  annotation "Mar" {
    text = "New packaging launched March 3"
    showArrow = true
  }
}
```

See the [BPC DSL Specification](/reference/dsl/annotations) for the full annotation grammar.

## Worked example: a point annotation tied to a peak

```bpc
chart line {
  title = "Bitcoin surged past $90,000 in 2024"
  description = "USD, year-end closing price"
  source = "CoinGecko"
  colors = "#f7931a"

  data {
    "2020" = 28949
    "2021" = 46306
    "2022" = 16547
    "2024" = 93429
  }

  annotation "2021" {
    text = "All-time high cycle"
    textOffsetY = -12
    showArrow = true
  }
}
```

::: info From `packages/lib/src/samples/bitcoin-price.bpc`
The annotation is keyed by the same x-value the data uses (`"2021"`), placed `-12` pixels above the point and connected with `showArrow`. One annotation, one observation — the chart stays under the 3–4 annotation ceiling and the label sits in the negative space above the data, not on top of the line.
:::

## Worked example: a callout with curved leader line

```bpc
chart bar-vertical {
  title = "China emits more CO₂ than the US and India combined"
  description = "Annual emissions in billion tonnes, 2023"
  colors = "#abb8c3"
  valueLabels = true

  data {
    "China" = 11.9
    "United States" = 4.78
    "India" = 2.88
    "Russia" = 1.78
  }

  colorize "China" {
    color = "#e15759"
  }

  annotation "India" {
    text = "Surpassed EU in 2023"
    showLine = true
    anchorDirection = N
    textOffsetX = 66
    textOffsetY = -41
    lineStyle = curve-left
    showArrow = true
  }
}
```

::: info From `packages/lib/src/samples/co2-emissions.bpc`
A callout adds the *why* alongside the data ("Surpassed EU in 2023") — a sentence that the bar height alone cannot communicate. `lineStyle = curve-left` plus the text offsets keep the label well clear of the bars; `anchorDirection = N` attaches the leader line to the top of the "India" bar.
:::

## See also

- [Frame Elements](/handbook/frame-elements)
- [Labels & Legends](/handbook/labels)
- [Design Principles](/handbook/design-principles)
- [BPC DSL Specification](/reference/dsl/annotations)
