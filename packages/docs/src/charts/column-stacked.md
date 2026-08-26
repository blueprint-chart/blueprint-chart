---
title: Stacked column chart
---

# Stacked column chart

> Stacked vertical column chart for composition over discrete columns; supports percent stacking.

`column-stacked` is the vertical sibling of [`bar-stacked`](./bar-stacked) — each column breaks down into segments. It's the right choice when the x-axis represents a small number of ordered steps (quarters, fiscal years, study cohorts). Set `stackMode = "percent"` for a 100 % composition view. See [Properties](#properties) for every key it accepts.

## When to use

- Composition over a small number of discrete columns (5–10 quarters, years, or stages)
- When both the total and the breakdown matter for each column
- 100 % stacked view (`stackMode = "percent"`) when readers should focus on relative share

## When NOT to use

- More than ~10 time points — switch to [`area-stacked`](./area-stacked)
- Data with negative values — stacking breaks down
- When precise segment-to-segment comparison is needed across columns

## Example

```bpc
chart column-stacked {
  title = "Software revenue grew steadily while hardware spiked in Q4"
  description = "Quarterly revenue in millions, 2024"
  source = "Annual report"

  data {
    series = "Hardware","Software","Services"
    "Q1" = 120,85,45
    "Q2" = 135,92,48
    "Q3" = 128,98,52
    "Q4" = 155,105,58
  }
}
```


<!-- options:start -->

## Properties

Every property `column-stacked` accepts, beside the [frame and layout keys](/reference/dsl/properties) every chart shares. Anything absent from this table is rejected by `validateChart` and ignored by the renderer.

| Property | Type | Default |
| --- | --- | --- |
| `colors` | colors | (unset) |
| `colorPalette` | select, see [Palettes](/guide/palettes) | `Blueprint` |
| `autoContrast` | boolean | `false` |
| `allowDarkMode` | boolean | `true` |
| `stackMode` | select: `normal`, `percent` | `normal` |
| `sortMode` | select: `none`, `total`, `within-groups` | `none` |
| `legend` | boolean | `true` |
| `legendAnchor` | select: `start`, `middle`, `end` | `start` |
| `legendPosition` | select: `top`, `bottom`, `left`, `right` | `top` |
| `directLabelling` | select: `""`, `auto`, `outside`, `inside` | `""` |
| `directLabelAnchor` | select: `start`, `middle`, `end` | `middle` |
| `showVerticalAxis` | boolean | `false` |
| `verticalAxisDirection` | select: `left`, `right` | `left` |
| `showVerticalTicks` | boolean | `false` |
| `verticalLabelPosition` | select: `auto`, `inside`, `outside`, `off` | `off` |
| `verticalGridStyle` | select: `solid`, `dashed`, `dotted`, `none` | `none` |
| `verticalNumberFormat` | numberFormat | (unset) |
| `verticalScaleType` | select: `linear`, `log` | `linear` |
| `verticalRangeMin` | text | `0` |
| `verticalRangeMax` | text | (unset) |
| `showHorizontalAxis` | boolean | `true` |
| `showHorizontalTicks` | boolean | `false` |
| `horizontalLabelPosition` | select: `auto`, `inside`, `outside`, `off` | `auto` |
| `horizontalLabelRotation` | select: `auto`, `horizontal`, `vertical` | `horizontal` |
| `horizontalGridStyle` | select: `solid`, `dashed`, `dotted`, `none` | `none` |
| `horizontalNumberFormat` | numberFormat | (unset) |
| `valueLabels` | boolean | `true` |
| `valueLabelPosition` | select: `auto`, `outside`, `inside` | `auto` |
| `tooltips` | boolean | `false` |
| `crosshair` | boolean | `false` |
| `crosshairDirection` | select: `both`, `vertical`, `horizontal` | `both` |
| `crosshairStyle` | select: `solid`, `dashed`, `dotted` | `dashed` |
| `crosshairColor` | text | `#999` |

<!-- options:end -->

## Common pitfalls

- Stacking too many series — the top layers float and lose their baseline
- Switching to `stackMode = "percent"` without telling the reader hides the change in absolute total
- Inconsistent segment ordering between columns destroys the visual flow

## Related types

- [`bar-stacked`](./bar-stacked) — horizontal equivalent for long category labels
- [`area-stacked`](./area-stacked) — same idea with many time points
- [`bar-multi`](./bar-multi) — when you want side-by-side comparison instead of stacking

## See also

- [Choosing the right chart](/handbook/choosing)
- [Design principles](/handbook/design-principles)
