import * as d3 from 'd3'
import type { ChartData } from './types'

export interface StackedPoint {
  0: number // y0 (baseline)
  1: number // y1 (top)
  data: Record<string, number>
}

/**
 * Compute a stacked layout from multi-series ChartData.
 * Returns d3.Series array usable by d3.area() and rect rendering.
 */
export function computeStack(data: ChartData): d3.Series<Record<string, number>, string>[] {
  const series = data.series ?? []
  if (series.length === 0) {
    return []
  }

  const seriesNames = series.map(s => s.name)

  // Build tabular data: one row per label, columns for each series
  let hasNegative = false
  const rows = data.labels.map((_label, i) => {
    const row: Record<string, number> = { _index: i }
    series.forEach((s) => {
      const v = s.values[i] ?? 0
      if (v < 0) {
        hasNegative = true
      }
      row[s.name] = v
    })
    return row
  })

  // Diverging data needs stackOffsetDiverging so negatives sit below the zero
  // baseline rather than overlapping positives. Keep stackOffsetNone otherwise
  // so the happy-path layout is unchanged.
  const stack = d3.stack<Record<string, number>>()
    .keys(seriesNames)
    .order(d3.stackOrderNone)
    .offset(hasNegative ? d3.stackOffsetDiverging : d3.stackOffsetNone)

  return stack(rows)
}

/**
 * Compute a stacked layout normalized to 100%.
 * Each category's magnitudes sum to 100, negatives below the baseline.
 */
export function computeStack100(data: ChartData): d3.Series<Record<string, number>, string>[] {
  const series = data.series ?? []
  if (series.length === 0) {
    return []
  }

  const seriesNames = series.map(s => s.name)

  // Normalise each row against the sum of absolute values, not the signed sum:
  // a row totalling -13 has no meaningful percentage of itself, and dividing by
  // it produced segments of 338% and -238% whose rects came out with negative
  // dimensions. Shares are then laid out like any other diverging stack, so a
  // negative share sits below the baseline instead of running backwards.
  let hasNegative = false
  const rows = data.labels.map((_label, i) => {
    const row: Record<string, number> = { _index: i }
    const total = series.reduce((sum, s) => sum + Math.abs(s.values[i] ?? 0), 0)
    series.forEach((s) => {
      const v = s.values[i] ?? 0
      if (v < 0) {
        hasNegative = true
      }
      row[s.name] = total > 0 ? (v / total) * 100 : 0
    })
    return row
  })

  const stack = d3.stack<Record<string, number>>()
    .keys(seriesNames)
    .order(d3.stackOrderNone)
    .offset(hasNegative ? d3.stackOffsetDiverging : d3.stackOffsetNone)

  return stack(rows)
}
