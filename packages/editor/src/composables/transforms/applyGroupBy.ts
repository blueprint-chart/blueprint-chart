import type { ColumnType } from '../useDataParser'
import type { TransformResult } from '../useDataTransforms'
import { parseNumeric, resolveColumns } from './shared'

const aggregateFns: Record<string, (values: number[]) => number> = {
  sum: vals => vals.reduce((s, v) => s + v, 0),
  avg: vals => vals.reduce((s, v) => s + v, 0) / vals.length,
  min: vals => Math.min(...vals),
  max: vals => Math.max(...vals),
}

function parseAggregateSpec(spec: string, columns: string[]): { col: string, fn: string, colIndex: number }[] {
  return spec.split(',').map(a => a.trim()).filter(Boolean).map((entry) => {
    const sep = entry.lastIndexOf(':')
    if (sep < 0) {
      return null
    }
    const col = entry.slice(0, sep)
    const fn = entry.slice(sep + 1)
    if (fn !== 'count' && !aggregateFns[fn]) {
      return null
    }
    const colIndex = fn === 'count' ? -1 : columns.indexOf(col)
    if (fn !== 'count' && colIndex < 0) {
      return null
    }
    return { col, fn, colIndex }
  }).filter((a): a is { col: string, fn: string, colIndex: number } => a !== null)
}

function computeAggregate(fn: string, rows: string[][], colIndex: number): string {
  if (fn === 'count') {
    return String(rows.length)
  }
  const values = rows.map(r => parseNumeric(r[colIndex] ?? ''))
  return String(aggregateFns[fn](values))
}

export function applyGroupBy(data: TransformResult, config: Record<string, string>): TransformResult {
  const groupIndices = resolveColumns({ columns: config.groupColumns })
    .map(c => data.columns.indexOf(c))
    .filter(i => i >= 0)

  if (groupIndices.length === 0 || !config.aggregates) {
    return data
  }

  const aggs = parseAggregateSpec(config.aggregates, data.columns)
  if (aggs.length === 0) {
    return data
  }

  const groups = new Map<string, { key: string[], rows: string[][] }>()
  for (const row of data.rows) {
    const keyParts = groupIndices.map(i => row[i] ?? '')
    const key = keyParts.join('\0')
    const group = groups.get(key)
    if (group) {
      group.rows.push(row)
    }
    else {
      groups.set(key, { key: keyParts, rows: [row] })
    }
  }

  return {
    columns: [
      ...groupIndices.map(i => data.columns[i]),
      ...aggs.map(a => `${a.col}_${a.fn}`),
    ],
    columnTypes: [
      ...groupIndices.map(i => data.columnTypes[i]),
      ...aggs.map(() => 'number' as ColumnType),
    ],
    rows: [...groups.values()].map(({ key, rows }) => [
      ...key,
      ...aggs.map(a => computeAggregate(a.fn, rows, a.colIndex)),
    ]),
  }
}
