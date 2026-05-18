# BPC DSL — Language Specification

The Blueprint Chart format (`.bpc`) is a declarative text DSL for describing a chart and its scenes. It is parsed by a PEG grammar (Peggy) into an AST and converted at runtime into `ChartData` + `ChartOptions`.

The canonical grammar lives in [`packages/lib/src/dsl/grammar.peggy`](https://github.com/blueprint-chart/blueprint-chart/blob/main/packages/lib/src/dsl/grammar.peggy). This page is the human-readable specification.

::: tip Stability
The DSL is **round-trip safe**: `parse(source)` → `serialize(ast)` → `parse(...)` produces an equivalent AST. Backward-compatible grammar changes ship as minor releases; breaking changes will require a major bump.
:::

## A minimal example

```bpc
chart line {
  title = "Bitcoin year-end closing price"
  description = "USD"
  source = "CoinGecko"
  colors = "#f7931a"

  data {
    "2022" = 16547
    "2023" = 42258
    "2024" = 93429
  }
}
```

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

For multi-series data, comma-separated values map positionally to series:

```bpc
data {
  "Jan" = 10, 20, 30
  "Feb" = 15, 25, 35
}
```

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

## Color directives

| Directive | Purpose |
| --- | --- |
| `colorize "<target>" { … }` | Apply a color rule to a target (axis label, value label, etc.). |
| `highlight "<target>" { … }` or `highlight "<target>"` | Emphasize a data point or series. The short form has no body. |
| `areafill "<from>" "<to>" { … }` | Fill the area between two series with a color (line / area charts). |

## Annotations

Three kinds of annotation, sharing a body of properties (`text`, `dx`, `dy`, `showArrow`, …):

```bpc
annotation "2021" {        # point: anchored to data
  text = "All-time high cycle"
  dy = -12
  showArrow = true
}

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

The full property surface for each annotation kind is documented in the `AnnotationConfig` / `PointAnnotationConfig` / `RangeAnnotationConfig` / `FreeAnnotationConfig` types exported by `@blueprint-chart/lib`.

## Scenes

A **scene** is a named visualisation state — the same chart with different data, styling, or annotations. Multiple scenes compose into a **story** that users can step through.

```bpc
chart line {
  title = "Population over time"
  data { "1950" = 2.5  "2000" = 6.1  "2050" = 9.7 }

  scene "Highlight 2000" {
    highlight "2000"
    annotation "2000" {
      text = "Median estimate"
      dy = -16
    }
  }

  scene "Override colors" {
    colorize "*" { color = "#cc0066" }
  }
}
```

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
transform filter {
  column = "country"
  value  = "France"
}

transform aggregate {
  by  = "year"
  agg = "sum"
}
```

The set of registered transform types is part of `@blueprint-chart/lib`'s public surface; see the API reference.

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
