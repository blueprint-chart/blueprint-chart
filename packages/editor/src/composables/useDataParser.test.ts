import { describe, it, expect } from 'vitest'
import { parseDelimited, detectColumnTypes } from './useDataParser'

describe('parseDelimited basic', () => {
  it('returns empty for empty input', () => {
    const result = parseDelimited('')
    expect(result.columns).toEqual([])
    expect(result.rows).toEqual([])
  })

  it('parses CSV data', () => {
    const csv = 'Name,Value\nApples,42\nBananas,58'
    const result = parseDelimited(csv)
    expect(result.columns).toEqual(['Name', 'Value'])
    expect(result.rows).toEqual([['Apples', '42'], ['Bananas', '58']])
  })

  it('parses TSV data', () => {
    const tsv = 'Name\tValue\nApples\t42\nBananas\t58'
    const result = parseDelimited(tsv)
    expect(result.columns).toEqual(['Name', 'Value'])
    expect(result.rows).toEqual([['Apples', '42'], ['Bananas', '58']])
  })
})

describe('parseDelimited quoting', () => {
  it('handles quoted CSV fields', () => {
    const csv = 'Name,Value\n"Hello, World",42'
    expect(parseDelimited(csv).rows[0][0]).toBe('Hello, World')
  })

  it('handles escaped quotes in CSV', () => {
    const csv = 'Name,Value\n"Say ""hi""",42'
    expect(parseDelimited(csv).rows[0][0]).toBe('Say "hi"')
  })
})

describe('parseDelimited edge cases', () => {
  it('skips blank lines', () => {
    const csv = 'Name,Value\n\nApples,42\n\n'
    expect(parseDelimited(csv).rows.length).toBe(1)
  })

  it('auto-detects TSV when tabs outnumber commas', () => {
    const mixed = 'A\tB\tC\n1\t2\t3'
    expect(parseDelimited(mixed).columns).toEqual(['A', 'B', 'C'])
  })

  it('handles header-only input', () => {
    const result = parseDelimited('Name,Value')
    expect(result.columns).toEqual(['Name', 'Value'])
    expect(result.rows).toEqual([])
  })

  it('detects column types in parsed result', () => {
    const csv = 'Name,Amount,Date\nApples,42,2024-01-15\nBananas,58,2024-02-20'
    expect(parseDelimited(csv).columnTypes).toEqual(['string', 'number', 'date'])
  })
})

describe('detectColumnTypes numeric', () => {
  it('detects number columns', () => {
    expect(detectColumnTypes(['Value'], [['42'], ['58'], ['100']])).toEqual(['number'])
  })

  it('detects numbers with currency symbols', () => {
    expect(detectColumnTypes(['Price'], [['$42'], ['$58.50'], ['$100']])).toEqual(['number'])
  })

  it('detects numbers with percent and commas', () => {
    expect(detectColumnTypes(['Rate'], [['42%'], ['1,200'], ['58%']])).toEqual(['number'])
  })
})

describe('detectColumnTypes date formats', () => {
  it('detects ISO format', () => {
    expect(detectColumnTypes(['Date'], [['2024-01-15'], ['2024-02-20']])).toEqual(['date'])
  })

  it('detects slash format', () => {
    expect(detectColumnTypes(['Date'], [['1/15/2024'], ['2/20/2024']])).toEqual(['date'])
  })

  it('detects month name format', () => {
    expect(detectColumnTypes(['Date'], [['Jan 15, 2024'], ['Feb 20, 2024']])).toEqual(['date'])
  })

  it('detects YYYY-MM format', () => {
    expect(detectColumnTypes(['Date'], [['2009-01'], ['2009-02'], ['2010-03']])).toEqual(['date'])
  })

  it('detects YYYY format', () => {
    expect(detectColumnTypes(['Year'], [['2009'], ['2010'], ['2011']])).toEqual(['date'])
  })

  it('detects YYYY/MM format', () => {
    expect(detectColumnTypes(['Date'], [['2009/01'], ['2009/02']])).toEqual(['date'])
  })

  it('detects quarter format', () => {
    expect(detectColumnTypes(['Quarter'], [['Q1 2024'], ['Q2 2024']])).toEqual(['date'])
  })
})

describe('detectColumnTypes string and mixed', () => {
  it('detects string columns', () => {
    expect(detectColumnTypes(['Name'], [['Apples'], ['Bananas']])).toEqual(['string'])
  })

  it('falls back to string when mixed types', () => {
    expect(detectColumnTypes(['Mixed'], [['42'], ['hello'], ['2024-01-01']])).toEqual(['string'])
  })

  it('returns string for empty columns', () => {
    expect(detectColumnTypes(['Empty'], [[''], ['']])).toEqual(['string'])
  })
})

describe('detectColumnTypes multi-column', () => {
  it('detects multiple column types', () => {
    const types = detectColumnTypes(
      ['Name', 'Value', 'Date'],
      [['Apples', '42', '2024-01-15'], ['Bananas', '58', '2024-02-20']],
    )
    expect(types).toEqual(['string', 'number', 'date'])
  })

  it('detects date column with multi-series numeric columns', () => {
    const types = detectColumnTypes(
      ['Date', 'Chrome', 'IE', 'Firefox'],
      [['2009-01', '1.37', '64.97', '26.85'], ['2009-02', '1.5', '63.98', '27.66']],
    )
    expect(types).toEqual(['date', 'number', 'number', 'number'])
  })
})
