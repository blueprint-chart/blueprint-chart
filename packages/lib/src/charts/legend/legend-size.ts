const LEGEND_ROW_HEIGHT = 20

function estimateVerticalLegend(labels: string[]): { width: number, height: number } {
  const maxLen = Math.max(...labels.map(l => l.length))
  return { width: maxLen * 7 + 16 + 8, height: labels.length * LEGEND_ROW_HEIGHT }
}

function wrapItemWidths(itemWidths: number[], availableWidth: number): { width: number, rows: number } {
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
  return { width: Math.max(maxRowWidth, rowWidth), rows }
}

export function estimateLegendSize(
  labels: string[],
  position: string,
  availableWidth?: number,
): { width: number, height: number } {
  if (labels.length === 0) {
    return { width: 0, height: 0 }
  }
  if (position === 'left' || position === 'right') {
    return estimateVerticalLegend(labels)
  }

  const itemWidths = labels.map(l => 16 + l.length * 7 + 12)
  if (!availableWidth || availableWidth <= 0) {
    return { width: itemWidths.reduce((a, b) => a + b, 0), height: LEGEND_ROW_HEIGHT }
  }
  const { width, rows } = wrapItemWidths(itemWidths, availableWidth)
  return { width, height: rows * LEGEND_ROW_HEIGHT }
}

export function estimateDirectLabelWidth(labels: string[]): number {
  if (labels.length === 0) {
    return 0
  }
  const maxLen = Math.max(...labels.map(l => l.length))
  // ~7px per char + 6px gap from line endpoint
  return maxLen * 7 + 10
}
