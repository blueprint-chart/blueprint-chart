# API Reference

Public surface of [`@blueprint-chart/lib`](https://www.npmjs.com/package/@blueprint-chart/lib). Every symbol on this page is exported from the package root.

::: info Source of truth
This page mirrors [`packages/lib/src/index.ts`](https://github.com/blueprint-chart/blueprint-chart/blob/main/packages/lib/src/index.ts). It will be progressively replaced by automatically-generated TypeDoc output; for now, treat the source file as canonical when a symbol is missing here.
:::

## Entrypoints

| Entrypoint | Purpose |
| --- | --- |
| `@blueprint-chart/lib` | The ESM API — types, parsing, rendering primitives, registry. |
| `@blueprint-chart/lib/dist/lib/lib.iife.js` | Standalone IIFE runtime that auto-renders `<script type="application/blueprint-chart">` tags. Exposed globally as `BlueprintChart`. |
| `@blueprint-chart/lib/charts.scss` | Base SCSS for chart styling — import once at the app level. |

## Enums

Authoritative list of enum exports (from `./enums`):

`ChartType` · `AxisDirection` · `ScaleType` · `GridStyle` · `LabelPosition` · `LabelRotation` · `TickPosition` · `FrameSizing` · `CompassDirection` · `AnnotationLineStyle` · `StrokeStyle` · `AnnotationKind` · `AnnotationAction` · `RangeAnchor` · `Orientation` · `SymbolShape` · `SymbolShowOn` · `SymbolStyle` · `SortDirection` · `SortMode` · `LegendPosition` · `Anchor` · `ValueLabelPosition` · `CrosshairDirection` · `CrosshairStyle` · `StackMode` · `LineStyle` · `ChartOptionType` · `DirectLabelMode` · `Interpolation` · `DslNodeType`

## Types

### Chart data and options

`ChartData` · `ChartOptions` · `ChartRenderer` · `ChartOptionDef` · `ChartTypeOptions` · `ChartTypeOptionKey` · `Margin`

### Visual configuration

`ColorizeConfig` · `HighlightConfig` · `AxisOptions` · `FrameOptions` · `AreaFillConfig` · `LineSymbolConfig` · `SeriesOverride`

### Annotations

`AnnotationConfig` · `PointAnnotationConfig` · `RangeAnnotationConfig` · `FreeAnnotationConfig` · `AnnotationLineConfig`

## Rendering primitives

```ts
import {
  createFrame,
  createCanvas,
  renderVerticalAxis,
  renderHorizontalAxis,
  renderLegend,
} from '@blueprint-chart/lib'
```

| Symbol | Purpose |
| --- | --- |
| `createFrame(options)` | Set up the chart's outer frame (title, description, source, axis labels, note). Returns `FrameElements`. |
| `createCanvas(options)` | Set up the inner drawing surface. Returns `CanvasElements`. |
| `renderVerticalAxis(...)` / `renderHorizontalAxis(...)` | Draw axes with grid lines, ticks, and labels. |
| `renderLegend(...)` | Draw a chart legend (position + interactivity). |

## Chart-type registry

```ts
import {
  registerChart,
  getChart,
  getChartOptions,
  listCharts,
} from '@blueprint-chart/lib'
```

Charts register themselves with the registry at import time. `getChart(type)` returns the renderer; `listCharts()` enumerates every registered type.

## Helpers

### Data and option helpers

`parseData` · `buildChartOptions` · `getChartTypeDefaults` · `resolveChartTypeOptions` · `resolveBarGapPadding` · `DEFAULT_BAR_GAP`

### Palettes

`resolvePalette` · `listPalettes` · type `PaletteEntry`

### Series

`resolveSeriesColor` · `resolveSeriesInterpolation` · `isSeriesHidden`

### Color and accessibility

`resolveBackgroundColor` · `adjustColorsForBackground` · `wcagContrastRatio` · `wcagLevel`

`getCvdFilterId` · `createCvdSvgFilter` · `simulateCvdColor` · `checkCvdColors` · types `CvdType` · `CvdIssue`

### Motion

`getTransitionDuration` · `snapshotForFadeOut` · `commitFadeOut` · `fadeIn` · `getCachedChart`

## DSL

### Parsing and serialization

```ts
import { parse, serialize, compactSerialize } from '@blueprint-chart/lib'
```

| Symbol | Behaviour |
| --- | --- |
| `parse(source)` | BPC text → AST. Throws on syntax errors. |
| `serialize(ast)` | AST → BPC text (formatted). |
| `compactSerialize(ast)` | AST → BPC text (whitespace-minimized). |

### Parse, modify, serialize

A typical pipeline reads a BPC source, mutates the AST in-place, then writes it back. Bundled samples make convenient inputs:

```ts
import { parse, serialize, samples } from '@blueprint-chart/lib'

// Pull the Bitcoin price sample shipped with the lib.
const bitcoin = samples.find(s => s.id === 'bitcoin-price')!

// Parse the verbatim BPC source into an AST.
const ast = parse(bitcoin.dsl)

// Mutate: retitle the chart and bump the latest data point.
const title = ast.properties.find(p => p.key === 'title')
if (title) {
  title.value = 'Bitcoin closed 2024 at a record high'
}

const latest = ast.data?.entries.find(e => e.key === '2024')
if (latest) {
  latest.value = 95000
}

// Serialize back to BPC text — round-trip safe.
const updated = serialize(ast)
console.log(updated)
```

The `parse → mutate → serialize` cycle is **round-trip safe**: re-parsing the output yields a structurally equal AST. Use `compactSerialize(ast)` instead of `serialize(ast)` when emitting BPC for embedding in HTML attributes or one-line URLs.

### Converters

`propertyMap` · `extractChartTypeOptions` · `dataEntriesToString` · `extractSceneOverrides` · `convertColorizes` · `convertHighlights` · `convertAreaFills` · `convertAnnotations` · `convertSeriesOverrides`

### AST node types

`ChartNode` · `DataNode` · `PropertyNode` · `SeriesNode` · `SceneNode` · `StepNode` · `TransformNode` · `ColorizeNode` · `HighlightNode` · `AreaFillNode` · `AnnotationNode` · `PointAnnotationNode` · `RangeAnnotationNode` · `FreeAnnotationNode` · `AnnotationVisibilityNode`

See [the DSL spec](/spec/dsl) for the corresponding source-level grammar.

## Samples

```ts
import { samples, type ChartSample } from '@blueprint-chart/lib'
```

`samples` is a curated set of BPC sources used by the editor's sample gallery. Each entry includes title, description, and source — the underlying `.bpc` files live in [`packages/lib/src/samples/`](https://github.com/blueprint-chart/blueprint-chart/tree/main/packages/lib/src/samples).

```ts
import { samples, parse } from '@blueprint-chart/lib'

// Discover everything bundled and filter by chart type.
const lineSamples = samples.filter(s => s.chartType === 'line')

// Each sample carries its raw BPC source on `.dsl`.
const ast = parse(lineSamples[0].dsl)
```

Each `ChartSample` exposes:

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Stable identifier matching the source filename (e.g. `bitcoin-price`). |
| `title` | `string` | The chart's `title` property, extracted at build time. |
| `description` | `string` | The chart's `description` property. |
| `chartType` | `string` | The DSL chart type (`line`, `bar-vertical`, `area-stacked`, …). |
| `tsvData` | `string` | Data block flattened to tab-separated values for paste-in flows. |
| `serializedData` | `string` | Data block re-emitted as BPC `data { … }` lines. |
| `dsl` | `string` | The verbatim `.bpc` source. |

## Runtime entrypoint

```ts
// Available only from the IIFE bundle (auto-initialized) or:
import { initBlueprint, createSceneController, createStepController } from '@blueprint-chart/lib/dist/runtime'
import type { SceneDefinition, SceneController, StepDefinition, StepController } from '@blueprint-chart/lib/dist/runtime'
```

| Symbol | Purpose |
| --- | --- |
| `initBlueprint()` | Find every `<script type="application/blueprint-chart">` on the page and replace it with a rendered chart iframe. |
| `createSceneController(...)` | Imperative API for stepping through a chart's scenes programmatically. |
| `createStepController(...)` | Lower-level step-based controller (aliased scene API). |

### End-to-end example

Drop a BPC source into the page inside a typed `<script>` tag, then call `initBlueprint()` once. Each script tag is replaced with a sandboxed iframe that renders the chart and posts back its measured height:

```html
<script type="application/blueprint-chart">
  chart line {
    title = "Bitcoin surged past $90,000 in 2024"
    description = "USD, year-end closing price"
    source = "CoinGecko"
    colors = "#f7931a"
    lineSymbols = true
    lineSymbolShape = "diamond"
    verticalNumberFormat = ",.0f"

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
</script>

<script type="module">
  import { initBlueprint } from '@blueprint-chart/lib/dist/runtime'
  initBlueprint()
</script>
```

::: info BPC source from `packages/lib/src/samples/bitcoin-price.bpc`
The IIFE bundle (`@blueprint-chart/lib/dist/lib/lib.iife.js`) calls `initBlueprint()` for you on `DOMContentLoaded`. Import the module form when you want to control timing or re-initialize after DOM updates.
:::

## Versioning

The lib follows semver:

- **Patch** — bug fixes, internal refactors, doc updates.
- **Minor** — additive API surface, backward-compatible grammar growth.
- **Major** — breaking changes (rare). The DSL grammar version tracks `MAJOR.MINOR` of the lib.

See [`RELEASING.md`](https://github.com/blueprint-chart/blueprint-chart/blob/main/RELEASING.md) for the release process.
