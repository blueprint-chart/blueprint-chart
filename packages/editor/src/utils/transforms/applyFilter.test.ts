import { applyFilter } from './applyFilter'
import type { TransformResult } from '@/stores/dataTransforms'

function make(columns: string[], rows: string[][], columnTypes: string[]): TransformResult {
  return { columns, rows, columnTypes: columnTypes as TransformResult['columnTypes'] }
}

describe('applyFilter', () => {
  it('filters by equals', () => {
    const result = applyFilter(
      make(['Name', 'Value'], [['Apples', '42'], ['Bananas', '58']], ['string', 'number']),
      { column: 'Name', condition: 'equals', value: 'Apples' },
    )
    expect(result.rows.length).toBe(1)
    expect(result.rows[0][0]).toBe('Apples')
  })

  it('filters by contains', () => {
    const result = applyFilter(
      make(['Name', 'Value'], [['Apples', '42'], ['Bananas', '58'], ['Oranges', '31']], ['string', 'number']),
      { column: 'Name', condition: 'contains', value: 'an' },
    )
    expect(result.rows.length).toBe(2)
  })

  it('filters by not-equals', () => {
    const result = applyFilter(
      make(['Name', 'Value'], [['A', '1'], ['B', '2'], ['C', '3']], ['string', 'number']),
      { column: 'Name', condition: 'not-equals', value: 'B' },
    )
    expect(result.rows.length).toBe(2)
    expect(result.rows[0][0]).toBe('A')
    expect(result.rows[1][0]).toBe('C')
  })

  it('filters greater-than with currency values', () => {
    const result = applyFilter(
      make(['Item', 'Price'], [['A', '$30'], ['B', '$75'], ['C', '$100']], ['string', 'number']),
      { column: 'Price', condition: 'greater-than', value: '50' },
    )
    expect(result.rows.length).toBe(2)
    expect(result.rows[0][0]).toBe('B')
    expect(result.rows[1][0]).toBe('C')
  })

  it('filters less-than', () => {
    const result = applyFilter(
      make(['Name', 'Value'], [['A', '10'], ['B', '50'], ['C', '20']], ['string', 'number']),
      { column: 'Value', condition: 'less-than', value: '30' },
    )
    expect(result.rows.length).toBe(2)
    expect(result.rows[0][0]).toBe('A')
    expect(result.rows[1][0]).toBe('C')
  })

  it('returns data unchanged for unknown column', () => {
    const data = make(['Name'], [['A'], ['B']], ['string'])
    const result = applyFilter(data, { column: 'Missing', condition: 'equals', value: 'A' })
    expect(result.rows.length).toBe(2)
  })

  it('returns data unchanged when no column specified', () => {
    const data = make(['Name'], [['A'], ['B']], ['string'])
    const result = applyFilter(data, { condition: 'equals', value: 'A' })
    expect(result.rows.length).toBe(2)
  })
})
