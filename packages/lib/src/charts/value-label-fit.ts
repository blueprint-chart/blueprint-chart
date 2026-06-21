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
