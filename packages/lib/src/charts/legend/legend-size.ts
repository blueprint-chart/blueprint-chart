import { measureTextWidth, measureMaxTextWidth, truncateToWidth } from '../text-measure'

/** Font size the legend and direct labels render at (see legend.ts and chart.scss). */
const LABEL_FONT_PX = 12
/** Swatch width plus the gap to its text. */
const SWATCH_ADVANCE = 16
/** Gap from an item's text to the next item. */
const ITEM_GAP = 12
/** Padding on a vertical legend, which has no next item to clear. */
const VERTICAL_PADDING = 8

function textBudget(maxWidth: number): number {
  return maxWidth > 0 ? maxWidth - SWATCH_ADVANCE - ITEM_GAP : Number.POSITIVE_INFINITY
}

/**
 * Legend item text and the px advance to the next item. `maxWidth` is the row
 * width: a single item wider than the row is truncated with an ellipsis, since
 * nothing downstream clips it and the text otherwise runs past the frame edge.
 * The suffix carries the value, so it survives and the label absorbs the cut.
 */
export function fitLegendItem(
  label: string,
  suffix = '',
  maxWidth = 0,
): { label: string, suffix: string, width: number } {
  const suffixText = suffix ? ` ${suffix}` : ''
  const budget = textBudget(maxWidth) - measureTextWidth(suffixText, LABEL_FONT_PX)
  const fitted = truncateToWidth(label, budget, LABEL_FONT_PX)
  return {
    label: fitted,
    suffix: suffixText,
    width: SWATCH_ADVANCE + measureTextWidth(fitted + suffixText, LABEL_FONT_PX) + ITEM_GAP,
  }
}

/** Width a vertical legend column needs for `texts`. */
export function legendColumnWidth(texts: string[]): number {
  return measureMaxTextWidth(texts, LABEL_FONT_PX) + SWATCH_ADVANCE + VERTICAL_PADDING
}

export function estimateLegendSize(
  labels: string[],
  position: string,
  availableWidth?: number,
): { width: number, height: number } {
  if (labels.length === 0) {
    return { width: 0, height: 0 }
  }
  const isVertical = position === 'left' || position === 'right'
  if (isVertical) {
    const width = legendColumnWidth(labels)
    const height = labels.length * 20
    return { width, height }
  }
  // horizontal (top/bottom): wrap rows if items exceed available width
  const ROW_HEIGHT = 20
  const itemWidths = labels.map(l => fitLegendItem(l, '', availableWidth).width)
  if (!availableWidth || availableWidth <= 0) {
    const width = itemWidths.reduce((a, b) => a + b, 0)
    return { width, height: ROW_HEIGHT }
  }
  let rows = 1
  let rowWidth = 0
  let maxRowWidth = 0
  for (const w of itemWidths) {
    if (rowWidth > 0 && rowWidth + w > availableWidth) {
      maxRowWidth = Math.max(maxRowWidth, rowWidth)
      rows++
      rowWidth = w
    }
    else {
      rowWidth += w
    }
  }
  maxRowWidth = Math.max(maxRowWidth, rowWidth)
  return { width: maxRowWidth, height: rows * ROW_HEIGHT }
}

export function estimateDirectLabelWidth(labels: string[]): number {
  if (labels.length === 0) {
    return 0
  }
  // measured label width + gap from the line endpoint
  return measureMaxTextWidth(labels, LABEL_FONT_PX) + 10
}
