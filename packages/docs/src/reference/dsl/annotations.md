# DSL — Color directives & annotations

Two families of named blocks that target specific data values to draw the eye: **color directives** (`colorize`, `highlight`, `area-fill`) recolor or emphasize parts of the chart, and **annotations** (`annotation`, `range`, `note`) attach text and shapes to data points, ranges, or absolute positions. Both share the same "named block with a body" shape, and `highlight` is the verb scenes use to switch emphasis — see [Scenes & transforms](/reference/dsl/scenes-and-transforms).

## Color directives

| Directive | Purpose |
| --- | --- |
| `colorize "<target>" { … }` | Apply a color rule to a target (axis label, value label, etc.). |
| `highlight "<target>" { … }` or `highlight "<target>"` | Emphasize a data point or series. The short form has no body. |
| `area-fill "<from>" "<to>" { … }` | Fill the area between two series with a color (line / area charts). |

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
  title = "China alone emits more than the US and India together"

  highlight "China"
}

scene "India rising" {
  title = "India passed the EU to become the third-largest emitter"

  highlight "India"
}

scene "Japan declining" {
  title = "Japan's emissions have fallen since their 2013 peak"

  highlight "Japan"
}
```

::: info From `packages/lib/src/samples/co2-emissions-story.bpc`
Three scenes share the same data and successively highlight one country each — the canonical "guided tour" pattern.
:::

### `area-fill`

```bpc
area-fill "Lower bound" "Upper bound" {
  color = "#94a3b8"
  opacity = 0.2
}
```

::: tip
No bundled sample currently uses `area-fill`. The grammar is documented and parser-tested; the example above is illustrative.
:::

## Annotations

Three kinds of annotation, sharing a body of properties (`text`, `textOffsetX`, `textOffsetY`, `showArrow`, …):

### Point annotation — anchored to a data key

```bpc
annotation "2021" {
  text = "All-time high cycle"
  textOffsetY = -12
  showArrow = true
}
```

::: info From `packages/lib/src/samples/bitcoin-price.bpc`
A minimal point annotation: the key matches a data label, `textOffsetY` nudges the text up, and an arrow draws back to the point.
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
range {                    // range: spans a domain/value window
  orientation = vertical
  start = "2020"
  end = "2022"
  text = "Pandemic rally"
}

note {                     // free: absolutely positioned
  text = "Methodology footnote"
  x = "10%"
  y = "90%"
}
```

::: tip
The bundled samples do not currently exercise `range` or `note` annotations — these are illustrative. The grammar is parser-tested and the AST node types (`RangeAnnotationNode`, `FreeAnnotationNode`) are exported.
:::

The full property surface for each annotation kind is documented in the `AnnotationConfig` / `PointAnnotationConfig` / `RangeAnnotationConfig` / `FreeAnnotationConfig` types exported by `@blueprint-chart/lib`.
