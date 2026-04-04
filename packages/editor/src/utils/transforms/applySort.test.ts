import { applySort } from './applySort'
import type { TransformResult } from '@/stores/dataTransforms'

function make(columns: string[], rows: string[][], columnTypes: string[]): TransformResult {
  return { columns, rows, columnTypes: columnTypes as TransformResult['columnTypes'] }
}

describe('applySort', () => {
  it('sorts ascending by numeric column', () => {
    const result = applySort(
      make(['Name', 'Value'], [['Bananas', '58'], ['Apples', '10'], ['Cherries', '30']], ['string', 'number']),
      { column: 'Value', direction: 'ascending' },
    )
    expect(result.rows[0][0]).toBe('Apples')
    expect(result.rows[1][0]).toBe('Cherries')
    expect(result.rows[2][0]).toBe('Bananas')
  })

  it('sorts descending', () => {
    const result = applySort(
      make(['Name', 'Value'], [['Bananas', '58'], ['Apples', '10'], ['Cherries', '30']], ['string', 'number']),
      { column: 'Value', direction: 'descending' },
    )
    expect(result.rows[0][0]).toBe('Bananas')
    expect(result.rows[2][0]).toBe('Apples')
  })

  it('sorts date type columns', () => {
    const result = applySort(
      make(['Date', 'Value'], [['2024-03-15', '10'], ['2024-01-01', '20'], ['2024-02-10', '30']], ['date', 'number']),
      { column: 'Date', direction: 'ascending' },
    )
    expect(result.rows[0][0]).toBe('2024-01-01')
    expect(result.rows[1][0]).toBe('2024-02-10')
    expect(result.rows[2][0]).toBe('2024-03-15')
  })

  it('ignores unknown column', () => {
    const data = make(['Name', 'Value'], [['A', '1'], ['B', '2']], ['string', 'number'])
    const result = applySort(data, { column: 'Unknown', direction: 'ascending' })
    expect(result.rows.length).toBe(2)
  })

  it('returns data unchanged when no columns specified', () => {
    const data = make(['Name'], [['A'], ['B']], ['string'])
    const result = applySort(data, {})
    expect(result.rows).toEqual([['A'], ['B']])
  })
})
