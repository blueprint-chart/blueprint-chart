// Geometric "label if it fits" check for bar value labels (Approach A).
// Deterministic and render-pass-free, so it behaves identically in the browser
// and in headless/SSR export. Numbers are short, so the per-character estimate
// is reliable for them.

const LABEL_FONT_PX = 11
const CHAR_WIDTH_PX = 6.2 // avg glyph advance at 11px for the chart font
const LABEL_HEIGHT_PX = LABEL_FONT_PX
const INSIDE_PAD_X = 8
const INSIDE_PAD_Y = 4
const BAR_THICKNESS_FLOOR_PX = 14

export interface ValueLabelFitInput {
  text: string
  placement: 'inside' | 'outside'
  orientation: 'vertical' | 'horizontal'
  /** px extent along x (vertical bar: thickness; horizontal bar: length) */
  barWidth: number
  /** px extent along y (vertical bar: length; horizontal bar: thickness) */
  barHeight: number
}

export function estimateLabelWidth(text: string): number {
  return text.length * CHAR_WIDTH_PX
}

export function shouldRenderValueLabel(input: ValueLabelFitInput): boolean {
  const w = estimateLabelWidth(input.text)
  if (input.placement === 'inside') {
    if (input.orientation === 'horizontal') {
      // Label lies along the bar length (barWidth); thickness is barHeight.
      return w <= input.barWidth - INSIDE_PAD_X && LABEL_HEIGHT_PX <= input.barHeight
    }
    // Vertical column segment: length is barHeight; thickness is barWidth.
    return LABEL_HEIGHT_PX <= input.barHeight - INSIDE_PAD_Y && w <= input.barWidth
  }
  // Outside / end labels sit beyond the bar, so only the bar's cross-axis
  // thickness limits legibility.
  const thickness = input.orientation === 'vertical' ? input.barWidth : input.barHeight
  return thickness >= BAR_THICKNESS_FLOOR_PX
}

/** Baseline offset of a point label above its mark. */
const POINT_LABEL_RISE = 8
/** Cap height of an 11px numeral: digits put no ink above it, nor below the baseline. */
const POINT_LABEL_INK = 8
const EDGE_GAP = 4
// Floor for a glyph advance. `measureText` was found to under-report 11px
// sans-serif by ~14% for a seven-digit label (#21), and an under-reported width
// is what lets the canvas edge cut a label mid-number and turn 20 into 0.
const MIN_GLYPH_ADVANCE_PX = 7

export interface LabelViewport {
  /** Plot extent in chart-area coordinates. */
  width: number
  height: number
  /** Canvas margins around the plot, which the label may reach into. */
  margin: { top: number, right: number, bottom: number, left: number }
}

/**
 * Place a value label above a point mark, in chart-area coordinates, so its ink
 * box stays inside the SVG viewport. Labels for line and area charts sit outside
 * the plot clip, so nothing else stops the canvas edge from slicing one: a cut
 * number reads as a smaller one, which is worse than a missing label.
 *
 * A mark the axis range excludes is labelled at the plot edge it was clipped to,
 * matching what bar-horizontal does for the same case.
 */
export function clampPointLabel(
  text: string,
  cx: number,
  cy: number,
  vp: LabelViewport,
): { x: number, y: number } {
  const half = (text.length * MIN_GLYPH_ADVANCE_PX) / 2
  const minX = half + EDGE_GAP - vp.margin.left
  const maxX = vp.width + vp.margin.right - half - EDGE_GAP
  const minY = POINT_LABEL_INK + EDGE_GAP - vp.margin.top
  const maxY = vp.height + vp.margin.bottom - EDGE_GAP
  const inPlot = Math.min(Math.max(cy, 0), vp.height)
  return {
    x: Math.min(Math.max(cx, minX), Math.max(minX, maxX)),
    y: Math.min(Math.max(inPlot - POINT_LABEL_RISE, minY), Math.max(minY, maxY)),
  }
}
