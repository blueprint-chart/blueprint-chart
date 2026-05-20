# Getting Started

Blueprint Chart is published as three packages on NPM. Pick the one that matches what you're building.

<table>
<thead><tr><th>Package</th><th>When to use it</th></tr></thead>
<tbody>
<tr><td nowrap><a href="https://www.npmjs.com/package/@blueprint-chart/lib"><code>@blueprint-chart/lib</code></a></td><td>Pure TypeScript chart engine — render charts from data + options or from a <code>.bpc</code> source. No Vue.</td></tr>
<tr><td nowrap><a href="https://www.npmjs.com/package/@blueprint-chart/ui"><code>@blueprint-chart/ui</code></a></td><td>Vue 3 component library — forms, panels, navigation, scene timeline, layout primitives.</td></tr>
<tr><td nowrap><a href="https://www.npmjs.com/package/@blueprint-chart/editor"><code>@blueprint-chart/editor</code></a></td><td>The full SPA — runs on top of <code>lib</code> + <code>ui</code>. Deployed at <a href="https://blueprintchart.com">blueprintchart.com</a>.</td></tr>
</tbody>
</table>

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
    title = "Bitcoin surged past $90,000 in 2024"
    description = "USD, year-end closing price"
    source = "CoinGecko"
    sourceUrl = "https://www.coingecko.com"
    colors = "#f7931a"
    lineSymbols = true
    lineSymbolShowOn = "all"
    lineSymbolShape = "diamond"
    verticalNumberFormat = ",.0f"
    tooltips = true

    annotation "2021" {
      text = "All-time high cycle"
      dy = -12
      showArrow = true
    }

    data {
      "2016" = 963
      "2017" = 13880
      "2018" = 3742
      "2019" = 7194
      "2020" = 28949
      "2021" = 46306
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

::: tip From the sample library
This is `packages/lib/src/samples/bitcoin-price.bpc` — a single-series line chart with a fixed-colour brand override (`colors = "#f7931a"`), diamond symbols on every datapoint, and a pinned annotation marking the 2021 peak.
:::

From here you wire the `data` and `options` into the renderer of your choice — `@blueprint-chart/lib` exposes the building blocks (`createFrame`, `createCanvas`, `renderLegend`, `renderHorizontalAxis`, `renderVerticalAxis`) plus a chart-type registry (`registerChart` / `getChart`). See [the API reference](/api/).

## Drop a chart into any page

If you don't need the programmatic API, use the bundled runtime. It picks up every `<script type="application/blueprint-chart">` tag and replaces it with a sandboxed iframe containing the rendered chart.

```html
<script src="https://unpkg.com/@blueprint-chart/lib/dist/runtime.iife.js"></script>

<script type="application/blueprint-chart">
  chart donut {
    title = "Coal still generates a third of the world's electricity"
    description = "Share by source, 2024"
    source = "IEA"
    sourceUrl = "https://iea.org"
    colors = "#76b7b2, #4e79a7, #59a14f, #f28e2b, #edc949, #e15759, #b07aa1"
    legendPosition = "right"
    tooltips = true
    displayAsPercentage = true

    data {
      "Coal" = 34.2
      "Natural Gas" = 22.1
      "Hydro" = 14.8
      "Nuclear" = 9.4
      "Wind" = 9.5
      "Solar" = 6.2
      "Other" = 3.8
    }
  }
</script>

<script>
  blueprintChart.initBlueprint()
</script>
```

::: tip From the sample library
This is `packages/lib/src/samples/energy-sources.bpc` — a donut chart with a hand-picked categorical palette, percentage display, and a right-anchored legend.
:::

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

## Try these samples

The lib ships ~40 ready-to-run `.bpc` files under `packages/lib/src/samples/`. They double as canonical examples and as integration-test fixtures. A handful worth opening first:

- `bitcoin-price.bpc` — single-series line with a brand colour, year-by-year diamond symbols, and an annotation on the 2021 peak.
- `co2-emissions-story.bpc` — a bar chart with three scenes, each highlighting a different country to walk a reader through the same data.
- `farm-compass.bpc` — a multi-scene narrative where later scenes swap the chart type (area → line → area-stacked) without rewriting the source.
- `browser-market.bpc` — a donut driven by the named `Heep` palette, with right-anchored legend and percentage display.
- `medal-count.bpc` — `bar-multi` with a gold / silver / bronze custom palette, sorted descending, top-anchored legend.
- `temperature-anomaly.bpc` — single-series line tuned for dark mode (`autoContrast = false`, `allowDarkMode = true`) with a curved annotation calling out the 2015 Paris Agreement.

## Next steps

- [BPC DSL specification](/spec/dsl) — the full language reference.
- [Embedding charts](/guide/embed) — embed flows, CMS integrations, runtime details.
- [API reference](/api/) — every exported symbol from `@blueprint-chart/lib`.
