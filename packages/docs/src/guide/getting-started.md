# Getting Started

Blueprint Chart is published as three packages on NPM. Pick the one that matches what you're building.

| Package | When to use it |
| --- | --- |
| [`@blueprint-chart/lib`](https://www.npmjs.com/package/@blueprint-chart/lib) | Pure TypeScript chart engine — render charts from data + options or from a `.bpc` source. No Vue. |
| [`@blueprint-chart/ui`](https://www.npmjs.com/package/@blueprint-chart/ui) | Vue 3 component library — forms, panels, navigation, scene timeline, layout primitives. |
| [`@blueprint-chart/editor`](https://www.npmjs.com/package/@blueprint-chart/editor) | The full SPA — runs on top of `lib` + `ui`. Deployed at [blueprintchart.com](https://blueprintchart.com). |

## Install

::: code-group

```bash [pnpm]
pnpm add @blueprint-chart/lib
```

```bash [npm]
npm install @blueprint-chart/lib
```

```bash [yarn]
yarn add @blueprint-chart/lib
```

:::

## Render a chart from a BPC source

```ts
import { parse, buildChartOptions, parseData } from '@blueprint-chart/lib'

const source = `
  chart line {
    title = "Bitcoin year-end closing price"
    description = "USD, CoinGecko"
    colors = "#f7931a"

    data {
      "2022" = 16547
      "2023" = 42258
      "2024" = 93429
    }
  }
`

const ast = parse(source)
const data = parseData(ast)
const options = buildChartOptions(ast)
```

From here you wire the `data` and `options` into the renderer of your choice — `@blueprint-chart/lib` exposes the building blocks (`createFrame`, `createCanvas`, `renderLegend`, `renderHorizontalAxis`, `renderVerticalAxis`) plus a chart-type registry (`registerChart` / `getChart`). See [the API reference](/api/).

## Drop a chart into any page

If you don't need the programmatic API, use the bundled runtime. It picks up every `<script type="application/blueprint-chart">` tag and replaces it with a sandboxed iframe containing the rendered chart.

```html
<script src="https://unpkg.com/@blueprint-chart/lib/dist/runtime.iife.js"></script>

<script type="application/blueprint-chart">
  chart bar-vertical {
    title = "Renewables overtook coal in 2024"

    data {
      "Coal" = 21
      "Gas"  = 30
      "Renewables" = 35
      "Nuclear" = 14
    }
  }
</script>

<script>
  blueprintChart.initBlueprint()
</script>
```

See the [embedding guide](/guide/embed) for static sites, CMS integrations, and the base64 iframe pattern.

## Try the editor instead

The fastest way to author a chart is in the hosted editor.

- Open <https://blueprintchart.com>
- Pick a sample or paste your own CSV / data
- Tweak in the panel, watch the live preview, then export as a standalone HTML file or an embeddable `<script>` tag

The editor runs entirely in your browser — no account, no server upload, no telemetry.

## Build from source

If you want to contribute or develop against an unreleased build, see the [repository README](https://github.com/blueprint-chart/blueprint-chart#readme) and `AGENTS.md` for canonical conventions.

```bash
git clone git@github.com:blueprint-chart/blueprint-chart.git
cd blueprint-chart
make install
make dev          # editor at http://localhost:5555
make dev-docs     # these docs at http://localhost:4445
```

## Next steps

- [BPC DSL specification](/spec/dsl) — the full language reference.
- [Embedding charts](/guide/embed) — embed flows, CMS integrations, runtime details.
- [API reference](/api/) — every exported symbol from `@blueprint-chart/lib`.
