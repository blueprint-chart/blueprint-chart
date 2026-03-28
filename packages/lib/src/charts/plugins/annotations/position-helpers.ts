// ---------------------------------------------------------------------------
// maxWidth / position resolution utilities
// ---------------------------------------------------------------------------

export function resolvePosition(value: number | string, size: number): number {
  // Percentage is center-relative: 0% = center, -50% = left/top edge, 50% = right/bottom edge
  if (typeof value === 'number') {
    return size / 2 + (value / 100) * size
  }
  const str = String(value)
  if (str.endsWith('%')) {
    return size / 2 + (parseFloat(str) / 100) * size
  }
  return parseFloat(str) || 0
}

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
