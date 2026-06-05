# Embedding Charts

Blueprint Chart is **static-first**: every chart is a self-contained artifact independent of any vendor server. There are three ways to put one on a page, and they all run entirely in the browser.

::: tip Data sovereignty
Charts render in-page (or in a sandboxed `srcdoc` iframe). Data never leaves the visitor's browser by default — no backend call, no analytics ping, no third-party SaaS. This is a structural property, not a marketing claim.
:::

## Option 1 — Drop in a `<script>` tag

The simplest path. Load the standalone runtime once per page, then add one `<script type="application/blueprint-chart">` per chart.

```html
<script src="https://unpkg.com/@blueprint-chart/lib/dist/lib/lib.iife.js"></script>

<script type="application/blueprint-chart">
  chart line-multi {
    title = "Wind and solar are catching up to hydroelectric power"
    description = "Share of electricity generation by source (%)"
    source = "IEA"
    sourceUrl = "https://iea.org"
    colors = "#59a14f, #edc949, #4e79a7"
    legend = false
    lineSymbols = true
    lineSymbolShowOn = "last"
    tooltips = true

    data {
      series = "Hydro","Wind","Solar"
      "2010" = 16.0,1.6,0.3
      "2012" = 16.2,2.4,0.6
      "2014" = 16.3,3.3,1.1
      "2016" = 16.4,4.0,1.5
      "2018" = 15.8,4.8,2.4
      "2020" = 16.8,6.2,3.7
      "2022" = 15.0,7.8,4.5
      "2024" = 14.8,9.5,6.2
    }
  }
</script>
```

::: tip Inline example
A multi-series line with explicit per-series colours and a single trailing symbol on the last datapoint of each series. Pasted verbatim into a page, it renders to a self-contained iframe with no extra wiring.
:::

The runtime auto-runs on `DOMContentLoaded`, finds every chart script tag, and replaces it with a sandboxed iframe (`sandbox="allow-scripts"`) sized via `postMessage` to match the rendered chart.

### Re-running after a dynamic insert

If you insert chart scripts after page load (SPA navigation, late-injected content) call the runtime explicitly:

```html
<script>
  // Available globally as `BlueprintChart` when loaded via the IIFE bundle.
  BlueprintChart.initBlueprint()
</script>
```

## Option 2 — Embed export from the editor

The hosted editor at [blueprintchart.com](https://blueprintchart.com) ships an **Embed** export tab that produces a ready-to-paste snippet — runtime script tag + the chart source — that you can drop directly into any HTML page, CMS rich-text block, or newsletter template.

Choose **Embed** in the export panel and copy the snippet. Nothing else needs to be installed on the host page.

## Option 3 — Programmatic ESM API

For full control — server-side rendering, custom render passes, or wiring into your own component framework — use the ESM API directly.

```ts
import {
  parse,
  buildChartOptions,
  parseData,
  registerChart,
  getChart,
} from '@blueprint-chart/lib'

const ast = parse(source)            // BPC text → AST
const data = parseData(ast)          // AST → ChartData
const options = buildChartOptions(ast) // AST → ChartOptions

const renderer = getChart(ast.chartType) // → ChartRenderer
renderer.render({ data, options, container })
```

See the [API reference](/reference/api/) for the full surface area, including frame/canvas/legend primitives and the chart-type registry.

## Static-site integrations

Each integration is a thin wrapper around the runtime script tag. Current status:

| Generator | Status | Notes |
| --- | --- | --- |
| Plain HTML | ✅ Ships in `lib` | The `<script>` pattern above. |
| Hugo       | ⏳ Planned | Phase 2 GTM deliverable. Shortcode wrapping the runtime. |
| Astro      | ⏳ Planned | `<BlueprintChart>` Astro component. |
| Eleventy   | ⏳ Planned | Shortcode + plugin. |
| Next.js    | ⏳ Planned | React component wrapping the runtime in `useEffect`. |

If you need one of these now, the pattern is small enough to write inline: load the IIFE bundle once, then render a `<script type="application/blueprint-chart">` with the chart source in the body of your template.

## Self-hosting the runtime

The `unpkg.com` URL is convenient for prototyping; for production embeds, host the bundle yourself to avoid the third-party request and to pin a known version.

```bash
# Copy the IIFE bundle into your site's static assets directory
cp node_modules/@blueprint-chart/lib/dist/lib/lib.iife.js public/vendor/
```

```html
<script src="/vendor/lib.iife.js"></script>
```

## Real-world embeds

Two end-to-end examples drawn straight from the lib's sample library — paste either snippet into an HTML page that already loads `lib.iife.js` and the runtime does the rest.

### Donut: share of energy by source

```html
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
```

::: tip Inline example
A donut chart with an explicit categorical palette, right-anchored legend, and percentage display.
:::

### Line: a single-series time series with an annotation

```html
<script type="application/blueprint-chart">
  chart line {
    title = "US inflation peaked at 9.1% before retreating to near 3%"
    description = "Consumer Price Index, year-over-year change (%)"
    source = "Bureau of Labor Statistics"
    sourceUrl = "https://bls.gov/cpi/"
    colors = "#f28e2b"
    lineSymbols = true
    lineSymbolShape = "circle"
    lineSymbolShowOn = "all"
    verticalNumberFormat = ".1f"
    tooltips = true

    annotation "Jun 2022" {
      text = "Peak: 9.1%"
      dy = -12
      showArrow = true
    }

    data {
      "Jan 2021" = 1.4
      "Jun 2021" = 5.4
      "Jan 2022" = 7.5
      "Jun 2022" = 9.1
      "Jan 2023" = 6.4
      "Jun 2023" = 3.0
      "Jan 2024" = 3.1
      "Jun 2024" = 3.0
      "Jan 2025" = 3.0
    }
  }
</script>
```

::: tip Inline example
A single-series line with circular symbols on every datapoint, a pinned annotation on the peak, and a one-decimal vertical number format.
:::

## Security model

- The chart iframe uses `sandbox="allow-scripts"` only — no same-origin, no top-navigation, no forms.
- The chart source is inserted via `srcdoc` after HTML-entity escaping.
- The runtime does no network requests for rendering. All chart logic runs locally.
- The parent page communicates with the iframe only via a single `postMessage` channel used to resize the iframe to fit content.

## Troubleshooting

**The chart doesn't appear.**
Check the browser console for parse errors. The runtime keeps the original DSL visible inside a `.blueprint-chart-placeholder` div if rendering fails, so the source remains diff-able.

**The iframe height doesn't match the chart.**
The runtime listens for `blueprint-chart-resize` messages and resizes accordingly. A Content Security Policy that blocks inline scripts inside iframes will break this — the `srcdoc` iframe needs `script-src 'unsafe-inline'` or a matching `'sha256-…'` directive.

**My CMS strips `<script>` tags.**
Use the editor's standalone HTML export instead and host it as a static asset.
