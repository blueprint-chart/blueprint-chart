import { applyTranspose } from './applyTranspose'
import type { TransformResult } from './types'

function make(columns: string[], rows: string[][], columnTypes: string[]): TransformResult {
  return { columns, rows, columnTypes: columnTypes as TransformResult['columnTypes'] }
}

describe('applyTranspose', () => {
  it('transposes rows and columns', () => {
    const result = applyTranspose(
      make(['Country', 'Gold', 'Silver'], [['USA', '40', '44'], ['China', '38', '32']], ['string', 'number', 'number']),
    )
    expect(result.columns).toEqual(['Field', 'USA', 'China'])
    expect(result.rows.length).toBe(2)
    expect(result.rows[0][0]).toBe('Gold')
    expect(result.rows[0][1]).toBe('40')
    expect(result.rows[0][2]).toBe('38')
    expect(result.rows[1][0]).toBe('Silver')
  })

  it('returns same data when empty', () => {
    const result = applyTranspose(make([], [], []))
    expect(result.columns).toEqual([])
    expect(result.rows).toEqual([])
  })

  it('detects numeric column types', () => {
    const result = applyTranspose(
      make(['Category', 'Q1', 'Q2'], [['Sales', '100', '200'], ['Profit', '50', '80']], ['string', 'number', 'number']),
    )
    expect(result.columnTypes[0]).toBe('string')
    expect(result.columnTypes[1]).toBe('number')
    expect(result.columnTypes[2]).toBe('number')
  })
})
