---
title: Anti-Patterns
---

# Anti-Patterns

> A catalog of what goes wrong: misleading practices that distort the truth, design anti-patterns that obscure the story, and the statistical integrity rules that keep charts honest.

## Misleading practices

| Anti-pattern | Why it misleads | Fix |
|--------------|-----------------|-----|
| Truncated y-axis on bar charts | Exaggerates small differences | Start at zero |
| Dual y-axes | Arbitrary scale alignment implies false correlation | Side-by-side charts or indexed values |
| 3D effects | Tilted surfaces distort perceived values | Use flat 2D charts |
| Cherry-picked time ranges | Supports a narrative without full context | Show complete timeframe; note any filtering |
| Bubble size by radius | Exponential area distortion | Size by area |
| Unnormalized choropleth | Shows population density, not the intended variable | Normalize per capita / per unit |
| Rainbow color scales | Perceptually non-uniform; meaningless ordering | Use sequential or diverging palettes |

See [Axes & Grid Lines](/handbook/axes) for the baseline rules behind the first row, and [Color & Palettes](/handbook/color) for palette guidance that prevents the last two.

## Design anti-patterns

| Anti-pattern | Problem | Fix |
|--------------|---------|-----|
| Spaghetti chart | Too many overlapping lines | Highlight key lines; grey the rest; small multiples |
| Pie chart with 10+ slices | Unreadable small slices | Use bar chart or group into "Other" |
| Decorative color | Color without meaning adds noise | Use grey for non-meaningful elements |
| Legend far from data | Forces eye-travel; increases cognitive load | Direct labeling |
| Rotated axis labels | Hard to read | Abbreviate labels or use horizontal bars |
| Over-annotation | Competing for attention dilutes the message | Maximum 3-4 annotations; prioritize |
| Missing context | Data without comparison has no story | Add reference lines, targets, time comparisons |
| Stacking many small segments | Impossible to read individual values | Group small segments; use direct comparison |

See [Labels & Legends](/handbook/labels) for direct-labeling technique and [Annotations](/handbook/annotations) for the 3–4 annotation ceiling.

## Statistical integrity

- **Start axes at zero** for area / bar charts unless there is a compelling, stated reason not to
- **Avoid implying causation from correlation** (scatter plots show association only)
- Show **confidence intervals and error bars** when data has uncertainty
- Don't obscure sample size (**box plots hide it**; add individual points for small N)
- **Tables are valid** — sometimes better than charts for conveying precise values

## Worked example: a shared baseline instead of three deceptive single-bar charts

A frequent anti-pattern is splitting a comparison across three charts with different y-axis ranges — each one tuned to "look interesting" in isolation. The honest alternative is one chart with a shared scale, so identical bar lengths mean identical values:

```bpc
chart bar-split {
  title = "Singapore leads the world in all three PISA 2022 subjects"
  description = "Mean scores in Mathematics, Reading, and Science for 15-year-olds"
  source = "OECD PISA 2022"
  valueLabels = true
  sharedScale = true

  data {
    _series = "Mathematics","Reading","Science"
    "Singapore" = 575,543,561
    "Japan"     = 536,516,547
    "Korea"     = 527,515,528
    "Estonia"   = 510,511,526
    "Canada"    = 497,507,515
    "Australia" = 487,498,507
  }
}
```

::: tip Done right
`sharedScale = true` forces every panel onto the same baseline-zero axis, so the eye can compare Mathematics directly against Reading directly against Science. `valueLabels = true` then exposes the exact number, removing any temptation to truncate the axis for visual drama. This is the corrective pattern for the "truncated y-axis", "dual y-axes", and "missing context" rows above. From `packages/lib/src/samples/pisa-scores.bpc`.
:::

## The meta-rule

::: tip
Every anti-pattern traces back to a design principle being violated. If a chart feels wrong, walk back through the [design principles](/handbook/design-principles) — purposefulness, clarity, data-ink, restraint, consistency, comparison. One of them will be out of place.
:::

## See also

- [Design Principles](/handbook/design-principles)
- [Choosing the Right Chart](/handbook/choosing)
- [Axes & Grid Lines](/handbook/axes)
- [Color & Palettes](/handbook/color)
