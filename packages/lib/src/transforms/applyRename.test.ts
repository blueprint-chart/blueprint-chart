import { applyRename } from './applyRename'
import type { TransformResult } from './types'

function make(columns: string[], rows: string[][], columnTypes: string[]): TransformResult {
  return { columns, rows, columnTypes: columnTypes as TransformResult['columnTypes'] }
}

describe('applyRename', () => {
  it('renames a column', () => {
    const result = applyRename(
      make(['Name', 'Value'], [['Apples', '42'], ['Bananas', '58']], ['string', 'number']),
      { column: 'Name', newName: 'Label' },
    )
    expect(result.columns).toEqual(['Label', 'Value'])
    expect(result.rows[0][0]).toBe('Apples')
  })

  it('is no-op when column not found', () => {
    const result = applyRename(
      make(['Name', 'Value'], [['Apples', '42']], ['string', 'number']),
      { column: 'Missing', newName: 'Label' },
    )
    expect(result.columns).toEqual(['Name', 'Value'])
  })

  it('is no-op when newName is missing', () => {
    const result = applyRename(
      make(['Name'], [['A']], ['string']),
      { column: 'Name' },
    )
    expect(result.columns).toEqual(['Name'])
  })
})
