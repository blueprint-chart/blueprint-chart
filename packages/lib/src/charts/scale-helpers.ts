import { parseDate } from './date-parse'

/** Parse a label string to a numeric value for range comparison (epoch ms for dates, plain number otherwise). */
function labelToNumeric(label: string): number | undefined {
  const d = parseDate(label)
  if (d) {
    return d.getTime()
  }
  const n = parseFloat(label)
  return isNaN(n) ? undefined : n
}

/**
 * Filter chart labels (and corresponding data) by a horizontal axis range.
 * Returns the indices of labels that fall within [min, max].
 */
export function filterLabelsByRange(
  labels: string[],
  range?: { min?: number, max?: number },
): number[] {
  if (!range || (range.min === undefined && range.max === undefined)) {
    return labels.map((_, i) => i)
  }
  const indices: number[] = []
  for (let i = 0; i < labels.length; i++) {
    const numeric = labelToNumeric(labels[i])
    if (numeric === undefined) {
      indices.push(i) // Keep non-numeric labels
      continue
    }
    if (range.min !== undefined && numeric < range.min) {
      continue
    }
    if (range.max !== undefined && numeric > range.max) {
      continue
    }
    indices.push(i)
  }
  return indices
}

export function computeLinearDomain(
  values: number[],
  range?: { min?: number, max?: number },
): [number, number] {
  const dataMin = Math.min(0, ...values)
  const dataMax = Math.max(0, ...values)
  return [
    range?.min ?? dataMin,
    range?.max ?? dataMax,
  ]
}
