import { stripDigitGroupSpaces } from '../charts/number-parse'

import type { ColumnType } from '../recommendations/types'

export function parseNumeric(v: string): number {
  return Number(stripDigitGroupSpaces(v).replace(/[,%$€£¥₹]/g, '').trim()) || 0
}

export function compareValues(a: string, b: string, type: ColumnType): number {
  if (type === 'number') {
    return parseNumeric(a) - parseNumeric(b)
  }
  if (type === 'date') {
    const da = Date.parse(a) || 0
    const db = Date.parse(b) || 0
    return da - db
  }
  return a.localeCompare(b)
}

export function resolveColumns(config: Record<string, string>): string[] {
  if (config.columns) {
    return config.columns.split(',').map(c => c.trim()).filter(Boolean)
  }
  if (config.column) {
    return [config.column]
  }
  return []
}
