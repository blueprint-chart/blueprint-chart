---
title: Data Transforms
---

# Data Transforms

> A composable pipeline that shapes raw tabular data into the rows the chart actually renders.

## Why this matters

Raw data is rarely chart-ready. Columns have the wrong types, rows need filtering, groups need aggregating, the table is the wrong way around. Blueprint Chart bakes a small **transform pipeline** into the editor so you can clean and reshape data inside the chart rather than juggling external spreadsheets. The same pipeline can also be expressed in the `.bpc` DSL via `transform` nodes, which means the cleaning step travels with the chart source.

## Quickstart

A `.bpc` chart with a single sort transform — the canonical example. The transform runs **before** the chart-type renderer paints marks:

```bpc
chart bar-vertical {
  title = "Brazil produces more coffee than the next three countries combined"
  description = "Million 60-kg bags, 2023/24 crop year"
  colorPalette = "Harvey"
  valueLabels = true

  data {
    "Brazil" = 66.4
    "Colombia" = 12.76
    "Ethiopia" = 9.13
    "Honduras" = 5.5
    "Indonesia" = 7.65
    "Vietnam" = 27.5
  }

  colorize "Brazil" {
    color = "#a4432d"
  }

  transform sort {
    column = "value"
    direction = descending
  }
}
```

::: tip From the sample library
Adapted from `packages/lib/src/samples/coffee-production.bpc`, the only sample currently shipping with a `transform` block. The sample itself already lists its rows in descending order, so the rows above are deliberately shuffled into alphabetical order to give `transform sort` something to do: it reorders them to descending before the bar-vertical renderer reads them.
:::

In the editor, the same pipeline is built interactively in the Data panel — each step appears as a card, can be reordered by drag, and is re-applied on every keystroke.

## How it works

The editor's pipeline lives in `packages/editor/src/stores/dataTransforms.ts` as a `dataTransforms` Pinia store. It holds an ordered array of `TransformStep` objects:

```ts
interface TransformStep {
  id: string
  type: TransformType   // 'sort' | 'filter' | 'hide-columns' | …
  config: Record<string, string>
}
```

A `TransformResult` (`{ columns, rows, columnTypes }`) flows through the pipeline. Each step is a pure function from `(result, config) → result`. The store exposes `applyTransforms(columns, rows, columnTypes)` which folds every step over the input, and `getColumnsAtStep(stepIndex, …)` which lets the UI show what the table will look like at any point in the chain — handy when configuring downstream steps that need the columns produced upstream.

Eight transform types are recognised today (`Computed` is reserved but not implemented):

| Type | Effect |
| --- | --- |
| `Sort` | Sort rows by one or more columns, ascending or descending. |
| `Filter` | Keep rows matching a condition on a single column. |
| `HideColumns` | Drop columns from the result. |
| `Transpose` | Swap rows and columns. |
| `Parse` | Re-type or reformat a column (e.g. parse numbers, normalise strings). |
| `Rename` | Rename a column. |
| `GroupBy` | Group rows by one or more columns and aggregate the rest. |
| `Computed` | Reserved — not yet implemented. |

When the chart is serialised back to `.bpc`, transform steps emit as `transform <name> { … }` blocks, parsed back into the AST as `TransformNode`s on the round-trip.

## Recipes

### Sort the data shown on the chart

The cheapest cleanup. `transform sort` runs before the chart renders, so the bar order on disk doesn't need to match the visual order:

```bpc
transform sort {
  column = "value"
  direction = descending
}
```

::: tip From the sample library
Excerpted from `packages/lib/src/samples/coffee-production.bpc` (also the [quickstart](#quickstart) above). Drop a Sort step into the editor's Data panel and pick a column — it serialises to this same `transform sort` block on save.
:::

### Filter rows by a condition

`Filter` supports five conditions (see `FilterCondition` in `packages/editor/src/enums.ts`):

| Condition | Match |
| --- | --- |
| `equals` | Exact match (string compare). |
| `not-equals` | Inverse of `equals`. |
| `contains` | Substring, case-insensitive. |
| `greater-than` | Numeric `>`; currency symbols and commas in the cell are stripped. |
| `less-than` | Numeric `<`; same stripping. |

The serialised form pairs a condition with a target column and value:

```bpc
transform filter {
  column = "year"
  condition = greater-than
  value = "2000"
}
```

::: warning No sample uses `transform filter` today
The block above is synthesized from `packages/lib/src/transforms/applyFilter.ts` rather than copied from a `.bpc` file — none of the 38 shipped samples filter their data on render. Treat the syntax as canonical (it round-trips through the editor) but expect to author it by hand for now.
:::

If the target value is empty for any condition other than `equals` / `not-equals`, the filter is a no-op (the row is kept).

### Group rows and aggregate

`GroupBy` collapses rows that share one or more group columns and folds the rest with an aggregate function. The `aggregates` config field is a comma-separated list of `column:fn` pairs — `fn` is one of `sum`, `avg`, `min`, `max`, `count`. For `count` the `column` is ignored.

```bpc
transform group-by {
  groupColumns = "country"
  aggregates   = "exports:sum,population:avg,exports:count"
}
```

::: warning No sample uses `transform group-by` today
Synthesized from `packages/lib/src/transforms/applyGroupBy.ts` and `packages/lib/src/enums.ts` (`TransformType.GroupBy = 'group-by'`). Build the step in the editor's Data panel and copy the serialised output if you want a verified starting point.
:::

### Use the pipeline outside the editor

The whole store is a plain Pinia composable. If you're building your own Vue app on top of `@blueprint-chart/editor` internals, import it directly and feed it any table:

```ts
import { useDataTransforms } from '@/composables/useDataTransforms'

const { addStep, applyTransforms, snapshot, hydrate } = useDataTransforms()

addStep(TransformType.Sort, { column: 'value', direction: 'descending' })
addStep(TransformType.Filter, { column: 'year', condition: 'greater-than', value: '2000' })

const { columns, rows, columnTypes } = applyTransforms(
  inputColumns,
  inputRows,
  inputColumnTypes,
)
```

`snapshot()` returns a serialisable copy of the pipeline; `hydrate(steps)` replaces it. The store also persists to local storage in the editor, so reload-survival is automatic in that context.

### Validate a step before adding it

`validateStep(step, columns, columnTypes)` returns either `null` (valid) or a human-readable string explaining why the step is misconfigured — column not found, missing required field, incompatible type for a `Parse` operation. The Data panel calls this on every config change to disable the Apply button.

## API surface

The pipeline lives in `@blueprint-chart/lib`, so a headless render of a `.bpc` applies the same steps as the editor:

| Symbol (from `@blueprint-chart/lib`) | One-liner |
| --- | --- |
| `TransformNode` (type) | AST node for a `transform <name> { … }` block. |
| `DslNodeType.Transform` (enum value) | Discriminator on the AST union. |
| `TransformType` (enum) | `Sort \| Filter \| HideColumns \| Transpose \| Parse \| Rename \| GroupBy \| Computed`. |
| `TRANSFORM_TYPES` | The set of executed types, and what the validator accepts. |
| `TransformResult` (type) | `{ columns, rows, columnTypes }` — the value flowing through the chain. |
| `TransformStep` (type) | `{ type, config }` — one step of the pipeline. |
| `applyTransformSteps(steps, columns, rows, columnTypes)` | Fold a step list over a table. |
| `applyTransformNodes(dataStr, nodes)` | Run `transform` AST nodes over a `data { … }` body. |
| `ParseOperation` / `parseOperations` | Catalogue of `Parse` operations and their accepted input types. |
| `NULL_VALUE` | Sentinel returned by `Parse` when a cell can't be coerced. |

The editor half is the interactive wrapper around it:

| Symbol (from the editor) | One-liner |
| --- | --- |
| `useDataTransforms()` / `useDataTransformsStore()` | Pipeline composable + raw store. |
| `TransformStep` (type) | The library step plus the `id` the pipeline UI keys rows by. |

## See also

- [BPC DSL — Transforms](/reference/dsl/scenes-and-transforms#transforms) for the source-level grammar.
- [Scenes guide](/guide/scenes) — scenes can replace a chart's data wholesale; transforms operate before that swap.
- [API reference](/reference/api/#dsl) for `TransformNode` and the converter helpers.
