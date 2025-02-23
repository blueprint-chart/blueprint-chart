# @blueprint-chart/lib

Core library for Blueprint Chart — a DSL-driven charting engine built on D3.

## DSL Grammar

The chart DSL is defined by a PEG grammar in `src/dsl/grammar.peggy` and compiled to `src/dsl/grammar.js` using [Peggy](https://peggyjs.org/).

### EBNF Overview

```
Chart       = "chart" Identifier "{" ChartMember* "}"
ChartMember = DataBlock | Highlight | AreaFill | Annotation | Series | Step | Property

DataBlock   = "data" "{" Property* "}"
Highlight   = "highlight" String "{" Property* "}"
AreaFill    = "areafill" String String "{" Property* "}"
Annotation  = "annotation" String "{" Property* "}"
Series      = "series" String "{" Property* "}"
Step        = "step" String "{" StepMember* "}"
StepMember  = DataBlock | Highlight | AreaFill | Annotation | Property

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

  highlight "North America" {
    color = "#e53e3e"
    label = "Leader"
  }

  step "Focus" {
    sort = ascending
    highlight "Asia" {
      color = "#38a169"
    }
  }
}
```

## AST Node Types

| Node | Fields |
|------|--------|
| `ChartNode` | `chartType`, `properties`, `data`, `highlights`, `areaFills`, `annotations`, `series`, `steps` |
| `PropertyNode` | `key`, `value`, `isPercentage` |
| `DataNode` | `entries` (PropertyNode[]) |
| `HighlightNode` | `target`, `properties` |
| `AreaFillNode` | `from`, `to`, `properties` |
| `AnnotationNode` | `target`, `properties` |
| `SeriesNode` | `name`, `properties` |
| `StepNode` | `name`, `properties`, `data`, `highlights`, `areaFills`, `annotations` |

## Regenerating the Parser

The generated parser (`src/dsl/grammar.js`) is checked into git so downstream packages can import lib source directly without a build step.

To regenerate after editing `grammar.peggy`:

```sh
pnpm --filter @blueprint-chart/lib run generate:parser
```

This also runs automatically before `build` and `test` via `prebuild`/`pretest` hooks.

## Color Palettes

The built-in color palettes are curated from [pypalettes](https://github.com/y-sunflower/pypalettes) by Joseph Music, a collection of 2700+ color palettes for data visualization. Licensed under MIT.
