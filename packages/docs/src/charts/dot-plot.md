---
title: Dot plot chart
---

# Dot plot chart

> One dot per row on a shared value axis, with optional ranges and gaps between values.

`dot-plot` puts categories on the vertical axis and values on a horizontal axis. With one value column it draws one dot per row. With two or more it joins the dots with a line (a dumbbell). With `low` and `high` columns it draws a soft bar behind the dot to show a range. The mode comes from your columns: there is no `mode` property. See [Properties](#properties) for every key it accepts.

## When to use

- Showing the gap between two moments or two groups (2000 and 2022, before and after)
- Showing a value with its margin of error or its spread (poll results, min and max)
- Comparing many categories on one measure, when bars would be heavy

## When NOT to use

- The categories form a time series (use [`line`](./line))
- The story is a total or a composition (use a bar chart)
- Two numeric measures against each other (use [`scatter`](./scatter))

## Data shape

Each row is one category. Number columns become dots, or the range bounds in range mode.

A single value column draws one dot per row.

```bpc
chart dot-plot {
  data {
    series = "Life expectancy"
    "France" = 82.8
    "Kenya" = 62.9
    "Japan" = 84.4
  }
}
```

Two or more value columns draw a dumbbell: one colored dot per column and a neutral line between the lowest and the highest dot.

```bpc
chart dot-plot {
  data {
    series = "2000","2022"
    "Zimbabwe" = 46.0, 62.4
    "Japan" = 81.1, 84.0
    "United States" = 76.6, 77.4
  }
}
```

A `low` column and a `high` column plus one value column draw range mode: one dot with a translucent bar from low to high.

```bpc
chart dot-plot {
  data {
    series = "Poll","High","Low"
    "CDU/CSU" = 29,32,27
    "Greens" = 22,25,20
    "SPD" = 14,16,12
  }
}
```

## Column mapping

Range mode turns on when both a `low` and a `high` column resolve. Every other numeric column is a value column.

| Property | Role | Inferred from |
| --- | --- | --- |
| `low` | Lower end of the range bar | Numeric column named `low`, `lower`, `min` or `minimum` |
| `high` | Upper end of the range bar | Numeric column named `high`, `upper`, `max` or `maximum` |

- Detection ignores case and matches whole words. `Lower bound` and `Max` match, `Lowland` does not.
- `low = "Margin low"` names a column yourself. A name that matches no column is reported, with a suggestion when one is close.
- `low = "none"` or `high = "none"` turns the role off, even when a column name would match.
- Both or neither: with only one of the two, range mode stays off and that column counts as a value column. A `low` and `high` pair with no value column falls back to a dumbbell between them.
- Range mode needs a third numeric column for the dot. If there are more, the first is the value and the rest are ignored, with a warning.
- Rows with a missing value, or a missing low or high in range mode, are not drawn and are reported. A value outside its low to high range is drawn and reported.

## Arrows

`arrows = true` draws the row line as an arrow from the first value column to the last one, in series order. With `series = "2015","2024"` the arrow points from 2015 to 2024, whichever is larger. Arrows apply to dumbbells only and are ignored in single and range modes. They are off by default.

## Sorting

`sortMode` orders the rows. The default is `value`.

- `value` sorts by the first value column, largest first.
- `gap` sorts by the last value column minus the first, largest first. Outside a dumbbell it falls back to `value`.
- `none` keeps the order of your data.

## Labels

Value labels are off by default. `valueLabels = true` adds them:

- Single: the value sits to the right of the dot.
- Dumbbell: the lowest dot is labeled on its left and the highest on its right. Dots in between get no label.
- Range: one label to the right of the bar. It shows the value of the dot, not the low or high number.

The legend appears for dumbbells only, with one entry per value column.

## Highlight and colorize

`highlight` and `colorize` take a row name.

- `highlight "Zimbabwe"` emphasizes one row and dims the rest.
- `colorize "Zimbabwe" { color = "#e15759" }` recolors that row.

## Scenes

Rows are matched by name across [scenes](/reference/dsl/scenes-and-transforms). Dots, lines and range bars glide to their new positions, including when a scene changes the mode. Keep row names identical between scenes so rows move instead of being replaced.

## Example

From `packages/lib/src/samples/life-expectancy-gains.bpc`. A dumbbell with arrows, sorted by gap.

```bpc
chart dot-plot {
  title = "Zimbabwe gained over 16 years of life expectancy since 2000, the United States under 1"
  description = "Life expectancy at birth in years, 2000 and 2022, for 10 countries"
  source = "World Bank, World Development Indicators"
  sourceUrl = "https://data.worldbank.org/indicator/SP.DYN.LE00.IN"
  arrows = true
  sortMode = "gap"

  data {
    series = "2000","2022"
    "Zimbabwe" = 46.0, 62.4
    "Ethiopia" = 50.9, 66.9
    "Nigeria" = 47.1, 54.1
    "India" = 62.7, 71.7
    "Russia" = 65.5, 72.5
    "South Africa" = 58.4, 65.5
    "China" = 72.3, 78.2
    "Japan" = 81.1, 84.0
    "Germany" = 77.9, 80.6
    "United States" = 76.6, 77.4
  }
}
```

The range mode sample is `packages/lib/src/samples/election-polls.bpc`.

```bpc
chart dot-plot {
  title = "CDU/CSU led German polls at 29 % ahead of the 2021 election"
  description = "How Germany would vote in the September 2021 federal election, according to polling in the previous June"
  source = "FG Wahlen"
  sourceUrl = "https://www.forschungsgruppe.de"
  note = "Margin of error at 10%: +/- 2 percentage points; at 40%: +/- 3 percentage points"

  data {
    series = "Poll","High","Low"
    "CDU/CSU" = 29,32,27
    "Greens"  = 22,25,20
    "SPD"     = 14,16,12
    "AfD"     = 10,12,8
    "FDP"     = 10,12,8
    "Left"    = 7,9,5
  }
}
```

<!-- options:start -->

## Properties

Every property `dot-plot` accepts, beside the [frame and layout keys](/reference/dsl/properties) every chart shares. Anything absent from this table is rejected by `validateChart` and ignored by the renderer.

| Property | Type | Default |
| --- | --- | --- |
| `colors` | colors | (unset) |
| `colorPalette` | select, see [Palettes](/guide/palettes) | `Blueprint` |
| `autoContrast` | boolean | `false` |
| `allowDarkMode` | boolean | `true` |
| `low` | text | `""` |
| `high` | text | `""` |
| `arrows` | boolean | `false` |
| `sortMode` | select: `none`, `value`, `gap` | `value` |
| `legend` | boolean | `true` |
| `legendPosition` | select: `top`, `bottom`, `left`, `right` | `top` |
| `legendAnchor` | select: `start`, `middle`, `end` | `start` |
| `categoryLabelLine` | boolean | `false` |
| `showVerticalAxis` | boolean | `true` |
| `verticalAxisDirection` | select: `left`, `right` | `left` |
| `showVerticalTicks` | boolean | `false` |
| `verticalLabelPosition` | select: `auto`, `inside`, `outside`, `off` | `auto` |
| `verticalGridStyle` | select: `solid`, `dashed`, `dotted`, `none` | `none` |
| `verticalNumberFormat` | numberFormat | (unset) |
| `showHorizontalAxis` | boolean | `false` |
| `showHorizontalTicks` | boolean | `false` |
| `horizontalLabelPosition` | select: `auto`, `inside`, `outside`, `off` | `auto` |
| `horizontalLabelRotation` | select: `auto`, `horizontal`, `vertical` | `horizontal` |
| `horizontalGridStyle` | select: `solid`, `dashed`, `dotted`, `none` | `dashed` |
| `horizontalNumberFormat` | numberFormat | (unset) |
| `horizontalScaleType` | select: `linear`, `log` | `linear` |
| `horizontalRangeMin` | text | (unset) |
| `horizontalRangeMax` | text | (unset) |
| `valueLabels` | boolean | `false` |
| `tooltips` | boolean | `true` |

<!-- options:end -->

## Common pitfalls

- Using `gap` sort on a single value or a range: it falls back to `value`
- Naming a column `Max` or `Min` and getting range mode by surprise: set `low = "none"` to turn it off
- Reading the arrow as a trend: it only points from the first column to the last
- Using a log axis with values, lows or highs at or below 0: those rows are not drawn and are reported
- Too many value columns: past three or four, the legend and the dots stop reading clearly

## Related types

- [`scatter`](./scatter): when both axes are numeric measures
- [`bar-split`](./bar-split): when the values diverge around a baseline

## See also

- [Choosing the right chart](/handbook/choosing)
- [Annotations](/reference/dsl/annotations)
