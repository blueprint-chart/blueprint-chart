---
title: Scatter chart
---

# Scatter chart

> Points placed by two numeric values, to show how one variable relates to another.

`scatter` draws one point per row. The x and y positions come from two numeric columns. A third numeric column can size each point as a bubble, and a text column can color points by group. See [Properties](#properties) for every key it accepts.

## When to use

- Showing whether two measures move together (wealth and life expectancy, price and sales)
- Spotting clusters and outliers that a table hides
- Comparing groups on the same two measures, with one color per group

## When NOT to use

- One of the variables is a category or a date (use [`bar-vertical`](./bar-vertical) or [`line`](./line))
- The story is a ranking or a total (use a bar chart)
- Very few points: a short table or a bar chart reads faster

## Data shape

Each row is one point. The row label is the point's name: it names the tooltip, the label and the target of `highlight`, `colorize` and annotations. Number cells feed the axes and the bubble size. Quoted text cells form a group column.

```bpc
chart scatter {
  data {
    series = "GDP per capita","Life expectancy","Population","Region"
    "France" = 53449, 82.8, 67.4, "Europe & Central Asia"
    "Kenya"  = 5172, 62.9, 51.2, "Sub-Saharan Africa"
    "Japan"  = 46055, 84.4, 126.6, "East Asia & Pacific"
  }
}
```

## Column mapping

Columns map to roles by order. Override a role by naming a column.

| Property | Role | Inferred from |
| --- | --- | --- |
| `x` | Horizontal position | 1st numeric column |
| `y` | Vertical position | 2nd numeric column |
| `size` | Bubble area | 3rd numeric column |
| `group` | Point color and legend | 1st text column |

- `x = "Life expectancy"` puts that column on the horizontal axis. The remaining numeric columns fill the other roles in order.
- `size = "none"` draws uniform dots even when a third numeric column exists. `group = "none"` drops the group colors.
- Size encodes area, not radius: a value twice as large draws a bubble with twice the area. A size key shows reference circles.
- A name that matches no column is an error, with a suggestion when one is close.
- Scatter needs at least two numeric columns. Rows with a missing x or y, or a size of 0 or below, are not drawn and are reported.

## Trend line

`trend` draws a least-squares line. It is off by default.

- `trend = "overall"` fits one line through every point.
- `trend = "per-group"` fits one line per group, in the group color.

The line is dashed, sits beneath the points and appears as `Trend` in the key. It spans only the points it fits and never extends past them. A set with fewer than 3 points gets no line, and a warning says so.

## Log scales

`horizontalScaleType` sets the x axis and `verticalScaleType` sets the y axis. Both default to `linear`.

- `"log"` is a true base-10 scale with ticks at powers of ten. Values of 0 or below cannot sit on it: those rows are dropped and reported. A range bound of 0 or below is ignored, with a warning.
- `"symlog"` compresses large values like a log scale but keeps 0 and negative values.

On other chart types, `"log"` behaves like `"symlog"`. A trend line fits in the scale of each axis, so it stays straight on a log or symlog axis.

## Labels

Point labels are off by default. A point gets a label when it is highlighted or targeted by an annotation. `showLabels = true` labels every point. When a label has no room, it is dropped rather than drawn over another one.

## Highlight and colorize

`highlight` and `colorize` take a point name or a group name.

- `highlight "Nigeria"` emphasizes one point and dims the rest.
- `highlight "Sub-Saharan Africa"` emphasizes the whole group.
- `colorize "Sub-Saharan Africa" { color = "#e15759" }` recolors a group. Naming a point recolors that point only.

When a name matches both a point and a group, the point wins.

## Scenes

Points are matched by name across [scenes](/reference/dsl/scenes-and-transforms). A point present in both scenes glides to its new position, size and color. New points fade in, removed points fade out, and the axes rescale. Keep row names identical between scenes so points move instead of being replaced.

## Accessibility

The chart is exposed to screen readers as a single image. Its name is the title. Its description is your `description` followed by a point count. Write a `description` that states the relationship in words, since a screen reader does not walk the points. The group legend prints each group name next to its swatch, so color is never the only cue.

## Example

Trimmed from `packages/lib/src/samples/life-expectancy-wealth.bpc`. Switch scenes to watch each country move.

```bpc
chart scatter {
  title = "Richer countries live longer, but Nigeria lags far behind its wealth"
  description = "Life expectancy in years against GDP per capita (PPP, constant international dollars, log scale), bubble size is population in millions"
  source = "World Bank, World Development Indicators"
  sourceUrl = "https://databank.worldbank.org/source/world-development-indicators"
  horizontalScaleType = "log"
  trend = "overall"

  data {
    series = "GDP per capita","Life expectancy","Population","Region"
    "Bangladesh" = 6838, 72.6, 164.9, "South Asia"
    "Brazil" = 18019, 75.8, 207.5, "Americas"
    "Canada" = 57584, 82.2, 37.6, "Americas"
    "China" = 18821, 77.9, 1407.7, "East Asia & Pacific"
    "Egypt" = 15027, 71.2, 107.6, "Middle East, North Africa, Afghanistan & Pakistan"
    "Ethiopia" = 2438, 65.7, 115.7, "Sub-Saharan Africa"
    "France" = 53449, 82.8, 67.4, "Europe & Central Asia"
    "India" = 7702, 70.7, 1389.0, "South Asia"
    "Japan" = 46055, 84.4, 126.6, "East Asia & Pacific"
    "Kenya" = 5172, 62.9, 51.2, "Sub-Saharan Africa"
    "Mexico" = 21704, 74.5, 125.8, "Americas"
    "Nigeria" = 8362, 53.0, 209.5, "Sub-Saharan Africa"
    "Norway" = 90773, 83.0, 5.3, "Europe & Central Asia"
    "United States" = 69121, 78.8, 330.2, "Americas"
  }

  highlight "Nigeria"

  scene "1990" {
    title = "In 1990 the same countries were poorer and lived shorter lives"
    data {
      series = "GDP per capita","Life expectancy","Population","Region"
      "Bangladesh" = 2070, 55.8, 111.6, "South Asia"
      "Brazil" = 12633, 65.9, 149.1, "Americas"
      "Canada" = 40475, 77.4, 27.7, "Americas"
      "China" = 1667, 68.2, 1135.2, "East Asia & Pacific"
      "Egypt" = 8007, 62.5, 58.4, "Middle East, North Africa, Afghanistan & Pakistan"
      "Ethiopia" = 874, 45.1, 47.6, "Sub-Saharan Africa"
      "France" = 38656, 76.6, 58.3, "Europe & Central Asia"
      "India" = 2140, 58.6, 865.0, "South Asia"
      "Japan" = 36138, 78.8, 123.5, "East Asia & Pacific"
      "Kenya" = 4177, 58.3, 22.9, "Sub-Saharan Africa"
      "Mexico" = 17170, 69.0, 82.8, "Americas"
      "Nigeria" = 5424, 45.7, 97.1, "Sub-Saharan Africa"
      "Norway" = 56608, 76.5, 4.2, "Europe & Central Asia"
      "United States" = 44384, 75.2, 249.6, "Americas"
    }
  }
}
```

<!-- options:start -->

## Properties

Every property `scatter` accepts, beside the [frame and layout keys](/reference/dsl/properties) every chart shares. Anything absent from this table is rejected by `validateChart` and ignored by the renderer.

| Property | Type | Default |
| --- | --- | --- |
| `colors` | colors | (unset) |
| `colorPalette` | select, see [Palettes](/guide/palettes) | `Blueprint` |
| `autoContrast` | boolean | `false` |
| `allowDarkMode` | boolean | `true` |
| `x` | text | `""` |
| `y` | text | `""` |
| `size` | text | `""` |
| `group` | text | `""` |
| `trend` | select: `""`, `overall`, `per-group` | `""` |
| `showLabels` | boolean | `false` |
| `legend` | boolean | `true` |
| `legendPosition` | select: `top`, `bottom`, `left`, `right` | `top` |
| `legendAnchor` | select: `start`, `middle`, `end` | `start` |
| `tooltips` | boolean | `true` |
| `showVerticalAxis` | boolean | `false` |
| `verticalAxisDirection` | select: `left`, `right` | `left` |
| `showVerticalTicks` | boolean | `false` |
| `verticalLabelPosition` | select: `auto`, `inside`, `outside`, `off` | `auto` |
| `verticalGridStyle` | select: `solid`, `dashed`, `dotted`, `none` | `dashed` |
| `verticalNumberFormat` | numberFormat | (unset) |
| `verticalScaleType` | select: `linear`, `log`, `symlog` | `linear` |
| `verticalRangeMin` | text | (unset) |
| `verticalRangeMax` | text | (unset) |
| `showHorizontalAxis` | boolean | `true` |
| `showHorizontalTicks` | boolean | `false` |
| `horizontalLabelPosition` | select: `auto`, `inside`, `outside`, `off` | `auto` |
| `horizontalLabelRotation` | select: `auto`, `horizontal`, `vertical` | `horizontal` |
| `horizontalGridStyle` | select: `solid`, `dashed`, `dotted`, `none` | `dashed` |
| `horizontalNumberFormat` | numberFormat | (unset) |
| `horizontalScaleType` | select: `linear`, `log`, `symlog` | `linear` |
| `horizontalRangeMin` | text | (unset) |
| `horizontalRangeMax` | text | (unset) |

<!-- options:end -->

## Common pitfalls

- Reading a trend line as proof of cause
- Mapping a column with zeros or negatives to `size`: those rows are not drawn
- Too many groups: past five or six colors, the legend stops helping

## Related types

- [`line`](./line): when x is time and the order of points matters
- [`bar-grouped`](./bar-grouped): when one dimension is a category

## See also

- [Choosing the right chart](/handbook/choosing)
- [Annotations](/reference/dsl/annotations)
