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

Where `<chartType>` is one of the registered chart-type identifiers (`line`, `bar-vertical`, `bar-horizontal`, `bar-grouped`, `bar-stacked`, `bar-multi`, `bar-split`, `column-stacked`, `area`, `area-stacked`, `line-multi`, `pie`, `donut`). The authoritative list is exported as `ChartType` from [`@blueprint-chart/lib`](/reference/api/).

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

## Next

The rest of the DSL specification is split across three chapter pages:

- [Properties & data](/reference/dsl/properties) — value-bearing constructs.
- [Color directives & annotations](/reference/dsl/annotations) — `colorize`, `highlight`, `areafill`, and the three annotation kinds.
- [Scenes & transforms](/reference/dsl/scenes-and-transforms) — story-level constructs and data-pipeline operations.
