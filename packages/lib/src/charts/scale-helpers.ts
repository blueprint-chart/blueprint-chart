import { parseDateOrNumber } from './date-parse'

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
    const numeric = parseDateOrNumber(labels[i])
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

export const DEFAULT_BAR_GAP = 60

/**
 * Convert a barGap (percentage of bar size) to a d3 scaleBand paddingInner value.
 * 0 = no gap, 100 = gap equals one bar width. Out-of-range values are clamped
 * to [0, 100]; non-finite or undefined values fall back to DEFAULT_BAR_GAP.
 */
export function resolveBarGapPadding(barGap?: number): number {
  const g = Number.isFinite(barGap)
    ? Math.max(0, Math.min(100, barGap as number))
    : DEFAULT_BAR_GAP
  return g / (g + 100)
}

export function computeLinearDomain(
  values: number[],
  range?: { min?: number, max?: number },
): [number, number] {
  const dataMin = Math.min(0, ...values)
  const dataMax = Math.max(0, ...values)
  let lo = range?.min ?? dataMin
  let hi = range?.max ?? dataMax

  // Guard: swap inverted min/max
  if (lo > hi) {
    ;[lo, hi] = [hi, lo]
  }

  // Guard: ensure non-zero extent so d3 scales produce valid ticks
  if (lo === hi) {
    if (lo === 0) {
      hi = 1
    }
    else {
      const nudge = Math.abs(lo) * 0.1
      lo = lo - nudge
      hi = hi + nudge
    }
  }

  return [lo, hi]
}
