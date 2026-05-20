---
title: Frame Elements
---

# Frame Elements

> A well-structured chart frame has a clear information hierarchy: title, description, chart area, annotations, axis labels, note, source, and credit. Each element has a role and a style treatment that reflects its priority.

## Frame hierarchy

| Element | Priority | Style guidance | Content |
|---------|----------|----------------|---------|
| **Title** | 1st (most prominent) | Largest, boldest, highest contrast | Main takeaway — state the insight, not just the topic |
| **Description** | 2nd | Medium size, regular weight | Context: what the reader sees, time period, units |
| **Chart area** | 3rd | Maximum visual space | The data itself |
| **Annotations** | 4th | Two hierarchy levels | Explanations, callouts, reference lines |
| **Axis labels** | 5th | Medium, consistent | Units, categories, formatted values |
| **Note** | 6th | Small, subdued | Methodology, caveats, definitions |
| **Source** | Last | Smallest, grey, low contrast | Data attribution |
| **Credit** | Last | Smallest, grey | Chart author / publication |

## Title strategy

- Write **declarative / takeaway titles** that state the insight: *"Housing prices doubled in five years"* not *"Housing prices 2019–2024"*
- Imagine describing the chart to a friend — use that conversational phrasing
- Question titles create uncertainty; save them for exploratory dashboards
- Keep titles short and impactful

::: info Example
**Topic title (weak):** "Quarterly revenue by region"

**Takeaway title (strong):** "APAC overtook EMEA for the first time in Q3"
:::

## Source and credit conventions

- Sources appear as small, grey text at the bottom
- Format: *"Source: [Organization/Dataset]"* and *"Chart: [Author/Publication]"*
- Always present, never competing with the data for attention
- Credit lines build institutional trust and enable verification

## Note vs. description

A **description** (or subtitle) sits near the top and tells the reader what they're looking at: units, period, scope. A **note** sits near the bottom and addresses caveats: methodology, excluded categories, data revisions. Keep them separate.

## How Blueprint Chart applies the frame

Blueprint Chart's `FrameOptions` matches this hierarchy almost one-to-one: title, description, note, source, and credit are all first-class frame fields. The frame layer is independent of the chart layer, so the same frame can wrap any chart type without changing the type's internals. See the [API reference](/reference/api/) for `createFrame` and the frame options.

A minimal BPC source illustrates the structure:

```bpc
chart bar-vertical {
  title       = "APAC overtook EMEA for the first time in Q3"
  description = "Quarterly revenue, USD millions"
  note        = "Q3 figures preliminary; EMEA excludes Russia"
  source      = "Company filings"
  credit      = "Chart: Blueprint Chart"

  data {
    "AMER" = 142
    "APAC" = 118
    "EMEA" = 115
  }
}
```

## Worked example: every frame slot, none wasted

```bpc
chart line {
  title = "US inflation peaked at 9.1% before retreating to near 3%"
  description = "Consumer Price Index, year-over-year change (%)"
  source = "Bureau of Labor Statistics"
  sourceUrl = "https://bls.gov/cpi/"
  byline = "Pierre Romera"
  note = "All items, seasonally adjusted, urban consumers"
  colors = "#f28e2b"

  data {
    "Jan 2021" = 1.4
    "Jun 2022" = 9.1
    "Jan 2023" = 6.4
    "Jan 2025" = 3.0
  }
}
```

::: info From `packages/lib/src/samples/inflation-rate.bpc`
A declarative title carries the insight (`"…peaked at 9.1% before retreating to near 3%"`), `description` fixes the unit and time period, `note` confines the methodology footnote to the bottom, `source` plus `sourceUrl` form the attribution pair, and `byline` is the credit slot. Each field maps one-to-one onto `FrameOptions`.
:::

## See also

- [Typography](/handbook/typography)
- [Annotations](/handbook/annotations)
- [Design Principles](/handbook/design-principles)
- [BPC DSL Specification](/reference/dsl/)
