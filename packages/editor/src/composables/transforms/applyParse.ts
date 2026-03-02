import type { ColumnType } from '../useDataParser'
import type { TransformResult } from '../useDataTransforms'
import { isTypeCompatible, getOutputType } from './parseOperations'
import { transformValue } from './transformValue'

export const NULL_VALUE = ''

function nullifyColumn(data: TransformResult, colIndex: number): TransformResult {
  const newRows = data.rows.map((r) => {
    const row = [...r]
    row[colIndex] = NULL_VALUE
    return row
  })
  return { columns: [...data.columns], rows: newRows, columnTypes: [...data.columnTypes] }
}

function applySplit(data: TransformResult, colIndex: number, config: Record<string, string>): TransformResult {
  const separator = config.separator || ','
  const limit = config.limit ? Number(config.limit) : undefined
  let maxParts = 0
  const splitRows = data.rows.map((row) => {
    const parts = row[colIndex].split(separator)
    const limited = limit ? parts.slice(0, limit) : parts
    maxParts = Math.max(maxParts, limited.length)
    return limited
  })
  const newColumns = [...data.columns]
  const newTypes = [...data.columnTypes]
  const insertNames: string[] = []
  for (let i = 0; i < maxParts; i++) {
    insertNames.push(`${config.column}_${i + 1}`)
  }
  newColumns.splice(colIndex, 1, ...insertNames)
  newTypes.splice(colIndex, 1, ...Array(maxParts).fill('string' as ColumnType))
  const newRows = data.rows.map((row, ri) => {
    const parts = splitRows[ri]
    const newRow = [...row]
    const padded = [...parts, ...Array(maxParts - parts.length).fill('')]
    newRow.splice(colIndex, 1, ...padded)
    return newRow
  })
  return { columns: newColumns, rows: newRows, columnTypes: newTypes }
}

function applyColumnWide(data: TransformResult, colIndex: number, operation: string): TransformResult {
  const values = data.rows.map(r => parseFloat(r[colIndex])).filter(n => !Number.isNaN(n))
  if (values.length === 0) {
    return data
  }

  const newRows = data.rows.map(r => [...r])
  const newTypes = [...data.columnTypes]
  newTypes[colIndex] = 'number'

  if (operation === 'normalize') {
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min
    for (const row of newRows) {
      const n = parseFloat(row[colIndex])
      row[colIndex] = Number.isNaN(n) ? row[colIndex] : String(range === 0 ? 0 : (n - min) / range)
    }
  }
  else {
    const mean = values.reduce((s, v) => s + v, 0) / values.length
    const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length
    const stddev = Math.sqrt(variance)
    for (const row of newRows) {
      const n = parseFloat(row[colIndex])
      row[colIndex] = Number.isNaN(n) ? row[colIndex] : String(stddev === 0 ? 0 : (n - mean) / stddev)
    }
  }
  return { columns: [...data.columns], rows: newRows, columnTypes: newTypes }
}

export function applyParse(data: TransformResult, config: Record<string, string>): TransformResult {
  const colIndex = data.columns.indexOf(config.column)
  if (colIndex < 0 || !config.column || !config.operation) {
    return data
  }

  const operation = config.operation
  const columnType = data.columnTypes[colIndex]

  if (!isTypeCompatible(operation, columnType)) {
    return nullifyColumn(data, colIndex)
  }

  if (operation === 'split') {
    return applySplit(data, colIndex, config)
  }

  if (operation === 'normalize' || operation === 'standardize') {
    return applyColumnWide(data, colIndex, operation)
  }

  // Standard per-value transform
  const newRows = data.rows.map(r => [...r])
  for (const row of newRows) {
    row[colIndex] = transformValue(row[colIndex], operation, config)
  }

  const newTypes = [...data.columnTypes]
  newTypes[colIndex] = getOutputType(operation)

  return { columns: [...data.columns], rows: newRows, columnTypes: newTypes }
}
