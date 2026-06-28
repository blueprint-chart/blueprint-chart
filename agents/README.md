# Blueprint Chart for AI agents

Drop-in artifacts that teach AI coding tools to author **Blueprint Chart** `.bpc` charts: a
plain-text chart DSL that renders to interactive, accessible SVG with no backend and no account.

They all encode the same loop — **pick a chart type → write the `.bpc` → validate → render** —
and the same rule: use real fields only, validate before presenting, never invent syntax. Each
pairs best with the [`@blueprint-chart/mcp`](https://github.com/blueprint-chart/mcp) server,
which exposes `validate_dsl`, `render`, `get_example`, `get_grammar`, and more:

```bash
claude mcp add blueprint-chart -- npx -y @blueprint-chart/mcp
```

| Tool | Artifact | How to use |
| --- | --- | --- |
| **Claude / Claude Code** | [`skills/blueprint-chart/SKILL.md`](skills/blueprint-chart/SKILL.md) | Install as a skill, or paste the [`CLAUDE.md` snippet](claude-code/blueprint-chart.md) into your project. |
| **Cursor** | [`cursor/blueprint-chart.mdc`](cursor/blueprint-chart.mdc) | Copy into your project's `.cursor/rules/`. |
| **Any MCP client** (Windsurf, Cline, VS Code, …) | the MCP server | See the [Authoring with AI guide](https://docs.blueprintchart.com/guide/mcp) for per-client config. |

New to the format? Start with the [docs](https://docs.blueprintchart.com) or try the
[live editor](https://blueprintchart.com).
