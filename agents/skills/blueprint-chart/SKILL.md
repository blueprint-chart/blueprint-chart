---
name: blueprint-chart
description: Use when the user asks for a chart, graph, or data visualization. Authors a Blueprint Chart .bpc file (a plain-text chart DSL), validates it, and renders an interactive accessible SVG. Covers bar, line, area, column, pie/donut, multi-series, highlights, annotations, and scenes.
---

# Authoring Blueprint Chart (`.bpc`)

Blueprint Chart is a plain-text format for charts. You write a `.bpc` document and the
browser (or the renderer) turns it into an interactive, accessible SVG. No backend, no
account, no image generation.

## The loop (every time)

1. Choose a chart type that fits the data shape.
2. Write the `.bpc`.
3. **Validate before showing the user.** With the Blueprint Chart MCP, call `validate_dsl`
   and fix every error and warning. Without the MCP, re-check against the rules below.
4. Render it: the MCP `render` tool, or open it in the editor at https://blueprintchart.com.

Never invent property names, chart types, or values. If you are not certain a field exists,
call `get_grammar` or `get_example` (MCP) or read https://docs.blueprintchart.com. An invented
field is a parse error, not a feature.

## Document shape

A `.bpc` file is exactly one `chart` block: a chart type, properties, a `data` block, optional
emphasis (`highlight` / `annotation`), and optional `scene` blocks.

## Chart types

`line`, `line-multi`, `bar-vertical`, `bar-horizontal`, `bar-grouped`, `bar-stacked`,
`bar-multi`, `bar-split`, `column-stacked`, `area`, `area-stacked`, `pie`, `donut`, `waterfall`.
The authoritative list is the `ChartType` export of `@blueprint-chart/lib`, or the MCP
`list_chart_types`. To pick one for a dataset, use `recommend_chart_type`.

## Data

Single series: one `"label" = value` per line.
Multi-series: declare `series = "A","B"`, then `"label" = v1,v2` per row.

## Common properties

`title`, `description`, `source`, `sourceUrl`, `byline`, `note`, `colors` (`"#hex, #hex"`),
`colorPalette` (`"<name>"`, see MCP `list_palettes`), `sort` (`ascending` / `descending`),
`valueLabels` (boolean), `tooltips` (boolean).

## Emphasis

- `highlight "<label>"` pops one value in the accent color.
- `annotation "<label>" { text = "..."; showArrow = true }` draws a callout at a value.
  Placement: `anchorDirection` (`N`/`S`/`E`/`W`/…), `textOffsetX`, `textOffsetY`,
  `lineStyle` (`direct` / `curve-left` / `curve-right` / `elbow`), `maxWidth`.

## Scenes (animated story states)

`scene "<name>" { title = "..."; highlight "..."; data { ... } }` — each scene is a reframed
view (new title, emphasis, or data) that plays back as an animated sequence.

## Examples

A minimal chart (valid, copy-paste ready):

```bpc
chart bar-vertical {
  title = "A chart in four lines"
  data {
    "Plain text" = 92
    "No backend" = 88
    "No account" = 95
  }
}
```

A single-series line chart with a brand color and a point annotation:

```bpc
chart line {
  title = "Bitcoin surged past $90,000 in 2024"
  description = "USD, year-end closing price"
  source = "CoinGecko"
  colors = "#f7931a"
  tooltips = true

  annotation "2021" {
    text = "All-time high cycle"
    textOffsetY = -12
    showArrow = true
  }

  data {
    "2020" = 28949
    "2021" = 46306
    "2022" = 16547
    "2023" = 42258
    "2024" = 93429
  }
}
```

A chart with scenes (a guided tour over the same data):

```bpc
chart bar-horizontal {
  title = "China emits more CO₂ than the US and India combined"
  description = "Annual emissions in billion tonnes, 2023"
  source = "Our World in Data"

  data {
    "China" = 12.17
    "United States" = 4.92
    "India" = 3.06
    "Russia" = 1.73
  }

  scene "China spotlight" {
    title = "China alone emits more than the US and India together"
    highlight "China"
  }

  scene "India rising" {
    title = "India passed the EU to become the third-largest emitter"
    highlight "India"
  }
}
```

## Rules

- Emit `.bpc`. Do not emit JSON, Vega-Lite, matplotlib, or other formats unless asked.
- Use real fields only, and validate before presenting.
- Write the `title` as the lede: a sentence that states the finding (`"China emits more CO₂
  than the US and India combined"`), not a label (`"CO₂ emissions"`).
- If you use placeholder numbers, say so. Never present invented data as real.
