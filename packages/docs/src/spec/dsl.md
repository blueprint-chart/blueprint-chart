# BPC DSL — Language Specification

The Blueprint Chart format (`.bpc`) is a declarative text DSL for describing a chart and its scenes. It is parsed by a PEG grammar (Peggy) into an AST and converted at runtime into `ChartData` + `ChartOptions`.

The canonical grammar lives in [`packages/lib/src/dsl/grammar.peggy`](https://github.com/blueprint-chart/blueprint-chart/blob/main/packages/lib/src/dsl/grammar.peggy). This page is the human-readable specification.

::: tip Stability
The DSL is **round-trip safe**: `parse(source)` → `serialize(ast)` → `parse(...)` produces an equivalent AST. Backward-compatible grammar changes ship as minor releases; breaking changes will require a major bump.
:::

## A minimal example

```bpc
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
```

::: info From `packages/lib/src/samples/bitcoin-price.bpc`
A single-series line chart with a brand color, custom symbol shape, vertical-axis number format, and one point annotation — every feature appears in the same ~30-line block.
:::

## Top-level structure

A BPC document is exactly one `chart` block:

```bpc
chart <chartType> {
  <properties>
  <data block>
  <series>
  <colorize / highlight / areafill / annotation / range / note>
  <scenes>
  <transforms>
}
```

Where `<chartType>` is one of the registered chart-type identifiers (`line`, `bar-vertical`, `bar-horizontal`, `bar-grouped`, `bar-stacked`, `bar-multi`, `bar-split`, `column-stacked`, `area`, `area-stacked`, `line-multi`, `pie`, `donut`). The authoritative list is exported as `ChartType` from [`@blueprint-chart/lib`](/api/).

## Lexical grammar

### Identifiers

```
Identifier ← [a-zA-Z_#] [a-zA-Z0-9_#-]*
```

Used for chart-type names, property keys, and transform names.

### Strings

```
String ← '"' StringChar* '"'
```

Strings are double-quoted. Supported escapes: `\\`, `\"`, `\n`, `\t`, `\r`.

### Numbers

```
Number  ← '-'? Digit+ ('.' Digit+)?
Percent ← Number '%'
```

A trailing `%` marks the value as a percentage; the parser preserves `isPercentage: true` on the AST node so downstream code can distinguish `25` from `25%`.

### Comments

Line comments start with `//` and run to end-of-line. There are no block comments.

## Properties

Properties are simple key/value pairs:

```bpc
title = "Chrome dominates the desktop browser market"
displayAsPercentage = true
tooltips = true
lineSymbolShape = "diamond"
```

| Value kind | Example | Notes |
| --- | --- | --- |
| String | `"Chrome"` | Double-quoted. |
| Number | `42`, `3.14`, `-1.2` | Optional minus, optional decimal part. |
| Percentage | `35%` | Number suffixed with `%`. |
| Identifier | `true`, `false`, `right` | Used for enum-valued properties. |

Property keys may be identifiers (`title`) or strings (`"data-attribute"`).

The full set of recognized property keys per chart type is defined by `ChartTypeOptions` in `@blueprint-chart/lib` and listed in the [API reference](/api/).

## Data block

The `data` block carries the chart's primary values.

```bpc
data {
  "2022" = 16547
  "2023" = 42258
  "2024" = 93429
}
```

For multi-series data, comma-separated values map positionally to series. A leading `_series = "A","B",…` row labels each column:

```bpc
data {
  _series = "Gold","Silver","Bronze"
  "USA" = 40,44,42
  "China" = 38,32,18
  "Japan" = 27,14,17
  "Great Britain" = 22,21,22
  "Australia" = 17,7,22
  "France" = 16,20,23
}
```

::: info From `packages/lib/src/samples/medal-count.bpc`
A `bar-multi` chart driven by three positional columns. The `_series` row supplies legend labels; each subsequent row's comma-separated values map to those columns in order.
:::

A **tabular** form is also accepted — keys and values separated by a literal tab character — for pasting CSV-like input:

```bpc
data {
  "Jan"	16547
  "Feb"	17203
}
```

## Series

`series` blocks define per-series overrides — name, color, interpolation, visibility, etc.

```bpc
series "Renewables" {
  color = "#2ca02c"
  interpolation = "monotone"
}
```

::: tip
None of the bundled `packages/lib/src/samples/*.bpc` files currently exercise top-level `series` overrides — the samples lean on `_series` legends inside `data` plus `colors`, `colorPalette`, and `colorize` directives. The example above is illustrative; the grammar is exercised by parser tests.
:::

## Color directives

| Directive | Purpose |
| --- | --- |
| `colorize "<target>" { … }` | Apply a color rule to a target (axis label, value label, etc.). |
| `highlight "<target>" { … }` or `highlight "<target>"` | Emphasize a data point or series. The short form has no body. |
| `areafill "<from>" "<to>" { … }` | Fill the area between two series with a color (line / area charts). |

### `colorize`

```bpc
chart bar-vertical {
  title = "E is the most frequent letter in English"
  colorPalette = "London"
  sort = descending

  colorize "E" {
    color = "#e15759"
  }

  data {
    "E" = 12.70
    "T" = 9.06
    "A" = 8.17
    "O" = 7.51
  }
}
```

::: info From `packages/lib/src/samples/letter-frequency.bpc`
`colorize` paints a single category (`"E"`) in a contrasting color over the base palette, drawing the eye to the chart's lede.
:::

### `highlight`

The short form `highlight "<name>"` (no body) is the common case — useful inside `scene` blocks for emphasising one series at a time:

```bpc
scene "China spotlight" {
  title = "China emits more than the US and India combined"

  highlight "China"
}

scene "India rising" {
  title = "India surpassed the EU in 2023"

  highlight "India"
}

scene "Japan declining" {
  title = "Japan's emissions fell 20% from their peak"

  highlight "Japan"
}
```

::: info From `packages/lib/src/samples/co2-emissions-story.bpc`
Three scenes share the same data and successively highlight one country each — the canonical "guided tour" pattern.
:::

### `areafill`

```bpc
areafill "Lower bound" "Upper bound" {
  color = "#94a3b8"
  opacity = 0.2
}
```

::: tip
No bundled sample currently uses `areafill`. The grammar is documented and parser-tested; the example above is illustrative.
:::

## Annotations

Three kinds of annotation, sharing a body of properties (`text`, `dx`, `dy`, `showArrow`, …):

### Point annotation — anchored to a data key

```bpc
annotation "2021" {
  text = "All-time high cycle"
  dy = -12
  showArrow = true
}
```

::: info From `packages/lib/src/samples/bitcoin-price.bpc`
A minimal point annotation: the key matches a data label, `dy` nudges the text up, and an arrow draws back to the point.
:::

A richer point annotation with a connector line and curved leader:

```bpc
annotation "2015" {
  id = "2o3cx"
  text = "2015 Paris Agreement to limit global warming to 1.5°C "
  maxWidth = 224
  showLine = true
  lineStyle = curve-right
  showArrow = true
  showCircle = true
}
```

::: info From `packages/lib/src/samples/temperature-anomaly.bpc`
Demonstrates `showLine` + `lineStyle = curve-right` for a labelled callout that arcs from the data point to the text block, plus `maxWidth` for wrapping.
:::

### Range and free annotations

```bpc
range {                    # range: spans a domain/value window
  fromX = "2020"
  toX = "2022"
  text = "Pandemic rally"
}

note {                     # free: absolutely positioned
  text = "Methodology footnote"
  x = "10%"
  y = "90%"
}
```

::: tip
The bundled samples do not currently exercise `range` or `note` annotations — these are illustrative. The grammar is parser-tested and the AST node types (`RangeAnnotationNode`, `FreeAnnotationNode`) are exported.
:::

The full property surface for each annotation kind is documented in the `AnnotationConfig` / `PointAnnotationConfig` / `RangeAnnotationConfig` / `FreeAnnotationConfig` types exported by `@blueprint-chart/lib`.

## Scenes

A **scene** is a named visualisation state — the same chart with different data, styling, or annotations. Multiple scenes compose into a **story** that users can step through.

A simple "highlight tour" — each scene swaps the title and emphasises one bar:

```bpc
scene "China spotlight" {
  title = "China emits more than the US and India combined"

  highlight "China"
}

scene "India rising" {
  title = "India surpassed the EU in 2023"

  highlight "India"
}

scene "Japan declining" {
  title = "Japan's emissions fell 20% from their peak"

  highlight "Japan"
}
```

::: info From `packages/lib/src/samples/co2-emissions-story.bpc`
Three scenes on a `bar-horizontal` chart. Each scene inherits the chart's data and styling, and only overrides what changes — `title` plus a `highlight` target.
:::

Scenes can also override the chart's **type** and **data** wholesale, switching from one visualisation to another mid-story:

```bpc
scene "Bulgarian farms grew" {
  title = "Average farm size in Bulgaria quadrupled"
  description = "Average farm size in hectares"
  type = line

  data {
    "2005" = 5
    "2007" = 6
    "2010" = 12
    "2013" = 18
  }
}

scene "Cash crops replaced vegetables" {
  title = "Cash crops replaced vegetables in Bulgaria"
  description = "Production of Bulgarian farms, million euros"
  type = area-stacked

  data {
    _series = "Vegetables","Cash crops","Other production"
    "2000" = 464,615,1854
    "2008" = 541,2045,1563
    "2015" = 144,2986,785
  }

  highlight "Cash crops"
}
```

::: info From `packages/lib/src/samples/farm-compass.bpc`
A "story" can transition between chart types — here from a stacked area to a single-series line, then to a different stacked area — by setting `type` and supplying fresh `data` inside the scene.
:::

Scenes accept the same member set as the top-level chart, **plus** annotation-visibility verbs:

| Verb | Effect |
| --- | --- |
| `hide_annotation "<id>"` | Hide a point annotation set on the chart. |
| `hide_range "<id>"` | Hide a range annotation. |
| `hide_note "<id>"` | Hide a free / note annotation. |
| `show_annotation "<id>"` / `show_range "<id>"` / `show_note "<id>"` | Re-show one previously hidden by an earlier scene. |

`step` is accepted as an alias for `scene`.

## Transforms

Transforms describe data-pipeline operations applied before rendering.

```bpc
transform sort {
  column = "value"
  direction = descending
}
```

::: info From `packages/lib/src/samples/coffee-production.bpc`
A `sort` transform reorders the data by the `value` column in descending order. The chart's `sort = descending` property is equivalent for simple cases; the `transform` form composes with other pipeline steps.
:::

Transforms compose — each `transform <name> { … }` block is applied in source order. The grammar accepts any identifier in the `<name>` slot; the set of registered transform types is part of `@blueprint-chart/lib`'s public surface; see the API reference.

## Working with the AST

```ts
import { parse, serialize, compactSerialize } from '@blueprint-chart/lib'

const ast = parse(source)        // BPC text → AST
const text = serialize(ast)      // AST → BPC text (pretty)
const tight = compactSerialize(ast) // AST → BPC text (compact)
```

Round-trip identity is guaranteed for any value the grammar accepts — `parse(serialize(parse(x)))` is structurally equal to `parse(x)`. This invariant is enforced by the test suite.

## Stability and versioning

- `parse` errors throw `SyntaxError` with a 1-indexed `location` (line / column) for tooling.
- Unknown property keys are preserved on the AST; renderers may ignore them.
- Unknown top-level statements are a parse error — by design.
- The grammar version tracks the lib's `MAJOR.MINOR`; patch releases never change the language.

## See it in action

Every snippet on this page is taken verbatim from a runnable sample in `packages/lib/src/samples/`. The corresponding chart-type pages document the option surface and render live previews:

| Feature shown | Sample file | Chart-type page |
| --- | --- | --- |
| Minimal example, point annotation | `bitcoin-price.bpc` | [Line chart](/charts/line) |
| Multi-series data, `_series` row | `medal-count.bpc` | [Bar multi](/charts/bar-multi) |
| `colorize` single category | `letter-frequency.bpc` | [Bar vertical](/charts/bar-vertical) |
| Curved-leader annotation | `temperature-anomaly.bpc` | [Line chart](/charts/line) |
| Scene-by-scene `highlight` tour | `co2-emissions-story.bpc` | [Bar horizontal](/charts/bar-horizontal) |
| Scenes overriding chart `type` | `farm-compass.bpc` | [Area stacked](/charts/area-stacked) |
| `transform sort` | `coffee-production.bpc` | [Bar vertical](/charts/bar-vertical) |
