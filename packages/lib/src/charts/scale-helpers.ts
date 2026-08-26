import { detectDates, parseDate, parseDateOrNumber, parseNumberOrDate } from './date-parse'
import type { AxisRange } from './types'
import { ScaleType } from '../enums'

function valueBound(bound?: number | string): number | undefined {
  return typeof bound === 'string' ? parseNumberOrDate(bound) : bound
}

function labelBound(bound: number | string | undefined, temporal: boolean): number | undefined {
  if (typeof bound !== 'string') {
    return bound
  }
  const date = parseDate(bound)
  if (date) {
    return date.getTime()
  }
  // A bare number can't be compared with epoch-ms labels: applying it anyway
  // drops every row and empties the chart, so a temporal axis ignores it.
  return temporal ? undefined : parseDateOrNumber(bound)
}

/**
 * Filter chart labels (and corresponding data) by a horizontal axis range.
 * Returns the indices of labels that fall within [min, max].
 */
export function filterLabelsByRange(
  labels: string[],
  range?: AxisRange,
): number[] {
  if (!range || (range.min === undefined && range.max === undefined)) {
    return labels.map((_, i) => i)
  }
  const temporal = detectDates(labels) !== null
  const min = labelBound(range.min, temporal)
  const max = labelBound(range.max, temporal)
  if (min === undefined && max === undefined) {
    return labels.map((_, i) => i)
  }
  const indices: number[] = []
  for (let i = 0; i < labels.length; i++) {
    const numeric = parseDateOrNumber(labels[i])
    if (numeric === undefined) {
      indices.push(i) // Keep non-numeric labels
      continue
    }
    if (min !== undefined && numeric < min) {
      continue
    }
    if (max !== undefined && numeric > max) {
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
  range?: AxisRange,
  scaleType?: ScaleType,
): [number, number] {
  // Compute min/max via iteration to avoid blowing the argument limit
  // (Math.min(0, ...values) overflows at ~64–125k entries).
  // Track both the data extent and whether every finite value is positive,
  // so log scales can opt out of the 0-anchor below.
  let dataMin = 0
  let dataMax = 0
  let posMin = Infinity
  let allPositive = true
  let hasFinite = false
  for (const v of values) {
    if (!Number.isFinite(v)) {
      continue
    }
    hasFinite = true
    if (v < dataMin) {
      dataMin = v
    }
    if (v > dataMax) {
      dataMax = v
    }
    if (v <= 0) {
      allPositive = false
    }
    else if (v < posMin) {
      posMin = v
    }
  }

  // Log scales can't render 0/negative baselines; when every value is positive
  // use min(values) as the floor instead of forcing 0.
  if (scaleType === ScaleType.Log && hasFinite && allPositive) {
    dataMin = posMin
  }

  let lo = valueBound(range?.min) ?? dataMin
  let hi = valueBound(range?.max) ?? dataMax

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

/**
 * Decade tick values (1, 10, 100, ...) for a logarithmic axis, or null when the
 * scale is not logarithmic or holds no decade.
 *
 * d3's symlog scale generates ticks linearly, which on a log axis stacks every
 * label into the top decade and emits a 0 that a log axis cannot represent.
 * The domain floor is 0 once `.nice()` has run, so decades start at 1 there.
 */
export function logTickValues(
  scale: { domain: () => unknown[], constant?: () => unknown },
  maxTicks: number,
): number[] | null {
  if (typeof scale.constant !== 'function') {
    return null
  }
  const domain = scale.domain().map(Number).filter(Number.isFinite)
  const lo = Math.min(...domain)
  const hi = Math.max(...domain)
  if (!(hi > 0)) {
    return null
  }
  const first = lo > 0 ? Math.ceil(Math.log10(lo)) : 0
  const last = Math.floor(Math.log10(hi))
  const decades: number[] = []
  for (let k = first; k <= last; k++) {
    decades.push(10 ** k)
  }
  if (decades.length === 0) {
    return null
  }
  const step = Math.ceil(decades.length / Math.max(2, maxTicks))
  return step > 1 ? decades.filter((_, i) => i % step === 0) : decades
}
