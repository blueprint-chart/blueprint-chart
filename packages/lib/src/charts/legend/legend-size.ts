export function estimateLegendSize(
  labels: string[],
  position: string,
): { width: number, height: number } {
  if (labels.length === 0) return { width: 0, height: 0 }
  const isVertical = position === 'left' || position === 'right'
  if (isVertical) {
    const maxLen = Math.max(...labels.map(l => l.length))
    const width = maxLen * 7 + 16 + 8 // label width + rect + padding
    const height = labels.length * 20
    return { width, height }
  }
  // horizontal (top/bottom): single row
  const width = labels.reduce((sum, l) => sum + 16 + l.length * 7 + 12, 0)
  const height = 16
  return { width, height }
}

export function estimateDirectLabelWidth(labels: string[]): number {
  if (labels.length === 0) return 0
  const maxLen = Math.max(...labels.map(l => l.length))
  // ~7px per char + 6px gap from line endpoint
  return maxLen * 7 + 10
}
