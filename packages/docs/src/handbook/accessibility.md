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

These power the editor's live accessibility checks and the palette pickers in the UI. See the [API reference](/api/) for the full helper surface.

```ts
import { wcagContrastRatio, checkCvdColors } from '@blueprint-chart/lib'

wcagContrastRatio('#2563A0', '#ffffff')   // 5.13 — passes WCAG AA for normal text
checkCvdColors(['#2563A0', '#F26A1F'])    // safe across deuteranopia / protanopia / tritanopia
```

## See also

- [Color & Palettes](/handbook/color)
- [Typography](/handbook/typography)
- [Tooltips & Interaction](/handbook/tooltips)
- [Design Principles](/handbook/design-principles)
