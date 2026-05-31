# Authoring with AI

Describe the chart you want; let your AI assistant build it. The
[`@blueprint-chart/mcp`](https://github.com/blueprint-chart/mcp) server connects Blueprint
Chart to any [Model Context Protocol](https://modelcontextprotocol.io) client — Claude (web,
desktop, and Code), ChatGPT, Cursor, VS Code, and more. The model reads the dataviz handbook,
writes the `.bpc`, validates it, and renders it — so you get a real, accessible chart from a
sentence instead of guesswork.

## How it works

The MCP gives your assistant a tight, grounded loop:

**read the handbook → write `.bpc` → `validate_dsl` → `render` → iterate**

It is primed on Blueprint Chart's dataviz pedagogy *before* it writes a line of DSL, then
closes the loop with deterministic parse + render feedback instead of hallucinating syntax.

## Connect your client

There are two ways to connect: use the **hosted** endpoint (nothing to install) or **run the
server locally** with `npx`.

### Hosted — `mcp.blueprintchart.com`

Point any remote-capable client at the public endpoint. There's nothing to install and no token
to configure — it's open.

**Endpoint:** `https://mcp.blueprintchart.com`

- **Claude.ai (web)** — requires a Claude Pro, Team, or Enterprise plan:
  1. Open **Settings → Connectors**.
  2. Click **Add custom integration**.
  3. Paste `https://mcp.blueprintchart.com` and save. There's no auth header to enter.
- **ChatGPT** — add `https://mcp.blueprintchart.com` as a custom connector (no authentication).
- **Cursor** — **Settings → MCP → Add server**, then enter the URL.
- **Claude Code** — add it over HTTP:

  ```bash
  claude mcp add blueprint-chart --transport http https://mcp.blueprintchart.com
  ```

### Local — run it with `npx`

Prefer to run the server on your own machine (for desktop apps, offline use, or full control)?
`npx` fetches it on demand — nothing is installed globally.

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

```json [VS Code]
{
  "servers": {
    "blueprint-chart": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@blueprint-chart/mcp"]
    }
  }
}
```

:::

Any other MCP client works too — run `npx -y @blueprint-chart/mcp` over stdio and drop it into
that client's server config.

## Tools

| Tool | Purpose |
| --- | --- |
| `validate_dsl` | Parse `.bpc`; returns `{ valid, errors[], warnings[] }` — each error carries a `code`, `message`, and actionable `suggestion` |
| `inspect_dsl` | Summarize a `.bpc`: chart type, scenes, series/row counts, feature flags |
| `recommend_chart_type` | Rank chart types for a given column shape and row count |
| `render` | Render to SVG (default), PNG, or HTML, with structured frame metadata and structured errors on failure |
| `list_chart_types` | List all renderable chart types |
| `describe_chart_type` | Properties, when-to-use, when-NOT-to-use, and data shape for one chart type |
| `get_example` | Fetch a canonical `.bpc` sample by chart type or name |
| `get_grammar` | Full DSL syntax reference |
| `export_chart` | Turn a validated `.bpc` into shareable editor URLs — an editable `copyUrl` and a read-only `embedUrl` for iframes |

## Prompts

| Prompt | Purpose |
| --- | --- |
| `author_chart` | Primes the assistant end-to-end for the full read → write → `validate_dsl` → `render` → iterate loop, with the MCP as validator and renderer |

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
> **Your assistant:** *(calls `list_chart_types` and `get_example`, writes the `.bpc`, calls
> `validate_dsl` to confirm it parses, then `render` and shows you the image and the source)*

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
