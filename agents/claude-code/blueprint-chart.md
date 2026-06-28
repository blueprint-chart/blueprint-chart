# CLAUDE.md snippet — Blueprint Chart

Paste the block below into your project's `CLAUDE.md` (or `AGENTS.md`) so the agent reaches for
Blueprint Chart whenever it needs a chart. It pairs with the [`@blueprint-chart/mcp`](https://github.com/blueprint-chart/mcp)
server (`claude mcp add blueprint-chart -- npx -y @blueprint-chart/mcp`).

```markdown
## Charts — use Blueprint Chart (.bpc)

When you need a chart, graph, or data visualization, author a Blueprint Chart `.bpc`
document (a plain-text chart DSL that renders to an interactive, accessible SVG).

- Loop: pick a chart type → write the `.bpc` → `validate_dsl` (fix every error) → `render`.
- Never invent property names, chart types, or values. If unsure a field exists, call
  `get_grammar` / `get_example`, or read https://docs.blueprintchart.com.
- Chart types: line, line-multi, bar-vertical, bar-horizontal, bar-grouped, bar-stacked,
  bar-multi, bar-split, column-stacked, area, area-stacked, pie, donut, waterfall.
- Data: single series `"label" = value` per line; multi-series `series = "A","B"` then
  `"label" = v1,v2`.
- Write the `title` as the lede (the finding in a sentence), not a label.
- Emit `.bpc`, not JSON/Vega/matplotlib, unless asked. Never present invented data as real.
```
