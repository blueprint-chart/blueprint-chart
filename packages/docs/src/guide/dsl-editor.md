---
title: DSL Editor
---

# DSL Editor

> The BPC source editor — CodeMirror 6, a Lezer-generated grammar, syntax highlighting tuned for prose-shaped charts, and two-way sync with the visual panels.

## Why this matters

Blueprint Chart is text-first. Every chart in the editor has a `.bpc` source under the hood, and any change you make through the visual panels — picking a palette, dragging an annotation, reordering scenes — is reflected back in that source. The DSL editor is the surface where authors who prefer code can stay in code, and the surface where a journalist swapping numbers can do it without ever opening a panel. CodeMirror 6 powers the editor; a separate Lezer grammar drives the syntax highlighting.

## Quickstart

Type `.bpc` directly in the editor's left pane. The right pane re-renders on every parse-clean keystroke:

```bpc
chart line {
  title = "2024 was the hottest year on record"
  description = "Deviation from the 1951–1980 average, in °C"
  source = "NASA GISS"
  sourceUrl = "https://data.giss.nasa.gov/gistemp/"
  colors = "#e15759"
  autoContrast = false
  allowDarkMode = true
  interpolation = "monotoneX"
  lineSymbols = true
  lineSymbolShape = "circle"
  lineSymbolShowOn = "firstLast"

  data {
    "1980" = 0.26
    "1985" = 0.12
    "1990" = 0.45
    "1995" = 0.45
    "2000" = 0.42
    "2005" = 0.68
    "2010" = 0.72
    "2015" = 0.9
    "2020" = 1.02
    "2024" = 1.29
  }

  annotation "2015" {
    id = "2o3cx"
    text = "2015 Paris Agreement to limit global warming to 1.5°C "
    maxWidth = 224
    showLine = true
    lineStyle = curve-right
    showArrow = true
    showCircle = true
  }
}
```

::: tip From the sample library
This is `packages/lib/src/samples/temperature-anomaly.bpc` — a good stress test for the highlighter because it mixes every common token class: keywords (`chart`, `data`, `annotation`), identifiers (`autoContrast`, `lineSymbolShape`), strings, numbers, enum values (`monotoneX`, `firstLast`, `curve-right`), and booleans. The fold ranges align with each top-level block.
:::

The editor highlights both comment forms: line comments (`//`, to end-of-line) and block comments (`/* … */`, which may span multiple lines).

## How it works

The editor runs **two parsers** for the same DSL surface, and the trade-off is deliberate:

| Parser | Package | Job | Generation |
| --- | --- | --- | --- |
| Peggy | `@blueprint-chart/lib` | AST for chart computation at runtime — full semantics. | `make build-parser` |
| Lezer | `@blueprint-chart/editor` | Incremental parse tree for syntax highlighting. | `pnpm --filter @blueprint-chart/editor build:parser` |

Both grammars describe the same language. The Peggy one is the source of truth for correctness (parses, validates, round-trips); the Lezer one is built for fast incremental re-parse on every keystroke so the editor never blocks.

The CodeMirror 6 stack pulls in `@codemirror/view`, `@codemirror/state`, `@codemirror/language`, and `@lezer/highlight`. The DSL language module lives at `packages/editor/src/dsl-lang/` and exposes three entry points:

- `bpcLanguage()` — returns a CodeMirror `LanguageSupport` you install on the editor instance.
- `bpcHighlighter` — a `syntaxHighlighting` extension pre-wired to the class-based highlighter.
- `highlightDsl(code)` — one-shot server-style highlight, used by read-only previews; returns HTML.

The Lezer parser tags DSL keywords (`chart`, `data`, `colorize`, `highlight`, `area-fill`, `annotation`, `range`, `note`, `series`, `scene`, `transform`) and lexical tokens (`Identifier`, `String`, `Number`, `Percentage`, `Equals`, `LineComment`, braces). Each tag maps to a token class in `packages/editor/src/dsl-lang/highlight.scss`, with separate light- and dark-mode rules driven by the `--bc-syn-*` CSS custom properties.

## Two-way sync between DSL and panels

The editor keeps the DSL text and the visual panels in lockstep through two composables:

- **`useDslSync`** — DSL → config and config → DSL. On every keystroke, a debounced parse runs; on success, the resulting AST is diffed against the `chartConfig` store and applied. The reverse direction kicks in when a user edits via a panel: the chart state is serialised back to DSL and pushed into the editor with a cursor-preserving patch.
- **`useDslOutput`** — formats the current chart state into its canonical DSL string. This is what the "Copy as DSL" button and the export panel consume.

Because the grammar round-trips cleanly (`parse(serialize(parse(x)))` is structurally equal to `parse(x)`), the sync loop is stable — a panel-driven change does not surprise the user with reformatted whitespace, and a DSL-driven change does not lose unknown property keys.

## Recipes

### Embed the BPC language in your own CodeMirror editor

`bpcLanguage()` and `bpcHighlighter` are plain CodeMirror 6 extensions — they fit into any consumer that already builds a CodeMirror view:

```ts
import { EditorView, basicSetup } from 'codemirror'
import { bpcLanguage, bpcHighlighter } from '@/dsl-lang'

const view = new EditorView({
  doc: '',
  extensions: [
    basicSetup,
    bpcLanguage(),
    bpcHighlighter,
  ],
  parent: document.querySelector('#editor')!,
})
```

### Highlight a read-only DSL block

For a docs page, a "view source" tab, or a tooltip preview, `highlightDsl(code)` returns ready-to-inject HTML:

```ts
import { highlightDsl } from '@/dsl-lang'

const html = highlightDsl(`chart line-multi {
  title = "Germany stagnated while the US and China bounced back"
  description = "Annual percentage change in real GDP"
  source = "IMF World Economic Outlook"
  colorPalette = "SolLeWitt"
  legend = false
  tooltips = true

  annotation "2020" {
    text = "COVID-19 recession"
    textOffsetY = -10
    showArrow = true
  }

  data {
    series = "United States","China","Germany"
    "2018" = 2.9,6.7,1.0
    "2020" = -2.8,2.2,-3.7
    "2024" = 2.8,5.0,-0.2
  }
}`)

document.querySelector('#preview')!.innerHTML = html
```

::: tip Inline example
The DSL string is an abbreviated GDP series (the 2018, 2020, and 2024 rows). Good stress-case for the highlighter — multi-series data, palette name, a negative number, an annotation block.
:::

This skips the editor surface entirely and is the right tool when the user shouldn't be able to type.

### Parse the editor's content programmatically

To act on the DSL outside the editor — validate, transform, or feed it to a renderer — pair `bpcLanguage()` with the lib's `parse()`:

```ts
import { parse } from '@blueprint-chart/lib'

try {
  const ast = parse(view.state.doc.toString())
  // ast.chartType, ast.properties, ast.data, ast.scenes …
} catch (err) {
  // SyntaxError with 1-indexed location { line, column }
}
```

Errors are `SyntaxError` instances with a 1-indexed `location` field. CodeMirror's `lintGutter` extension is the natural place to surface them.

### Read the Lezer tree directly

Autocomplete is not exposed by default, but the Lezer parse tree is available if you want to write a completion source, a custom folding range provider, or any other syntax-driven feature:

```ts
import { syntaxTree } from '@codemirror/language'

const tree = syntaxTree(view.state)
tree.iterate({
  enter(node) {
    if (node.name === 'Property') {
      // … node.from / node.to give you the document range
    }
  },
})
```

## Files in the package

The DSL language module ships inside `@blueprint-chart/editor`:

- `packages/editor/src/dsl-lang/bpc.grammar` — Lezer grammar source.
- `packages/editor/src/dsl-lang/bpc-parser.js` — generated Lezer parser (committed to the repo).
- `packages/editor/src/dsl-lang/build.mjs` — grammar build script.
- `packages/editor/src/dsl-lang/index.ts` — exports `bpcLanguage()`, `bpcHighlighter`, `highlightDsl()`.
- `packages/editor/src/dsl-lang/highlight.scss` — token-class colour definitions, driven by `--bc-syn-*` CSS variables.

## API surface

The DSL editor entry points live in `@blueprint-chart/editor`, not in `@blueprint-chart/lib`. From the lib side, the parsing surface is:

| Symbol (from `@blueprint-chart/lib`) | One-liner |
| --- | --- |
| `parse(source)` | BPC text → AST. Throws `SyntaxError` with `location`. |
| `serialize(ast)` | AST → BPC text (pretty-printed). |
| `compactSerialize(ast)` | AST → BPC text (whitespace-minimised). |
| `propertyMap` | Catalogue of recognised property keys per chart type. |
| `ChartNode`, `PropertyNode`, `DataNode`, … | AST node types — see [the API reference](/reference/api/#dsl). |

From the editor side:

| Symbol (from the editor's `@/dsl-lang`) | One-liner |
| --- | --- |
| `bpcLanguage()` | CodeMirror `LanguageSupport` for `.bpc`. |
| `bpcHighlighter` | `syntaxHighlighting` extension. |
| `highlightDsl(code)` | One-shot HTML highlight for read-only previews. |

## See also

- [BPC DSL specification](/reference/dsl/) — the canonical language reference.
- [Scenes guide](/guide/scenes) — scene syntax inside the DSL.
- [Data transforms guide](/guide/data-transforms) — transforms inside the DSL.
- [API reference](/reference/api/#dsl) for the lib's `parse` / `serialize` / converter helpers.
