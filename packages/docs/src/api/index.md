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

### Converters

`propertyMap` · `extractChartTypeOptions` · `dataEntriesToString` · `extractSceneOverrides` · `convertColorizes` · `convertHighlights` · `convertAreaFills` · `convertAnnotations` · `convertSeriesOverrides`

### AST node types

`ChartNode` · `DataNode` · `PropertyNode` · `SeriesNode` · `SceneNode` · `StepNode` · `TransformNode` · `ColorizeNode` · `HighlightNode` · `AreaFillNode` · `AnnotationNode` · `PointAnnotationNode` · `RangeAnnotationNode` · `FreeAnnotationNode` · `AnnotationVisibilityNode`

See [the DSL spec](/spec/dsl) for the corresponding source-level grammar.

## Samples

```ts
import { samples, type ChartSample } from '@blueprint-chart/lib'
```

`samples` is a curated set of BPC sources used by the editor's sample gallery. Each entry includes title, description, and source.

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

## Versioning

The lib follows semver:

- **Patch** — bug fixes, internal refactors, doc updates.
- **Minor** — additive API surface, backward-compatible grammar growth.
- **Major** — breaking changes (rare). The DSL grammar version tracks `MAJOR.MINOR` of the lib.

See [`RELEASING.md`](https://github.com/blueprint-chart/blueprint-chart/blob/main/RELEASING.md) for the release process.
