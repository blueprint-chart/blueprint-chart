---
title: Reference
---

# Reference

Blueprint Chart's reference material covers the same model from two angles:

- **[BPC DSL](/reference/dsl/)** — the `.bpc` text format. Source-level grammar, properties, annotations, scenes, transforms.
- **[API](/reference/api/)** — the TypeScript surface of `@blueprint-chart/lib`. Every exported symbol — types, enums, helpers, rendering primitives, the chart-type registry, and the DSL parse/serialize bridge.

The two views are bridged by `parse` / `serialize` (`.bpc` text ⇆ AST) and by the `ChartType` enum (the list of valid chart-type identifiers is exported from the lib).

## When to read which

- Authoring `.bpc` files (by hand or in the editor): start with the [DSL overview](/reference/dsl/).
- Embedding Blueprint Chart in a TS/JS project, consuming the AST, or building custom renderers: start with the [API reference](/reference/api/).
- Both: read in either order — they share examples (the `bitcoin-price` sample appears in both).
