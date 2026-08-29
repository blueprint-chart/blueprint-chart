import { describe, it, expect } from 'vitest'
import { parseBpcData, serializeTableData, detectColumnTypes } from './table'

describe('a percentage survives a table round trip (#126)', () => {
  const body = '"A" = 40%\n"B" = 60%'

  it('keeps the unit on the way in', () => {
    const table = parseBpcData(body)
    expect(table.rows.map(r => r[1])).toEqual(['40%', '60%'])
  })

  it('still types the column as a number', () => {
    const table = parseBpcData(body)
    expect(detectColumnTypes(table.columns, table.rows)[1]).toBe('number')
  })

  it('writes the unit back out', () => {
    const table = parseBpcData(body)
    expect(serializeTableData(table.columns, table.rows)).toBe(body)
  })
})
