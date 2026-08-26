import type { TransformResult } from './types'
import { resolveColumns } from './shared'

export function applyHideColumns(data: TransformResult, config: Record<string, string>): TransformResult {
  const colNames = resolveColumns(config)
  if (colNames.length === 0) {
    return data
  }
  const keepIndices = data.columns
    .map((c, i) => (colNames.includes(c) ? -1 : i))
    .filter(i => i >= 0)
  if (keepIndices.length === data.columns.length) {
    return data
  }
  return {
    columns: keepIndices.map(i => data.columns[i]),
    rows: data.rows.map(r => keepIndices.map(i => r[i])),
    columnTypes: keepIndices.map(i => data.columnTypes[i]),
  }
}
