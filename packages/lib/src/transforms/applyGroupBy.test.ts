import { applyGroupBy } from './applyGroupBy'
import type { TransformResult } from './types'

function make(columns: string[], rows: string[][], columnTypes: string[]): TransformResult {
  return { columns, rows, columnTypes: columnTypes as TransformResult['columnTypes'] }
}

describe('applyGroupBy', () => {
  it('groups by single column with sum', () => {
    const result = applyGroupBy(
      make(['Country', 'Revenue'], [['US', '100'], ['UK', '50'], ['US', '200'], ['UK', '30']], ['string', 'number']),
      { groupColumns: 'Country', aggregates: 'Revenue:sum' },
    )
    expect(result.columns).toEqual(['Country', 'Revenue_sum'])
    expect(result.rows.length).toBe(2)
    const usRow = result.rows.find(r => r[0] === 'US')!
    const ukRow = result.rows.find(r => r[0] === 'UK')!
    expect(usRow[1]).toBe('300')
    expect(ukRow[1]).toBe('80')
    expect(result.columnTypes).toEqual(['string', 'number'])
  })

  it('groups by single column with avg', () => {
    const result = applyGroupBy(
      make(['Country', 'Revenue'], [['US', '100'], ['US', '200'], ['UK', '50']], ['string', 'number']),
      { groupColumns: 'Country', aggregates: 'Revenue:avg' },
    )
    const usRow = result.rows.find(r => r[0] === 'US')!
    expect(usRow[1]).toBe('150')
    const ukRow = result.rows.find(r => r[0] === 'UK')!
    expect(ukRow[1]).toBe('50')
  })

  it('groups by multiple columns', () => {
    const result = applyGroupBy(
      make(
        ['Country', 'Year', 'Revenue'],
        [['US', '2023', '100'], ['US', '2024', '200'], ['US', '2023', '50'], ['UK', '2024', '80']],
        ['string', 'string', 'number'],
      ),
      { groupColumns: 'Country,Year', aggregates: 'Revenue:sum' },
    )
    expect(result.columns).toEqual(['Country', 'Year', 'Revenue_sum'])
    expect(result.rows.length).toBe(3)
    const us2023 = result.rows.find(r => r[0] === 'US' && r[1] === '2023')!
    expect(us2023[2]).toBe('150')
  })

  it('count aggregation counts rows per group', () => {
    const result = applyGroupBy(
      make(['Country', 'Revenue'], [['US', '100'], ['UK', '50'], ['US', '200']], ['string', 'number']),
      { groupColumns: 'Country', aggregates: 'rows:count' },
    )
    expect(result.columns).toEqual(['Country', 'rows_count'])
    const usRow = result.rows.find(r => r[0] === 'US')!
    expect(usRow[1]).toBe('2')
    const ukRow = result.rows.find(r => r[0] === 'UK')!
    expect(ukRow[1]).toBe('1')
  })

  it('min and max aggregation', () => {
    const result = applyGroupBy(
      make(['Country', 'Revenue'], [['US', '100'], ['US', '300'], ['US', '200']], ['string', 'number']),
      { groupColumns: 'Country', aggregates: 'Revenue:min,Revenue:max' },
    )
    expect(result.columns).toEqual(['Country', 'Revenue_min', 'Revenue_max'])
    expect(result.rows[0][1]).toBe('100')
    expect(result.rows[0][2]).toBe('300')
  })

  it('multiple aggregates on same data', () => {
    const result = applyGroupBy(
      make(
        ['Country', 'Revenue', 'Profit'],
        [['US', '100', '10'], ['US', '200', '30'], ['UK', '50', '20']],
        ['string', 'number', 'number'],
      ),
      { groupColumns: 'Country', aggregates: 'Revenue:sum,Profit:avg,rows:count' },
    )
    expect(result.columns).toEqual(['Country', 'Revenue_sum', 'Profit_avg', 'rows_count'])
    const usRow = result.rows.find(r => r[0] === 'US')!
    expect(usRow[1]).toBe('300')
    expect(usRow[2]).toBe('20')
    expect(usRow[3]).toBe('2')
  })

  it('no-op when group column not found', () => {
    const data = make(['Country', 'Revenue'], [['US', '100'], ['UK', '50']], ['string', 'number'])
    const result = applyGroupBy(data, { groupColumns: 'Missing', aggregates: 'Revenue:sum' })
    expect(result.columns).toEqual(['Country', 'Revenue'])
    expect(result.rows.length).toBe(2)
  })

  it('no-op when no group columns configured', () => {
    const data = make(['Country', 'Revenue'], [['US', '100']], ['string', 'number'])
    const result = applyGroupBy(data, { aggregates: 'Revenue:sum' })
    expect(result.rows.length).toBe(1)
  })

  it('no-op when no aggregates configured', () => {
    const data = make(['Country', 'Revenue'], [['US', '100']], ['string', 'number'])
    const result = applyGroupBy(data, { groupColumns: 'Country' })
    expect(result.rows.length).toBe(1)
  })
})
