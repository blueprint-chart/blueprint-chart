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
  const rows = data.labels.map((label, i) => {
    const row: Record<string, number> = { _index: i }
    series.forEach((s) => {
      row[s.name] = s.values[i] ?? 0
    })
    return row
  })

  const stack = d3.stack<Record<string, number>>()
    .keys(seriesNames)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone)

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

  const rows = data.labels.map((label, i) => {
    const row: Record<string, number> = { _index: i }
    const total = series.reduce((sum, s) => sum + Math.abs(s.values[i] ?? 0), 0)
    series.forEach((s) => {
      row[s.name] = total > 0 ? ((s.values[i] ?? 0) / total) * 100 : 0
    })
    return row
  })

  const stack = d3.stack<Record<string, number>>()
    .keys(seriesNames)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone)

  return stack(rows)
}
