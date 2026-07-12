---
title: Color & Palettes
bpcBrandDefault: false
---

# Color & Palettes

> Palette types, seven key rules, the perceptual-uniformity trap (HCL vs. HSL), ten techniques for reducing color usage, dark mode adjustments, and the components of an organizational palette system.

## Palette types

| Type | Use | Example |
|------|-----|---------|
| **Sequential** | Ordered data, low → high | Light blue → dark blue |
| **Diverging** | Data with a meaningful midpoint | Blue → grey → red |
| **Categorical** | Distinct categories, no order | Blue, orange, green, purple |

## Key rules

1. **Grey is the most important color.** Use it to de-emphasize supporting data, grid lines, and context elements.
2. **Maximum 7 categorical colors** before confusion sets in. Beyond that, consider grouping, small multiples, or a different chart type.
3. **Vary lightness across colors.** This ensures distinguishability in grayscale and for colorblind users.
4. **Blue-orange is the safest combination** — it works for colorblind users, prints well, and appears in top publications.
5. **Never max saturation + max brightness together.** It creates a neon, untrustworthy appearance.
6. **Avoid pure hues.** Shift 5-10 degrees from exact 0/60/120/180/240/300 positions on the color wheel.
7. **Color must encode meaning, not decoration.** If your color does not represent anything, don't use it.

## Perceptual uniformity

HSV/HSL color spaces are **not** perceptually uniform. Fully saturated yellow and blue have the same HSV "value" but appear dramatically different in brightness. Use CIELAB (L\*a\*b\*) or HCL (Hue-Chroma-Lightness) for interpolation instead.

**Tools:** Chroma.js for HCL interpolation, D3.js CIELAB plugin, ColorBrewer for pre-made safe palettes.

::: tip
Blueprint Chart uses chroma.js throughout the library and ships 50+ built-in palettes resolved through perceptually uniform interpolation.
:::

## Reducing color usage (10 techniques)

1. Remove color entirely when position already distinguishes items
2. Use shades of one hue instead of multiple hues
3. Highlight only key categories; grey everything else
4. Direct-label instead of using color legends
5. Merge minor categories into "Other"
6. Separate same-colored items with white strokes
7. Change chart type to encode by position instead of color
8. Use small multiples (one color per panel)
9. Add symbols, patterns, or dashes instead of colors (limit to 3-4)
10. Use tooltips for progressive disclosure

## Dark mode considerations

- Avoid pure black backgrounds; keep lightness between 10-25%
- Keep background saturation below 20%
- Colors that work on light backgrounds may need adjustment (different contrast dynamics)
- Increase saturation slightly for colors on dark backgrounds

## Organizational palette components

A complete chart color system includes:

- Categorical colors (5-7)
- An accent / highlight color
- Greys for data de-emphasis
- Greys for non-data elements (axes, grid lines)
- Sequential gradients
- Diverging gradients
- Optionally, map element colors

## How Blueprint Chart applies color

Blueprint Chart ships categorical, sequential, and diverging palettes — all derived via chroma.js with perceptually-uniform interpolation. Accessibility is enforced through helpers for WCAG contrast ratio and CVD simulation. See the [Accessibility](/handbook/accessibility) page for details on the contrast and color-vision-deficiency toolkit.

```bpc
chart line {
  title  = "Renewable capacity outgrew coal in 2024"
  colors = "#2563A0"   // single highlight; the rest defaults to grey

  data {
    "2020" = 10
    "2021" = 14
    "2022" = 19
    "2023" = 27
    "2024" = 35
  }
}
```

## Worked example: a named palette for distinct categories

```bpc
chart donut {
  title = "Chrome dominates with two-thirds of the desktop browser market"
  description = "Worldwide, January 2025"
  source = "StatCounter"
  colorPalette = "Heep"
  displayAsPercentage = true

  data {
    "Chrome" = 65.7
    "Edge" = 13.1
    "Safari" = 8.9
    "Firefox" = 6.3
    "Opera" = 3.1
    "Others" = 2.9
  }
}
```

::: info A categorical palette at the 7-color limit
Six unordered categories, so a categorical palette ("Heep") is the right tool — its hues vary in lightness, which means the donut survives a grayscale conversion. The rule "maximum 7 categorical colors" is exactly at the limit here.
:::

## Worked example: one accent hue, everything else grey

```bpc
chart line {
  title = "2024 was the hottest year on record"
  description = "Deviation from the 1951–1980 average, in °C"
  colors = "#e15759"
  verticalGridStyle = "dashed"
  horizontalGridStyle = "none"

  data {
    "1980" = 0.26
    "2000" = 0.42
    "2015" = 0.9
    "2024" = 1.29
  }
}
```

::: info From `packages/lib/src/samples/temperature-anomaly.bpc`
A single red hue carries semantic weight (warming) while the dashed horizontal grid stays neutral. This is technique 3 from the "Reducing color usage" list: highlight one series, grey everything else.
:::

## See also

- [Accessibility](/handbook/accessibility)
- [Design Principles](/handbook/design-principles)
- [Anti-Patterns](/handbook/anti-patterns)
- [Axes & Grid Lines](/handbook/axes)
