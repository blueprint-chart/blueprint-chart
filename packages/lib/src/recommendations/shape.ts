import type { ColumnType, ShapeSignature } from './types'

export function shapeOf(columnTypes: ColumnType[], _rowCount: number): ShapeSignature {
  const leadsWithDate = columnTypes[0] === 'date'
  const strings = columnTypes.filter(t => t === 'string').length
  const dates = leadsWithDate ? columnTypes.filter(t => t === 'date').length : 0
  const numbers = columnTypes.filter(t => t === 'number' || (t === 'date' && !leadsWithDate)).length

  if (dates === 1 && strings === 0 && numbers >= 1) {
    return numbers === 1 ? '1date+1num' : '1date+Nnum'
  }
  if (strings === 1 && dates === 0 && numbers >= 1) {
    return numbers === 1 ? '1cat+1num' : '1cat+Nnum'
  }
  if (columnTypes[0] === 'string' && dates === 0 && strings >= 2 && numbers >= 2) {
    return '1cat+text+Nnum'
  }
  return 'other'
}
