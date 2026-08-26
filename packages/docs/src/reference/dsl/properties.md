# DSL — Properties & data

Value-bearing constructs in a `.bpc` document: key/value properties on the chart, the `data` block carrying values, and `series` overrides for per-series visual control. See [DSL overview](/reference/dsl/) for the top-level chart-block structure.

## Properties

Properties are simple key/value pairs:

```bpc
title = "Chrome dominates the desktop browser market"
tooltips = true
lineSymbolSize = 4
lineSymbolShape = "diamond"
```

| Value kind | Example | Notes |
| --- | --- | --- |
| String | `"Chrome"` | Double-quoted. |
| Number | `42`, `3.14`, `-1.2`, `.5`, `2.5e-4` | Optional minus, optional decimal (leading-dot allowed), optional `e`/`E` exponent. |
| Percentage | `35%` | Number suffixed with `%`. |
| Identifier | `true`, `false`, `right` | Used for enum-valued properties. |

Property keys may be identifiers (`title`) or strings (`"data-attribute"`).

The full set of recognized property keys per chart type is defined by `ChartTypeOptions` in `@blueprint-chart/lib` and listed in the [API reference](/reference/api/).

## Data block

The `data` block carries the chart's primary values.

```bpc
data {
  "2022" = 16547
  "2023" = 42258
  "2024" = 93429
}
```

Numbers may group their digits with spaces, which is how most locales outside the US write them. Quote the value so the space does not end the number. Any space character works, including the no-break spaces a spreadsheet copy-paste leaves behind:

```bpc
data {
  "2024" = "1 559 275"
}
```

A `.` is always the decimal separator, so a grouping space is never ambiguous. A comma is neither: it separates multi-series values (below), so write `1234.5`, not `1,234.5`.

For multi-series data, comma-separated values map positionally to series. A leading `series = "A","B",…` row labels each column. The unquoted key `series` inside a `data` block is reserved for this meta-row; quote your labels (`"series" = …`) if you ever need a real data row by that name:

```bpc
data {
  series = "Gold","Silver","Bronze"
  "USA" = 40,44,42
  "China" = 38,32,18
  "Japan" = 27,14,17
  "Great Britain" = 22,21,22
  "Australia" = 17,7,22
  "France" = 16,20,23
}
```

::: info From `packages/lib/src/samples/medal-count.bpc`
A `bar-multi` chart driven by three positional columns. The `series` meta-row supplies legend labels; each subsequent row's comma-separated values map to those columns in order.
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
  interpolation = "monotoneX"
}
```

::: tip
None of the bundled `packages/lib/src/samples/*.bpc` files currently exercise top-level `series` overrides. The samples lean on the `series` meta-row inside `data` plus `colors`, `colorPalette`, and `colorize` directives. The example above is illustrative; the grammar is exercised by parser tests.
:::
