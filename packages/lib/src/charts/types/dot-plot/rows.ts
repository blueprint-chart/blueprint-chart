import { ScaleType, SortMode, SortDirection } from '../../../enums'
import { sortByValue } from '../../sort-helpers'
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

function percentChange(row: DotPlotRow): number {
  const first = row.values[0]
  return first ? (row.values[row.values.length - 1] - first) / Math.abs(first) : 0
}

export function sortDotPlotRows(rows: DotPlotRow[], { sortMode, sortReverse }: { sortMode?: SortMode, sortReverse?: boolean }, mode: DotPlotMode): DotPlotRow[] {
  if (sortMode === SortMode.None) {
    return [...rows]
  }
  const last = (row: DotPlotRow) => row.values[row.values.length - 1]
  const key = mode !== 'dumbbell'
    ? last
    : sortMode === SortMode.Gap
      ? (row: DotPlotRow) => last(row) - row.values[0]
      : sortMode === SortMode.Change ? percentChange : last
  return sortByValue(rows, key, sortReverse ? SortDirection.Ascending : SortDirection.Descending)
}
