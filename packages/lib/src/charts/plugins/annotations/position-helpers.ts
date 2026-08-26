// ---------------------------------------------------------------------------
// maxWidth / position resolution utilities
// ---------------------------------------------------------------------------

export function resolvePosition(value: number | string, size: number): number {
  // Percentage is a fraction of the plot box: 0% = left/top edge, 100% = right/bottom edge
  if (typeof value === 'number') {
    return (value / 100) * size
  }
  const str = String(value)
  if (str.endsWith('%')) {
    return (parseFloat(str) / 100) * size
  }
  return parseFloat(str) || 0
}

/**
 * Fraction of the chart width an annotation wraps at when the BPC sets no
 * explicit `maxWidth`. Unwrapped text runs off the canvas and drags the whole
 * chart down with it, because `expandSvgToFitAnnotations` grows the viewBox to
 * cover the overflow and `preserveAspectRatio` then scales everything to fit.
 */
export const DEFAULT_MAX_WIDTH_RATIO = 0.4

export function resolveMaxWidth(maxWidth: number | string | undefined, chartWidth: number): number | undefined {
  if (maxWidth == null) {
    return undefined
  }
  if (typeof maxWidth === 'number') {
    return maxWidth || undefined
  }
  const str = String(maxWidth)
  if (str.endsWith('%')) {
    return (parseFloat(str) / 100) * chartWidth
  }
  return parseFloat(str) || undefined
}
