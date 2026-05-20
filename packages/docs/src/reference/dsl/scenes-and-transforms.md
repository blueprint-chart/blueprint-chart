# DSL — Scenes & transforms

Story-level constructs: **scenes** compose multiple visualisation states into a stepable narrative, and **transforms** describe data-pipeline operations applied before rendering. Scenes can override almost any chart member — including chart `type` and `data` — and add their own annotation-visibility verbs.

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
