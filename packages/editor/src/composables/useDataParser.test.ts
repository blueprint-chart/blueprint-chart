import { describe, it, expect } from 'vitest'
import { parseDelimited, detectColumnTypes } from './useDataParser'

describe('parseDelimited', () => {
  it('returns empty for empty input', () => {
    const result = parseDelimited('')
    expect(result.columns).toEqual([])
    expect(result.rows).toEqual([])
  })

  it('parses CSV data', () => {
    const csv = 'Name,Value\nApples,42\nBananas,58'
    const result = parseDelimited(csv)
    expect(result.columns).toEqual(['Name', 'Value'])
    expect(result.rows).toEqual([
      ['Apples', '42'],
      ['Bananas', '58'],
    ])
  })

  it('parses TSV data', () => {
    const tsv = 'Name\tValue\nApples\t42\nBananas\t58'
    const result = parseDelimited(tsv)
    expect(result.columns).toEqual(['Name', 'Value'])
    expect(result.rows).toEqual([
      ['Apples', '42'],
      ['Bananas', '58'],
    ])
  })

  it('handles quoted CSV fields', () => {
    const csv = 'Name,Value\n"Hello, World",42'
    const result = parseDelimited(csv)
    expect(result.rows[0][0]).toBe('Hello, World')
  })

  it('handles escaped quotes in CSV', () => {
    const csv = 'Name,Value\n"Say ""hi""",42'
    const result = parseDelimited(csv)
    expect(result.rows[0][0]).toBe('Say "hi"')
  })

  it('skips blank lines', () => {
    const csv = 'Name,Value\n\nApples,42\n\n'
    const result = parseDelimited(csv)
    expect(result.rows.length).toBe(1)
  })

  it('auto-detects TSV when tabs outnumber commas', () => {
    const mixed = 'A\tB\tC\n1\t2\t3'
    const result = parseDelimited(mixed)
    expect(result.columns).toEqual(['A', 'B', 'C'])
  })

  it('handles header-only input', () => {
    const csv = 'Name,Value'
    const result = parseDelimited(csv)
    expect(result.columns).toEqual(['Name', 'Value'])
    expect(result.rows).toEqual([])
  })

  it('parses with firstRowIsHeader false', () => {
    const csv = 'Apples,42\nBananas,58'
    const result = parseDelimited(csv, { firstRowIsHeader: false })
    expect(result.columns).toEqual(['Column 1', 'Column 2'])
    expect(result.rows.length).toBe(2)
    expect(result.rows[0]).toEqual(['Apples', '42'])
  })

  it('parses with explicit delimiter', () => {
    const data = 'Name;Value\nApples;42'
    const result = parseDelimited(data, { delimiter: ';' })
    expect(result.columns).toEqual(['Name', 'Value'])
    expect(result.rows[0]).toEqual(['Apples', '42'])
  })

  it('parses with comma decimal separator', () => {
    const data = 'Name,Value\nApples,"3,14"\nBananas,"2,72"'
    const result = parseDelimited(data, { decimalSeparator: ',' })
    expect(result.rows[0][1]).toBe('3.14')
    expect(result.rows[1][1]).toBe('2.72')
  })

  it('detects column types in parsed result', () => {
    const csv = 'Name,Amount,Date\nApples,42,2024-01-15\nBananas,58,2024-02-20'
    const result = parseDelimited(csv)
    expect(result.columnTypes).toEqual(['string', 'number', 'date'])
  })
})

describe('detectColumnTypes', () => {
  it('detects number columns', () => {
    const types = detectColumnTypes(['Value'], [['42'], ['58'], ['100']])
    expect(types).toEqual(['number'])
  })

  it('detects numbers with currency symbols', () => {
    const types = detectColumnTypes(['Price'], [['$42'], ['$58.50'], ['$100']])
    expect(types).toEqual(['number'])
  })

  it('detects numbers with percent and commas', () => {
    const types = detectColumnTypes(['Rate'], [['42%'], ['1,200'], ['58%']])
    expect(types).toEqual(['number'])
  })

  it('detects date columns with ISO format', () => {
    const types = detectColumnTypes(['Date'], [['2024-01-15'], ['2024-02-20']])
    expect(types).toEqual(['date'])
  })

  it('detects date columns with slash format', () => {
    const types = detectColumnTypes(['Date'], [['1/15/2024'], ['2/20/2024']])
    expect(types).toEqual(['date'])
  })

  it('detects date columns with month name format', () => {
    const types = detectColumnTypes(['Date'], [['Jan 15, 2024'], ['Feb 20, 2024']])
    expect(types).toEqual(['date'])
  })

  it('detects string columns', () => {
    const types = detectColumnTypes(['Name'], [['Apples'], ['Bananas']])
    expect(types).toEqual(['string'])
  })

  it('falls back to string when mixed types', () => {
    const types = detectColumnTypes(['Mixed'], [['42'], ['hello'], ['2024-01-01']])
    expect(types).toEqual(['string'])
  })

  it('returns string for empty columns', () => {
    const types = detectColumnTypes(['Empty'], [[''], ['']])
    expect(types).toEqual(['string'])
  })

  it('detects multiple column types', () => {
    const types = detectColumnTypes(
      ['Name', 'Value', 'Date'],
      [
        ['Apples', '42', '2024-01-15'],
        ['Bananas', '58', '2024-02-20'],
      ],
    )
    expect(types).toEqual(['string', 'number', 'date'])
  })

  it('detects YYYY-MM date format', () => {
    const types = detectColumnTypes(['Date'], [['2009-01'], ['2009-02'], ['2010-03']])
    expect(types).toEqual(['date'])
  })

  it('detects YYYY date format', () => {
    const types = detectColumnTypes(['Year'], [['2009'], ['2010'], ['2011']])
    expect(types).toEqual(['date'])
  })

  it('detects YYYY/MM date format', () => {
    const types = detectColumnTypes(['Date'], [['2009/01'], ['2009/02']])
    expect(types).toEqual(['date'])
  })

  it('detects quarter date format', () => {
    const types = detectColumnTypes(['Quarter'], [['Q1 2024'], ['Q2 2024']])
    expect(types).toEqual(['date'])
  })

  it('detects date column with multi-series numeric columns', () => {
    const types = detectColumnTypes(
      ['Date', 'Chrome', 'IE', 'Firefox'],
      [
        ['2009-01', '1.37', '64.97', '26.85'],
        ['2009-02', '1.5', '63.98', '27.66'],
      ],
    )
    expect(types).toEqual(['date', 'number', 'number', 'number'])
  })
})
