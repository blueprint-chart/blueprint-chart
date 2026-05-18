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

## The meta-rule

::: tip
Every anti-pattern traces back to a design principle being violated. If a chart feels wrong, walk back through the [design principles](/handbook/design-principles) — purposefulness, clarity, data-ink, restraint, consistency, comparison. One of them will be out of place.
:::

## See also

- [Design Principles](/handbook/design-principles)
- [Choosing the Right Chart](/handbook/choosing)
- [Axes & Grid Lines](/handbook/axes)
- [Color & Palettes](/handbook/color)
