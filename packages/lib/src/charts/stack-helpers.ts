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
 * Each category's values sum to 100.
 */
export function computeStack100(data: ChartData): d3.Series<Record<string, number>, string>[] {
  const series = data.series ?? []
  if (series.length === 0) {
    return []
  }

  const seriesNames = series.map(s => s.name)

  // Feed raw values to d3 and let stackOffsetExpand normalise each row to [0, 1].
  // The previous implementation mixed Math.abs in the denominator with the raw
  // numerator, so diverging rows didn't sum to 100. stackOffsetExpand keeps the
  // row sum consistent for both signed and unsigned data.
  const rows = data.labels.map((_label, i) => {
    const row: Record<string, number> = { _index: i }
    series.forEach((s) => {
      row[s.name] = s.values[i] ?? 0
    })
    return row
  })

  const stack = d3.stack<Record<string, number>>()
    .keys(seriesNames)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetExpand)

  // d3 returns y0/y1 in [0, 1]; scale to [0, 100] to match the previous API.
  const result = stack(rows)
  for (const layer of result) {
    for (const point of layer) {
      point[0] *= 100
      point[1] *= 100
    }
  }
  return result
}
