# Roadmap

> A high-level view of where Blueprint Chart is going. This is a direction, not a dated commitment — priorities shift as we learn. For the authoritative list of in-flight work, see the [open issues](https://github.com/blueprint-chart/blueprint-chart/issues) and [releases](https://github.com/blueprint-chart/blueprint-chart/releases).

## Vision

**Blueprint Chart is an open, plain-text chart format an AI can write and any browser can render. Self-contained, no backend, no account required.** Describe a chart in a compact, human-readable DSL (`.bpc`) — or let an LLM emit it — and it renders anywhere, fully self-contained. A best-in-class editor is there for when a human wants to refine it by hand.

Three properties make this work, and we won't trade them away:

- **Static-first** — every chart is authored and rendered entirely in the browser. No backend is required to create, host, or embed a chart.
- **Open core** — the engine, the DSL, and the editor are permanently free and open-source (MIT).
- **Data sovereignty** — by default, data never leaves the browser.

## Now

Getting to a stable, well-documented public release:

- Deploy the documentation site (`docs.blueprintchart.com`).
- Ship a maintained `CHANGELOG.md` and clear contribution/security/conduct docs.
- Improve `recommend_chart_type` accuracy in [`@blueprint-chart/mcp`](https://github.com/blueprint-chart/mcp) so AI-authored charts pick the right type.
- Continue chart-rendering correctness and polish (see open issues).

## Next

Make Blueprint Chart the natural choice when an AI assistant needs to draw a chart:

- Publish and harden the [`@blueprint-chart/mcp`](https://github.com/blueprint-chart/mcp) server for Claude, Cursor, ChatGPT, and other agents.
- `llms.txt` and per-chart-type guides so agents and search can discover the DSL.
- A headless renderer CLI (`bpc render`) for PNG / SVG / animated exports.
- First-party agent artefacts (Cursor rule, Claude skill, editor templates).
- Premium extensions (Brand Kit, advanced export, animation) and an embeddable SDK for products that ship charts in production.

## Later

- Optional hosted collaboration (sync, version history, approvals) — strictly opt-in, never required to use the product.
- Community theme & template marketplace.
- Static-site integrations (Hugo, Astro, Eleventy, Next.js).

## How to influence the roadmap

- Open or upvote an [issue](https://github.com/blueprint-chart/blueprint-chart/issues).
- Start a discussion about a use case or chart type you need.
- See [CONTRIBUTING.md](./CONTRIBUTING.md) to get involved.
