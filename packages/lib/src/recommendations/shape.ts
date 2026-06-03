import type { ColumnType, ShapeSignature } from './types'

export function shapeOf(columnTypes: ColumnType[], _rowCount: number): ShapeSignature {
  const strings = columnTypes.filter(t => t === 'string').length
  const numbers = columnTypes.filter(t => t === 'number').length
  const dates = columnTypes.filter(t => t === 'date').length

  if (dates === 1 && strings === 0 && numbers >= 1) {
    return numbers === 1 ? '1date+1num' : '1date+Nnum'
  }
  if (strings === 1 && dates === 0 && numbers >= 1) {
    return numbers === 1 ? '1cat+1num' : '1cat+Nnum'
  }
  return 'other'
}
