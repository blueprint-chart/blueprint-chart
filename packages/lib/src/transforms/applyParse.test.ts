import { applyParse, NULL_VALUE } from './applyParse'
import type { TransformResult } from './types'

function makeData(columns: string[], rows: string[][], columnTypes: string[]): TransformResult {
  return { columns, rows, columnTypes: columnTypes as TransformResult['columnTypes'] }
}

describe('applyParse', () => {
  it('returns data unchanged when column is missing from data', () => {
    const data = makeData(['A'], [['1']], ['string'])
    const result = applyParse(data, { column: 'B', operation: 'trim' })
    expect(result).toEqual(data)
  })

  it('returns data unchanged when column config is empty', () => {
    const data = makeData(['A'], [['1']], ['string'])
    const result = applyParse(data, { column: '', operation: 'trim' })
    expect(result).toEqual(data)
  })

  it('returns data unchanged when operation config is empty', () => {
    const data = makeData(['A'], [['1']], ['string'])
    const result = applyParse(data, { column: 'A', operation: '' })
    expect(result).toEqual(data)
  })

  it('returns data unchanged when operation is missing', () => {
    const data = makeData(['A'], [['1']], ['string'])
    const result = applyParse(data, { column: 'A' })
    expect(result).toEqual(data)
  })

  it('nullifies column for incompatible type', () => {
    const data = makeData(['V'], [['hello'], ['world']], ['string'])
    const result = applyParse(data, { column: 'V', operation: 'round', decimals: '2' })
    expect(result.rows[0][0]).toBe(NULL_VALUE)
    expect(result.rows[1][0]).toBe(NULL_VALUE)
  })

  it('does not modify other columns when nullifying', () => {
    const data = makeData(['A', 'B'], [['hello', 'keep']], ['string', 'string'])
    const result = applyParse(data, { column: 'A', operation: 'round' })
    expect(result.rows[0][0]).toBe(NULL_VALUE)
    expect(result.rows[0][1]).toBe('keep')
  })

  describe('split', () => {
    it('splits into multiple columns', () => {
      const data = makeData(['V'], [['a,b,c']], ['string'])
      const result = applyParse(data, { column: 'V', operation: 'split', separator: ',' })
      expect(result.columns).toEqual(['V_1', 'V_2', 'V_3'])
      expect(result.rows[0]).toEqual(['a', 'b', 'c'])
    })

    it('pads shorter rows with empty strings', () => {
      const data = makeData(['V'], [['a,b,c'], ['x,y']], ['string'])
      const result = applyParse(data, { column: 'V', operation: 'split', separator: ',' })
      expect(result.rows[1]).toEqual(['x', 'y', ''])
    })

    it('respects limit parameter', () => {
      const data = makeData(['V'], [['a,b,c,d']], ['string'])
      const result = applyParse(data, { column: 'V', operation: 'split', separator: ',', limit: '2' })
      expect(result.columns).toEqual(['V_1', 'V_2'])
      expect(result.rows[0]).toEqual(['a', 'b'])
    })

    it('defaults separator to comma', () => {
      const data = makeData(['V'], [['a,b']], ['string'])
      const result = applyParse(data, { column: 'V', operation: 'split' })
      expect(result.rows[0]).toEqual(['a', 'b'])
    })

    it('preserves other columns during split', () => {
      const data = makeData(['Name', 'Tags'], [['Alice', 'a,b']], ['string', 'string'])
      const result = applyParse(data, { column: 'Tags', operation: 'split', separator: ',' })
      expect(result.columns).toEqual(['Name', 'Tags_1', 'Tags_2'])
      expect(result.rows[0]).toEqual(['Alice', 'a', 'b'])
    })

    it('sets new column types to string', () => {
      const data = makeData(['V'], [['1,2,3']], ['number'])
      const result = applyParse(data, { column: 'V', operation: 'split', separator: ',' })
      expect(result.columnTypes).toEqual(['string', 'string', 'string'])
    })
  })

  describe('normalize', () => {
    it('scales values to 0-1 range', () => {
      const data = makeData(['V'], [['10'], ['50'], ['30']], ['number'])
      const result = applyParse(data, { column: 'V', operation: 'normalize' })
      expect(result.rows[0][0]).toBe('0')
      expect(result.rows[1][0]).toBe('1')
      expect(result.rows[2][0]).toBe('0.5')
    })

    it('returns 0 when all values are the same', () => {
      const data = makeData(['V'], [['5'], ['5'], ['5']], ['number'])
      const result = applyParse(data, { column: 'V', operation: 'normalize' })
      expect(result.rows[0][0]).toBe('0')
    })

    it('skips non-numeric values', () => {
      const data = makeData(['V'], [['10'], ['abc'], ['30']], ['number'])
      const result = applyParse(data, { column: 'V', operation: 'normalize' })
      expect(result.rows[1][0]).toBe('abc')
    })

    it('returns data unchanged when no numeric values', () => {
      const data = makeData(['V'], [['abc'], ['def']], ['number'])
      const result = applyParse(data, { column: 'V', operation: 'normalize' })
      expect(result).toEqual(data)
    })
  })

  describe('standardize', () => {
    it('computes z-scores', () => {
      const data = makeData(['V'], [['10'], ['20'], ['30']], ['number'])
      const result = applyParse(data, { column: 'V', operation: 'standardize' })
      expect(Number(result.rows[1][0])).toBeCloseTo(0)
    })

    it('returns 0 when all values are the same', () => {
      const data = makeData(['V'], [['5'], ['5']], ['number'])
      const result = applyParse(data, { column: 'V', operation: 'standardize' })
      expect(result.rows[0][0]).toBe('0')
    })
  })

  describe('standard per-value transform', () => {
    it('applies operation to each row', () => {
      const data = makeData(['V'], [['  hello  '], [' world ']], ['string'])
      const result = applyParse(data, { column: 'V', operation: 'trim' })
      expect(result.rows[0][0]).toBe('hello')
      expect(result.rows[1][0]).toBe('world')
    })

    it('updates column type based on output type', () => {
      const data = makeData(['V'], [['2024-03-15']], ['date'])
      const result = applyParse(data, { column: 'V', operation: 'extract-year' })
      expect(result.columnTypes[0]).toBe('number')
    })

    it('does not mutate original data', () => {
      const original = makeData(['V'], [['hello']], ['string'])
      const originalRow = original.rows[0][0]
      applyParse(original, { column: 'V', operation: 'uppercase' })
      expect(original.rows[0][0]).toBe(originalRow)
    })
  })
})

describe('NULL_VALUE', () => {
  it('is empty string', () => {
    expect(NULL_VALUE).toBe('')
  })
})
