import { describe, it, expect } from 'vitest'
import { parseDelimited, parseBpcData, detectColumnTypes, serializeDelimited, detectDelimiter, isDateValue, isNumberValue, cleanNumericValue } from './useDataParser'
import { parse, dataEntriesToString } from '@blueprint-chart/lib'

describe('detectDelimiter', () => {
  it('detects comma delimiter', () => {
    expect(detectDelimiter('a,b,c\n1,2,3')).toBe(',')
  })

  it('detects tab delimiter', () => {
    expect(detectDelimiter('a\tb\tc\n1\t2\t3')).toBe('\t')
  })

  it('prefers tab when counts are equal', () => {
    expect(detectDelimiter('a\tb,c')).toBe('\t')
  })

  it('returns tab for empty input', () => {
    expect(detectDelimiter('')).toBe('\t')
  })
})

describe('isDateValue', () => {
  it('recognizes YYYY-MM-DD', () => {
    expect(isDateValue('2024-01-15')).toBe(true)
  })

  it('recognizes YYYY-MM', () => {
    expect(isDateValue('2024-01')).toBe(true)
  })

  it('recognizes YYYY', () => {
    expect(isDateValue('2024')).toBe(true)
  })

  it('recognizes MM/DD/YYYY', () => {
    expect(isDateValue('1/15/2024')).toBe(true)
  })

  it('recognizes month name format', () => {
    expect(isDateValue('Jan 15, 2024')).toBe(true)
  })

  it('recognizes YYYY/MM/DD', () => {
    expect(isDateValue('2024/01/15')).toBe(true)
  })

  it('recognizes YYYY/MM', () => {
    expect(isDateValue('2024/01')).toBe(true)
  })

  it('recognizes quarter format', () => {
    expect(isDateValue('Q1 2024')).toBe(true)
    expect(isDateValue('Q4 2023')).toBe(true)
  })

  it('rejects non-date strings', () => {
    expect(isDateValue('hello')).toBe(false)
    expect(isDateValue('')).toBe(false)
    expect(isDateValue('Q5 2024')).toBe(false)
  })
})

describe('isNumberValue', () => {
  it('recognizes plain numbers', () => {
    expect(isNumberValue('42')).toBe(true)
    expect(isNumberValue('3.14')).toBe(true)
    expect(isNumberValue('-7')).toBe(true)
  })

  it('recognizes numbers with currency symbols', () => {
    expect(isNumberValue('$100')).toBe(true)
    expect(isNumberValue('42%')).toBe(true)
  })

  it('recognizes numbers with commas', () => {
    expect(isNumberValue('1,000')).toBe(true)
  })

  it('recognizes values with comparison prefixes', () => {
    expect(isNumberValue('<1')).toBe(true)
    expect(isNumberValue('>100')).toBe(true)
    expect(isNumberValue('≤0.5')).toBe(true)
    expect(isNumberValue('≥10')).toBe(true)
    expect(isNumberValue('~50')).toBe(true)
  })

  it('rejects non-numeric strings', () => {
    expect(isNumberValue('hello')).toBe(false)
    expect(isNumberValue('')).toBe(false)
  })
})

describe('cleanNumericValue', () => {
  it('strips < prefix and returns the number', () => {
    expect(cleanNumericValue('<1')).toBe('1')
  })

  it('strips > prefix', () => {
    expect(cleanNumericValue('>100')).toBe('100')
  })

  it('strips ≤ prefix', () => {
    expect(cleanNumericValue('≤0.5')).toBe('0.5')
  })

  it('strips ≥ prefix', () => {
    expect(cleanNumericValue('≥10')).toBe('10')
  })

  it('strips ~ prefix', () => {
    expect(cleanNumericValue('~50')).toBe('50')
  })

  it('returns plain numbers unchanged', () => {
    expect(cleanNumericValue('42')).toBe('42')
    expect(cleanNumericValue('-3.14')).toBe('-3.14')
  })

  it('returns non-numeric strings unchanged', () => {
    expect(cleanNumericValue('hello')).toBe('hello')
  })
})

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

  it('cleans comparison prefixes from numeric values', () => {
    const csv = 'Term,Value\nChatGPT,<1\nAI,>50\nML,~25'
    const result = parseDelimited(csv)
    expect(result.rows[0][1]).toBe('1')
    expect(result.rows[1][1]).toBe('50')
    expect(result.rows[2][1]).toBe('25')
    expect(result.columnTypes[1]).toBe('number')
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

describe('serializeDelimited', () => {
  it('serializes columns and rows to TSV', () => {
    const result = serializeDelimited(['Name', 'Value'], [['Apples', '42'], ['Bananas', '58']])
    expect(result).toBe('Name\tValue\nApples\t42\nBananas\t58')
  })

  it('serializes to CSV with comma delimiter', () => {
    const result = serializeDelimited(['Name', 'Value'], [['Apples', '42']], ',')
    expect(result).toBe('Name,Value\nApples,42')
  })

  it('quotes CSV cells containing the delimiter', () => {
    const result = serializeDelimited(['Name', 'Value'], [['Hello, World', '42']], ',')
    expect(result).toBe('Name,Value\n"Hello, World",42')
  })

  it('escapes double quotes in CSV cells', () => {
    const result = serializeDelimited(['Name', 'Value'], [['Say "hi"', '42']], ',')
    expect(result).toBe('Name,Value\n"Say ""hi""",42')
  })

  it('round-trips BPC single-series data to TSV without = signs', () => {
    const bpc = '"China" = 1050\n"India" = 900\n"Brazil" = 186'
    const parsed = parseBpcData(bpc)
    const tsv = serializeDelimited(parsed.columns, parsed.rows)
    expect(tsv).not.toContain('=')
    expect(tsv).toBe('label\tvalue\nChina\t1050\nIndia\t900\nBrazil\t186')
  })

  it('round-trips BPC multi-series data to TSV without = signs', () => {
    const bpc = '_series = "New York","Los Angeles","Chicago","Detroit"\n"2000" = 5,5.6,4.5,3.8\n"2002" = 7.3,7.5,6.8,7'
    const parsed = parseBpcData(bpc)
    const tsv = serializeDelimited(parsed.columns, parsed.rows)
    expect(tsv).not.toContain('=')
    expect(tsv).toBe('label\tNew York\tLos Angeles\tChicago\tDetroit\n2000\t5\t5.6\t4.5\t3.8\n2002\t7.3\t7.5\t6.8\t7')
  })

  it('round-trips BPC legacy format to TSV without = signs', () => {
    const bpc = '_series = "Chrome,IE,Firefox"\n"2009-01" = "1.37,64.97,26.85"\n"2009-02" = "1.5,63.98,27.66"'
    const parsed = parseBpcData(bpc)
    const tsv = serializeDelimited(parsed.columns, parsed.rows)
    expect(tsv).not.toContain('=')
    expect(tsv).toBe('label\tChrome\tIE\tFirefox\n2009-01\t1.37\t64.97\t26.85\n2009-02\t1.5\t63.98\t27.66')
  })

  it('round-trips real BPC DSL data section to TSV without = signs', () => {
    const dsl = `chart line-multi {
  data {
    _series = "New York","Los Angeles","Chicago","Detroit"
    "2000" = 5.0,5.6,4.5,3.8
    "2002" = 7.3,7.5,6.8,7.0
  }
}`
    const ast = parse(dsl)
    const dataStr = dataEntriesToString(ast.data!)

    // Verify dataEntriesToString preserves multi-value entries
    expect(dataStr).toContain('_series')
    expect(dataStr).toContain('New York')
    expect(dataStr).not.toMatch(/"2000" = 5\n/) // should NOT truncate to single value

    const parsed = parseBpcData(dataStr)

    // Verify parseBpcData produces correct columns/rows
    expect(parsed.columns).toEqual(['label', 'New York', 'Los Angeles', 'Chicago', 'Detroit'])
    expect(parsed.rows[0]).toHaveLength(5) // label + 4 values
    expect(parsed.rows[0][0]).toBe('2000')
    expect(parsed.rows[0]).not.toContain(expect.stringContaining('='))

    const tsv = serializeDelimited(parsed.columns, parsed.rows)
    expect(tsv).not.toContain('=')
    const lines = tsv.split('\n')
    expect(lines[0]).toBe('label\tNew York\tLos Angeles\tChicago\tDetroit')
    expect(lines[1]).toBe('2000\t5\t5.6\t4.5\t3.8')
    expect(lines[2]).toBe('2002\t7.3\t7.5\t6.8\t7')
  })

  it('shows that parseDelimited corrupts BPC data (= ends up in cells)', () => {
    // This documents the corruption that happens when BPC text is fed to parseDelimited
    const bpcText = '_series = "New York","Los Angeles","Chicago","Detroit"\n"2000" = 5,5.6,4.5,3.8'
    const parsed = parseDelimited(bpcText)

    // parseDelimited treats BPC as CSV: "2000" = 5 becomes a single cell "2000 = 5"
    expect(parsed.rows[0][0]).toContain('=')

    // This is the root cause: if reparseData() is called on BPC rawInput,
    // the data table gets corrupted with = signs in cell values
  })
})

describe('parseBpcData', () => {
  it('returns empty for empty input', () => {
    const result = parseBpcData('')
    expect(result.columns).toEqual([])
    expect(result.rows).toEqual([])
  })

  it('parses single-series key-value format', () => {
    const result = parseBpcData('"China" = 1050\n"India" = 900\n"Brazil" = 186')
    expect(result.columns).toEqual(['label', 'value'])
    expect(result.rows).toEqual([
      ['China', '1050'],
      ['India', '900'],
      ['Brazil', '186'],
    ])
    expect(result.columnTypes).toEqual(['string', 'number'])
  })

  it('parses percentage values', () => {
    const result = parseBpcData('"Apples" = 42%\n"Bananas" = 58%')
    expect(result.columns).toEqual(['label', 'value'])
    expect(result.rows).toEqual([
      ['Apples', '42'],
      ['Bananas', '58'],
    ])
  })

  it('parses multi-series format with _series header', () => {
    const result = parseBpcData('_series = "Chrome,IE,Firefox"\n"2009-01" = "1.37,64.97,26.85"\n"2009-02" = "1.5,63.98,27.66"')
    expect(result.columns).toEqual(['label', 'Chrome', 'IE', 'Firefox'])
    expect(result.rows).toEqual([
      ['2009-01', '1.37', '64.97', '26.85'],
      ['2009-02', '1.5', '63.98', '27.66'],
    ])
  })
})
