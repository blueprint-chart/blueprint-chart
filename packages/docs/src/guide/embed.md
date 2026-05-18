# Embedding Charts

Blueprint Chart is **static-first**: every chart is a self-contained artifact independent of any vendor server. There are three ways to put one on a page, and they all run entirely in the browser.

::: tip Data sovereignty
Charts render in-page (or in a sandboxed `srcdoc` iframe). Data never leaves the visitor's browser by default — no backend call, no analytics ping, no third-party SaaS. This is a structural property, not a marketing claim.
:::

## Option 1 — Drop in a `<script>` tag

The simplest path. Load the standalone runtime once per page, then add one `<script type="application/blueprint-chart">` per chart.

```html{1,3-12}
<script src="https://unpkg.com/@blueprint-chart/lib/dist/lib/lib.iife.js"></script>

<script type="application/blueprint-chart">
  chart bar-vertical {
    title = "Renewables overtook coal in 2024"
    description = "Global electricity mix, %"

    data {
      "Coal"        = 21
      "Gas"         = 30
      "Renewables"  = 35
      "Nuclear"     = 14
    }
  }
</script>
```

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

See the [API reference](/api/) for the full surface area, including frame/canvas/legend primitives and the chart-type registry.

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
