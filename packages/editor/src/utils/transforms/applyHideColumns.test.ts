import { applyHideColumns } from './applyHideColumns'
import type { TransformResult } from '@/stores/dataTransforms'

function make(columns: string[], rows: string[][], columnTypes: string[]): TransformResult {
  return { columns, rows, columnTypes: columnTypes as TransformResult['columnTypes'] }
}

describe('applyHideColumns', () => {
  it('hides a single column', () => {
    const result = applyHideColumns(
      make(['Name', 'Value', 'Category'], [['A', '10', 'X'], ['B', '20', 'Y']], ['string', 'number', 'string']),
      { columns: 'Value' },
    )
    expect(result.columns).toEqual(['Name', 'Category'])
    expect(result.rows[0]).toEqual(['A', 'X'])
    expect(result.rows[1]).toEqual(['B', 'Y'])
    expect(result.columnTypes).toEqual(['string', 'string'])
  })

  it('hides multiple columns', () => {
    const result = applyHideColumns(
      make(['Name', 'Value', 'Category'], [['A', '10', 'X'], ['B', '20', 'Y']], ['string', 'number', 'string']),
      { columns: 'Value,Category' },
    )
    expect(result.columns).toEqual(['Name'])
    expect(result.rows[0]).toEqual(['A'])
  })

  it('returns data unchanged with no config', () => {
    const data = make(['Name', 'Value'], [['A', '10']], ['string', 'number'])
    const result = applyHideColumns(data, {})
    expect(result.columns).toEqual(['Name', 'Value'])
  })
})
