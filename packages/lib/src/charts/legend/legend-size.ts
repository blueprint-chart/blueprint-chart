export function estimateLegendSize(
  labels: string[],
  position: string,
  availableWidth?: number,
): { width: number, height: number } {
  if (labels.length === 0) return { width: 0, height: 0 }
  const isVertical = position === 'left' || position === 'right'
  if (isVertical) {
    const maxLen = Math.max(...labels.map(l => l.length))
    const width = maxLen * 7 + 16 + 8 // label width + rect + padding
    const height = labels.length * 20
    return { width, height }
  }
  // horizontal (top/bottom): wrap rows if items exceed available width
  const ROW_HEIGHT = 20
  const itemWidths = labels.map(l => 16 + l.length * 7 + 12)
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
  if (labels.length === 0) return 0
  const maxLen = Math.max(...labels.map(l => l.length))
  // ~7px per char + 6px gap from line endpoint
  return maxLen * 7 + 10
}
