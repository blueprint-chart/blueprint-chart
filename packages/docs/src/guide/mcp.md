# Authoring with AI

Describe the chart you want; let your AI assistant build it. The
[`@blueprint-chart/mcp`](https://github.com/blueprint-chart/mcp) server connects Blueprint
Chart to Claude, Claude Code, Cursor, or any [Model Context Protocol](https://modelcontextprotocol.io)
client. The model reads the dataviz handbook, writes the `.bpc`, validates it, and renders it —
so you get a real, accessible chart from a sentence instead of guesswork.

## How it works

The MCP gives your assistant a tight, grounded loop:

**read the handbook → write `.bpc` → `validate_dsl` → `render` → iterate**

It is primed on Blueprint Chart's dataviz pedagogy *before* it writes a line of DSL, then
closes the loop with deterministic parse + render feedback instead of hallucinating syntax.

## Connect your client

::: code-group

```bash [Claude Code]
claude mcp add blueprint-chart -- npx -y @blueprint-chart/mcp
```

```json [Claude Desktop]
{
  "mcpServers": {
    "blueprint-chart": {
      "command": "npx",
      "args": ["-y", "@blueprint-chart/mcp"]
    }
  }
}
```

```json [Cursor]
{
  "mcpServers": {
    "blueprint-chart": {
      "command": "npx",
      "args": ["-y", "@blueprint-chart/mcp"]
    }
  }
}
```

:::

## Tools

| Tool | Purpose |
| --- | --- |
| `validate_dsl` | Parse `.bpc`; returns `{ valid, errors[], warnings[] }` — each error carries a `code`, `message`, and actionable `suggestion` |
| `inspect_dsl` | Summarize a `.bpc`: chart type, scenes, series/row counts, feature flags |
| `recommend_chart_type` | Rank chart types for a given column shape and row count |
| `render` | Render to SVG (default) or PNG, with structured errors on failure |
| `list_chart_types` | List all renderable chart types |
| `describe_chart_type` | Properties, when-to-use, and data shape for one chart type |
| `get_example` | Fetch a canonical `.bpc` sample by chart type or name |
| `get_grammar` | Full DSL syntax reference |

## Resources

The handbook, DSL grammar, guides, chart-type docs, and canonical samples are all exposed as
`bpc://` resources — the same content you're reading on this site:

- `bpc://grammar` — the full DSL syntax reference
- `bpc://handbook/<slug>` — dataviz pedagogy (choosing, color, typography, accessibility, …)
- `bpc://guide/<slug>` — usage guides (scenes, palettes, data transforms, …)
- `bpc://chart-types/<slug>` — per-chart-type docs
- `bpc://samples/<id>` — canonical `.bpc` examples
- `bpc://reference/dsl/<slug>` and `bpc://reference/api/<slug>` — the full reference

## Example

> **You:** Make a horizontal bar chart of English letter frequencies — top 10, highlight E.
>
> **Claude:** *(calls `list_chart_types` and `get_example`, writes the `.bpc`, calls `validate_dsl`
> to confirm it parses, then `render` and shows you the image and the source)*

```bpc
chart bar-horizontal {
  title = "E is the most frequent letter in English"
  sort = descending
  valueLabels = true
  highlight "E"
  data { "E" = 12.70; "T" = 9.06; "A" = 8.17; ... }
}
```

## Learn more

Full setup, the complete tool/resource reference, and release notes live in the
[MCP repository](https://github.com/blueprint-chart/mcp) and on
[npm](https://www.npmjs.com/package/@blueprint-chart/mcp).
