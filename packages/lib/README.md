# @blueprint-chart/lib

Core library for Blueprint Chart — a DSL-driven charting engine built on D3.

## Install

```bash
npm install @blueprint-chart/lib
```

## Quick start

The simplest way to render a chart is the IIFE runtime, which auto-scans the document for embedded chart definitions and renders each one inline (inside a sandboxed iframe inserted before the script tag):

```html
<script src="https://unpkg.com/@blueprint-chart/lib/dist/lib/lib.iife.js"></script>

<script type="application/blueprint-chart">
  chart MyChart {
    data { values = "[[0,1],[1,4],[2,2]]" }
    series "line" { color = "steelblue" }
  }
</script>
```

For programmatic use in an ES module project, the lib exposes the underlying primitives: `parse` (DSL → AST), `buildChartOptions` (AST → render options), `createFrame`/`createCanvas`, and the chart registry (`registerChart`, `getChart`). See [src/index.ts](https://github.com/blueprint-chart/blueprint-chart/blob/main/packages/lib/src/index.ts) for the full public API.

## DSL Grammar

The chart DSL is defined by a PEG grammar in `src/dsl/grammar.peggy` and compiled to `src/dsl/grammar.js` using [Peggy](https://peggyjs.org/).

### EBNF Overview

```
Chart       = "chart" Identifier "{" ChartMember* "}"
ChartMember = DataBlock | Colorize | AreaFill | Annotation | Series | Scene | Property

DataBlock   = "data" "{" Property* "}"
Colorize    = "colorize" String "{" Property* "}"
AreaFill    = "areafill" String String "{" Property* "}"
Annotation  = "annotation" String "{" Property* "}"
Series      = "series" String "{" Property* "}"
Scene       = "scene" String "{" SceneMember* "}"
SceneMember = DataBlock | Colorize | AreaFill | Annotation | Property

Property    = PropertyKey "=" PropertyValue
PropertyKey = String | Identifier
PropertyValue = Number "%" | Number | String | Identifier

Identifier  = [a-zA-Z_#][a-zA-Z0-9_#-]*
Number      = [0-9]+("."[0-9]+)?
String      = '"' (EscapeSequence | [^"\\])* '"'
```

### Example

```
chart horizontal-bar {
  title = "Revenue by Region"
  sort = descending

  data {
    "North America" = 75%
    "Europe" = 53.85%
    "Asia" = 44%
  }

  colorize "North America" {
    color = "#e53e3e"
    label = "Leader"
  }

  scene "Focus" {
    sort = ascending
    colorize "Asia" {
      color = "#38a169"
    }
  }
}
```

## AST Node Types

| Node | Fields |
|------|--------|
| `ChartNode` | `chartType`, `properties`, `data`, `colorizes`, `areaFills`, `annotations`, `series`, `scenes` |
| `PropertyNode` | `key`, `value`, `isPercentage` |
| `DataNode` | `entries` (PropertyNode[]) |
| `ColorizeNode` | `target`, `properties` |
| `AreaFillNode` | `from`, `to`, `properties` |
| `AnnotationNode` | `target`, `properties` |
| `SeriesNode` | `name`, `properties` |
| `SceneNode` | `name`, `properties`, `data`, `colorizes`, `areaFills`, `annotations` |

## Regenerating the Parser

The generated parser (`src/dsl/grammar.js`) is checked into git so downstream packages can import lib source directly without a build step.

To regenerate after editing `grammar.peggy`:

```sh
pnpm --filter @blueprint-chart/lib run generate:parser
```

This also runs automatically before `build` and `test` via `prebuild`/`pretest` hooks.

## Color Palettes

The built-in color palettes are curated from [pypalettes](https://github.com/y-sunflower/pypalettes) by Joseph Music, a collection of 2700+ color palettes for data visualization. Licensed under MIT.
