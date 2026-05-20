---
title: Accessibility
---

# Accessibility

> Accessible charts are honest charts. CVD simulation, sufficient contrast, meaningful alt text, keyboard and screen-reader support, legible typography, and — above all — never encoding information in a single visual channel.

## Color vision deficiency

Around **8% of men** and **0.5% of women** have some form of color vision deficiency.

- **Never rely on color alone** to convey meaning — combine with shape, pattern, label, or position
- Ensure colors vary enough in **lightness** — convert your palette to grayscale as a quick test
- Blue-orange is the safest hue combination for deuteranopia / protanopia
- Avoid red-green combinations without additional encoding
- Achieve at least **3:1 contrast ratio** between adjacent colors (WCAG)
- Test with simulators: Color Oracle, Coblis, Sim Daltonism, Firefox colorblind addon

## Text contrast

- Minimum **4.5:1 contrast ratio** for normal text (WCAG AA)
- Minimum **3:1** for large text (18px+ bold or 24px+ regular)
- Higher contrast needed for small or distant chart elements

## Alt text for charts

Every chart needs two levels of text alternative:

1. **Short alt text** — Identifies the chart type, subject, and scope. *Example: "Bar chart showing quarterly revenue for 2024 by product line"*
2. **Long description** — Full textual representation of essential data. Can be a linked data table, a `<figcaption>`, or content referenced via `aria-describedby`

## Keyboard and screen reader support

- Interactive elements (tooltips, filters) must be keyboard-accessible
- Use semantic HTML (`<figure>`, `<figcaption>`) to wrap charts
- Provide data tables as an alternative view for complex interactive charts
- Use `aria-describedby` to connect charts to their descriptions

## Font accessibility

- Minimum **12px** for chart text
- Sans-serif fonts with distinct character shapes (l vs. 1 vs. I)
- Avoid thin / light font weights for data labels
- Consider **Atkinson Hyperlegible** for maximum legibility

## Multiple encoding

::: warning
**Never encode information in a single visual channel.** Combine at least two.
:::

- Color + shape (circles vs. triangles)
- Color + pattern (solid vs. hatched)
- Color + label (direct text identification)
- Position + size + color (scatter / bubble charts)

## How Blueprint Chart applies accessibility

Blueprint Chart ships a concrete accessibility toolkit:

- `wcagContrastRatio` — computes WCAG contrast between two colors
- `simulateCvdColor` — applies deuteranopia / protanopia / tritanopia simulation
- `checkCvdColors` — validates that a palette is safe across CVD types

These power the editor's live accessibility checks and the palette pickers in the UI. See the [API reference](/reference/api/) for the full helper surface.

```ts
import { wcagContrastRatio, checkCvdColors } from '@blueprint-chart/lib'

wcagContrastRatio('#2563A0', '#ffffff')   // 5.13 — passes WCAG AA for normal text
checkCvdColors(['#2563A0', '#F26A1F'])    // safe across deuteranopia / protanopia / tritanopia
```

## Worked example: lightness variation beats hue variation

```bpc
chart bar-vertical {
  title = "Brazil produces more coffee than the next three countries combined"
  colorPalette = "Harvey"
  valueLabels = true

  data {
    "Brazil" = 66.4
    "Vietnam" = 29
    "Colombia" = 11.4
    "Indonesia" = 9.9
  }

  colorize "Brazil" {
    color = "#a4432d"
  }
}
```

::: info From `packages/lib/src/samples/coffee-production.bpc`
Coffee uses two encodings for the highlighted bar: a distinct hue (`#a4432d` red-brown vs. the muted Harvey palette) and clear *lightness* contrast against its neighbours. Convert the chart to greyscale and Brazil still reads as the darkest bar — the second encoding (lightness) carries the story even when CVD removes the first (hue). Compare with `valueLabels = true`, which adds a *third* encoding (the literal number).
:::

## Palette catalogue and CVD utilities

Blueprint Chart ships 50+ palettes in `packages/lib/src/charts/palettes.ts`; each one is interpolated through HCL so adjacent colours vary in lightness as well as hue. The CVD simulation and validation helpers live in `packages/lib/src/charts/colorblind.ts`. Together they power the editor's live accessibility checks — any palette referenced by `colorPalette = "<name>"` in a `.bpc` file is run through `checkCvdColors` automatically.

## See also

- [Color & Palettes](/handbook/color)
- [Typography](/handbook/typography)
- [Tooltips & Interaction](/handbook/tooltips)
- [Design Principles](/handbook/design-principles)
