---
title: Choosing the Right Chart
---

# Choosing the Right Chart

> Before picking a visualization type, answer three questions about goal, content, and audience. Then pick the simplest chart that answers the question. Increase complexity only when the simpler form cannot convey the insight.

## Start with the question, not the chart

Answer three questions *before* sketching a single axis:

1. **What is the goal?** — Analysis (exploring data) or communication (presenting a finding)?
2. **What do you want to show?** — A comparison, a trend, a proportion, a distribution, a relationship?
3. **Who is the audience?** — Executives want high-level dashboards; analysts need granular detail; general audiences need familiar forms.

Write the chart's main statement first. It becomes a compass for every design decision that follows.

## Decision framework by goal

| Goal | Primary chart types | Avoid |
|------|---------------------|-------|
| **Compare categories** | Bar (vertical/horizontal), grouped bar, dot plot, bullet graph | Pie (if > 5 categories) |
| **Show change over time** | Line, area, column, slope chart | Pie/donut (no time axis) |
| **Show proportions / part-to-whole** | Stacked bar (100%), donut, waffle, treemap | Line charts |
| **Show distribution** | Histogram, box plot, violin plot, density plot | Bar chart (categorical only) |
| **Show relationships / correlation** | Scatter plot, bubble chart, heatmap | Bar charts |
| **Show ranking** | Horizontal bar (sorted), lollipop, slope chart | Pie charts |
| **Show flow / movement** | Sankey diagram, alluvial diagram | Static charts |
| **Show hierarchy** | Treemap, sunburst, tree diagram | Flat charts |
| **Show geographic patterns** | Choropleth, symbol map, bubble map | Non-spatial charts |
| **Show deviation from baseline** | Diverging bar, bullet graph, surplus/deficit line | Standard bar |

## Decision by data shape

| Data shape | Chart types |
|------------|-------------|
| 1 numeric variable | Histogram, density plot, box plot |
| 1 categorical variable | Bar chart, lollipop, pie/donut |
| Numeric + categorical (1 observation per group) | Bar chart, lollipop, dot plot |
| Numeric + categorical (many observations per group) | Box plot, violin plot, grouped bar |
| 2 numeric variables | Scatter plot, line chart (if ordered) |
| 3+ numeric variables | Bubble chart, parallel coordinates, heatmap |
| Multiple series over time | Multi-line, stacked area, small multiples |
| Hierarchical categories | Treemap, sunburst, circle packing |
| Network / flow | Sankey, chord diagram, network diagram |

## Complexity escalation rule

::: tip
Start with the simplest chart that answers the question. A bar chart that communicates clearly is better than a beautiful but confusing stream graph.
:::

Increase complexity only when the simpler form cannot convey the insight. Stream graphs, sunbursts, radar charts, and chord diagrams are powerful — and dangerous. Each added dimension must earn its place.

## When a table is better

If you have fewer than 5 numbers to present, a table often communicates more effectively than a chart. Tables allow precise value comparison; charts excel at showing patterns, trends, and relationships.

::: info Example
To display "revenue this quarter vs. last quarter, and year-over-year growth" — that is three numbers. A small table beats any chart.
:::

## See also

- [Design Principles](/handbook/design-principles)
- [Anti-Patterns](/handbook/anti-patterns)
- [Frame Elements](/handbook/frame-elements)
- [BPC DSL Specification](/spec/dsl)
