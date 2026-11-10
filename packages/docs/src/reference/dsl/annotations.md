# DSL — Color directives & annotations

Two families of named blocks that target specific data values to draw the eye: **color directives** (`colorize`, `highlight`, `area-fill`, `overlay`) recolor, emphasize or layer reference marks on parts of the chart, and **annotations** (`annotation`, `range`, `note`) attach text and shapes to data points, ranges, or absolute positions. Both share the same "named block with a body" shape, and `highlight` is the verb scenes use to switch emphasis — see [Scenes & transforms](/reference/dsl/scenes-and-transforms).

## Color directives

| Directive | Purpose |
| --- | --- |
| `colorize "<target>" { … }` | Apply a color rule to a target (axis label, value label, etc.). |
| `highlight "<target>" { … }` or `highlight "<target>"` | Emphasize a data point or series. The short form has no body. |
| `area-fill "<from>" "<to>" { … }` | Fill the area between two series with a color (line / area charts). |
| `overlay "<col>" { … }` or `overlay "<from>" "<to>" { … }` | Draw a value mark or a range band on each bar (bar-vertical / bar-horizontal). |

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
  opacity = 20
}
```

`opacity` is a percentage from 0 to 100 and defaults to `30`, the same scale as `bgOpacity` on a `range` annotation. `opacity = 0.2` is not a 20 % fill, it is a 0.2 % one, and the band is invisible.

::: tip
No bundled sample currently uses `area-fill`. The grammar is documented and parser-tested; the example above is illustrative.
:::

### `overlay`

```bpc
overlay "Low (90% CI)" "High (90% CI)" {
  title = "90% confidence interval"
  pattern = stripes
  color = "#64748b"
}

overlay "2021 to 2022" {
  title = "Change, 2021 to 2022"
  color = "#e15759"
}
```

Overlays sit on each bar of `bar-vertical` and `bar-horizontal` charts. They read their values from extra columns of the `data` block, and the first column that no overlay claims stays the bar.

The number of columns sets the type: one column draws a value mark (a line across the bar), two columns draw a range band between the two values, whichever is lower or higher.

| Key | Applies to | Meaning |
| --- | --- | --- |
| `title` | both | Name shown in the key and the tooltip. Defaults to the column name (`<from> to <to>` for a range). |
| `color` | both | Any CSS color. Defaults to the text color. |
| `opacity` | both | Percentage from 0 to 100. Defaults to `100` for a value and `30` for a range. |
| `pattern` | range only | `solid` (default) or `stripes`. |
| `hidden` | both | Keeps the overlay in the DSL but does not draw it. |

Problems such as an unknown column, a non-numeric cell, three or more columns, `pattern` on a value overlay, no column left for the bars, or a chart type other than the two bar types are reported as warnings with an `overlay-` code.

::: info From `packages/lib/src/samples/household-income-change.bpc`
The bars are the 2022 to 2023 change in real median household income. A striped range overlay shows the 90% confidence interval (estimate plus or minus the margin of error) and a value overlay marks the previous year's change.
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
