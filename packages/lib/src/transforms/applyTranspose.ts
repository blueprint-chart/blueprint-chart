import type { ColumnType } from '../recommendations/types'
import type { TransformResult } from './types'

export function applyTranspose(data: TransformResult): TransformResult {
  if (data.rows.length === 0 || data.columns.length === 0) {
    return data
  }

  const newColumns = ['Field', ...data.rows.map(r => r[0] ?? '')]
  const newRows: string[][] = []
  const newTypes: ColumnType[] = ['string']

  for (let ci = 1; ci < data.columns.length; ci++) {
    const row = [data.columns[ci]]
    for (let ri = 0; ri < data.rows.length; ri++) {
      row.push(data.rows[ri][ci] ?? '')
    }
    newRows.push(row)
  }

  for (let i = 0; i < data.rows.length; i++) {
    const vals = newRows.map(r => r[i + 1] ?? '').filter(v => v.length > 0)
    if (vals.length > 0 && vals.every(v => !Number.isNaN(Number(v.replace(/[,%$€£¥₹]/g, '').trim())) && v.trim().length > 0)) {
      newTypes.push('number')
    }
    else {
      newTypes.push('string')
    }
  }

  return { columns: newColumns, rows: newRows, columnTypes: newTypes }
}
