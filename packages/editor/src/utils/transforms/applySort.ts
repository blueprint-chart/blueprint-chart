import type { TransformResult } from '@/stores/dataTransforms'
import { compareValues, parseNumeric, resolveColumns } from './shared'

export function applySort(data: TransformResult, config: Record<string, string>): TransformResult {
  const colNames = resolveColumns(config)
  if (colNames.length === 0) {
    return data
  }

  const colIndices = colNames.map(c => data.columns.indexOf(c)).filter(i => i >= 0)
  if (colIndices.length === 0) {
    return data
  }

  const dir = config.direction === 'descending' ? -1 : 1
  const operation = config.operation // 'sum' | 'avg' | undefined

  if (operation && colIndices.length > 1) {
    const sorted = [...data.rows].sort((a, b) => {
      const valsA = colIndices.map(ci => parseNumeric(a[ci] ?? ''))
      const valsB = colIndices.map(ci => parseNumeric(b[ci] ?? ''))
      let keyA: number
      let keyB: number
      if (operation === 'avg') {
        keyA = valsA.reduce((s, v) => s + v, 0) / valsA.length
        keyB = valsB.reduce((s, v) => s + v, 0) / valsB.length
      }
      else {
        keyA = valsA.reduce((s, v) => s + v, 0)
        keyB = valsB.reduce((s, v) => s + v, 0)
      }
      return dir * (keyA - keyB)
    })
    return { ...data, rows: sorted }
  }

  const sorted = [...data.rows].sort((a, b) => {
    for (const ci of colIndices) {
      const type = data.columnTypes[ci] ?? 'string'
      const cmp = compareValues(a[ci] ?? '', b[ci] ?? '', type)
      if (cmp !== 0) {
        return dir * cmp
      }
    }
    return 0
  })
  return { ...data, rows: sorted }
}
