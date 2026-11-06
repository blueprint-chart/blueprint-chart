import { ScaleType, SortMode } from '../../../enums'
import type { ChartData } from '../../types'
import { numericColumn } from '../scatter/points'
import type { DotPlotMode, ResolvedDotPlot } from './mapping'

export interface DotPlotRow { name: string, values: number[], low?: number, high?: number }

export type DotPlotDropReason = 'missing-value' | 'missing-range' | 'non-positive-log'

type DroppedRow = { name: string, reason: DotPlotDropReason }

function isNumber(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function dropReason(row: DotPlotRow, resolved: ResolvedDotPlot, scaleType?: ScaleType): DotPlotDropReason | undefined {
  if (!row.values.every(isNumber)) {
    return 'missing-value'
  }
  if (resolved.mode === 'range' && !(isNumber(row.low) && isNumber(row.high))) {
    return 'missing-range'
  }
  const numbers = [...row.values, row.low, row.high].filter(isNumber)
  return scaleType === ScaleType.Log && numbers.some(n => n <= 0) ? 'non-positive-log' : undefined
}

export function buildDotPlotRows(data: ChartData, resolved: ResolvedDotPlot, scaleType?: ScaleType): { rows: DotPlotRow[], dropped: DroppedRow[] } {
  const columns = resolved.values.map(name => numericColumn(data, name) ?? [])
  const lows = numericColumn(data, resolved.low) ?? []
  const highs = numericColumn(data, resolved.high) ?? []
  const rows: DotPlotRow[] = []
  const dropped: DroppedRow[] = []

  data.labels.forEach((name, i) => {
    const row: DotPlotRow = { name, values: columns.map(column => column[i]) }
    if (resolved.mode === 'range') {
      row.low = lows[i]
      row.high = highs[i]
    }
    const reason = dropReason(row, resolved, scaleType)
    if (reason) {
      dropped.push({ name, reason })
    }
    else {
      rows.push(row)
    }
  })
  return { rows, dropped }
}

export function sortDotPlotRows(rows: DotPlotRow[], sortMode: SortMode | undefined, mode: DotPlotMode): DotPlotRow[] {
  if (sortMode === SortMode.None) {
    return [...rows]
  }
  const key = sortMode === SortMode.Gap && mode === 'dumbbell'
    ? (row: DotPlotRow) => row.values[row.values.length - 1] - row.values[0]
    : (row: DotPlotRow) => row.values[0]
  return [...rows].sort((a, b) => key(b) - key(a))
}
