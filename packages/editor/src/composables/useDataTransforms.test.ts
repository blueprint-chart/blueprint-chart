import { describe, it, expect, beforeEach } from 'vitest'
import { useDataTransforms } from './useDataTransforms'

describe('useDataTransforms', () => {
  beforeEach(() => {
    useDataTransforms().reset()
  })

  it('starts with no steps', () => {
    const { steps } = useDataTransforms()
    expect(steps.value).toEqual([])
  })

  it('adds a step', () => {
    const { steps, addStep } = useDataTransforms()
    addStep('sort', { column: 'Name', direction: 'ascending' })
    expect(steps.value.length).toBe(1)
    expect(steps.value[0].type).toBe('sort')
    expect(steps.value[0].config.column).toBe('Name')
  })

  it('removes a step', () => {
    const { steps, addStep, removeStep } = useDataTransforms()
    addStep('sort', { column: 'A' })
    addStep('filter', { column: 'B' })
    const id = steps.value[0].id
    removeStep(id)
    expect(steps.value.length).toBe(1)
    expect(steps.value[0].type).toBe('filter')
  })

  it('updates a step config', () => {
    const { steps, addStep, updateStep } = useDataTransforms()
    addStep('sort', { column: 'A', direction: 'ascending' })
    updateStep(steps.value[0].id, { column: 'B', direction: 'descending' })
    expect(steps.value[0].config.column).toBe('B')
    expect(steps.value[0].config.direction).toBe('descending')
  })

  it('moves a step to a new index', () => {
    const { steps, addStep, moveStep } = useDataTransforms()
    addStep('sort', { column: 'A' })
    addStep('filter', { column: 'B' })
    addStep('sort', { column: 'C' })
    const id = steps.value[2].id
    moveStep(id, 0)
    expect(steps.value[0].config.column).toBe('C')
    expect(steps.value[1].config.column).toBe('A')
  })

  it('applies sort transform ascending', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('sort', { column: 'Value', direction: 'ascending' })
    const result = applyTransforms(
      ['Name', 'Value'],
      [['Bananas', '58'], ['Apples', '10'], ['Cherries', '30']],
      ['string', 'number'],
    )
    expect(result.rows[0][0]).toBe('Apples')
    expect(result.rows[1][0]).toBe('Cherries')
    expect(result.rows[2][0]).toBe('Bananas')
  })

  it('applies sort transform descending', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('sort', { column: 'Value', direction: 'descending' })
    const result = applyTransforms(
      ['Name', 'Value'],
      [['Bananas', '58'], ['Apples', '10'], ['Cherries', '30']],
      ['string', 'number'],
    )
    expect(result.rows[0][0]).toBe('Bananas')
    expect(result.rows[2][0]).toBe('Apples')
  })

  it('applies filter transform', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('filter', { column: 'Name', condition: 'equals', value: 'Apples' })
    const result = applyTransforms(
      ['Name', 'Value'],
      [['Apples', '42'], ['Bananas', '58']],
      ['string', 'number'],
    )
    expect(result.rows.length).toBe(1)
    expect(result.rows[0][0]).toBe('Apples')
  })

  it('applies filter contains condition', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('filter', { column: 'Name', condition: 'contains', value: 'an' })
    const result = applyTransforms(
      ['Name', 'Value'],
      [['Apples', '42'], ['Bananas', '58'], ['Oranges', '31']],
      ['string', 'number'],
    )
    expect(result.rows.length).toBe(2)
  })

  it('applies multiple transforms in order', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('filter', { column: 'Value', condition: 'greater-than', value: '20' })
    addStep('sort', { column: 'Value', direction: 'ascending' })
    const result = applyTransforms(
      ['Name', 'Value'],
      [['C', '50'], ['A', '10'], ['B', '30']],
      ['string', 'number'],
    )
    expect(result.rows.length).toBe(2)
    expect(result.rows[0][0]).toBe('B')
    expect(result.rows[1][0]).toBe('C')
  })

  it('ignores sort on unknown column', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('sort', { column: 'Unknown', direction: 'ascending' })
    const rows = [['A', '1'], ['B', '2']]
    const result = applyTransforms(['Name', 'Value'], rows, ['string', 'number'])
    expect(result.rows.length).toBe(2)
  })

  it('addStep returns the step id', () => {
    const { addStep } = useDataTransforms()
    const id = addStep('sort', { column: 'A' })
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('applies transpose transform', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('transpose')
    const result = applyTransforms(
      ['Country', 'Gold', 'Silver'],
      [['USA', '40', '44'], ['China', '38', '32']],
      ['string', 'number', 'number'],
    )
    expect(result.columns).toEqual(['Field', 'USA', 'China'])
    expect(result.rows.length).toBe(2)
    expect(result.rows[0][0]).toBe('Gold')
    expect(result.rows[0][1]).toBe('40')
    expect(result.rows[0][2]).toBe('38')
    expect(result.rows[1][0]).toBe('Silver')
  })

  it('transpose on empty data returns same', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('transpose')
    const result = applyTransforms([], [], [])
    expect(result.columns).toEqual([])
    expect(result.rows).toEqual([])
  })

  it('transpose detects numeric column types', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('transpose')
    const result = applyTransforms(
      ['Category', 'Q1', 'Q2'],
      [['Sales', '100', '200'], ['Profit', '50', '80']],
      ['string', 'number', 'number'],
    )
    expect(result.columnTypes[0]).toBe('string')
    expect(result.columnTypes[1]).toBe('number')
    expect(result.columnTypes[2]).toBe('number')
  })

  it('applies filter greater-than with currency-like values', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('filter', { column: 'Price', condition: 'greater-than', value: '50' })
    const result = applyTransforms(
      ['Item', 'Price'],
      [['A', '$30'], ['B', '$75'], ['C', '$100']],
      ['string', 'number'],
    )
    expect(result.rows.length).toBe(2)
    expect(result.rows[0][0]).toBe('B')
    expect(result.rows[1][0]).toBe('C')
  })

  it('applies filter less-than', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('filter', { column: 'Value', condition: 'less-than', value: '30' })
    const result = applyTransforms(
      ['Name', 'Value'],
      [['A', '10'], ['B', '50'], ['C', '20']],
      ['string', 'number'],
    )
    expect(result.rows.length).toBe(2)
    expect(result.rows[0][0]).toBe('A')
    expect(result.rows[1][0]).toBe('C')
  })

  it('applies filter not-equals', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('filter', { column: 'Name', condition: 'not-equals', value: 'B' })
    const result = applyTransforms(
      ['Name', 'Value'],
      [['A', '1'], ['B', '2'], ['C', '3']],
      ['string', 'number'],
    )
    expect(result.rows.length).toBe(2)
    expect(result.rows[0][0]).toBe('A')
    expect(result.rows[1][0]).toBe('C')
  })

  it('sort handles date type columns', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('sort', { column: 'Date', direction: 'ascending' })
    const result = applyTransforms(
      ['Date', 'Value'],
      [['2024-03-15', '10'], ['2024-01-01', '20'], ['2024-02-10', '30']],
      ['date', 'number'],
    )
    expect(result.rows[0][0]).toBe('2024-01-01')
    expect(result.rows[1][0]).toBe('2024-02-10')
    expect(result.rows[2][0]).toBe('2024-03-15')
  })

  it('applies hide-columns transform', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('hide-columns', { columns: 'Value' })
    const result = applyTransforms(
      ['Name', 'Value', 'Category'],
      [['A', '10', 'X'], ['B', '20', 'Y']],
      ['string', 'number', 'string'],
    )
    expect(result.columns).toEqual(['Name', 'Category'])
    expect(result.rows[0]).toEqual(['A', 'X'])
    expect(result.rows[1]).toEqual(['B', 'Y'])
    expect(result.columnTypes).toEqual(['string', 'string'])
  })

  it('applies hide-columns with multiple columns', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('hide-columns', { columns: 'Value,Category' })
    const result = applyTransforms(
      ['Name', 'Value', 'Category'],
      [['A', '10', 'X'], ['B', '20', 'Y']],
      ['string', 'number', 'string'],
    )
    expect(result.columns).toEqual(['Name'])
    expect(result.rows[0]).toEqual(['A'])
  })

  it('hide-columns with no config returns same data', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('hide-columns', {})
    const result = applyTransforms(
      ['Name', 'Value'],
      [['A', '10']],
      ['string', 'number'],
    )
    expect(result.columns).toEqual(['Name', 'Value'])
  })

  it('resets state', () => {
    const { steps, addStep, reset } = useDataTransforms()
    addStep('sort', { column: 'A' })
    reset()
    expect(steps.value).toEqual([])
  })
})

// Helper to run a single parse operation in isolation
function applyParse(column: string, operation: string, params: Record<string, string>, rows: string[][], columns: string[], columnTypes: string[]) {
  const t = useDataTransforms()
  t.addStep('parse', { column, operation, ...params })
  return t.applyTransforms(columns, rows, columnTypes)
}

describe('parse: type conversions', () => {
  beforeEach(() => {
    useDataTransforms().reset()
  })

  it('to-number strips non-numeric chars', () => {
    const r = applyParse('V', 'to-number', {}, [['$1,234.50'], ['abc'], ['42']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('1234.5')
    expect(r.rows[1][0]).toBe('0')
    expect(r.rows[2][0]).toBe('42')
    expect(r.columnTypes[0]).toBe('number')
  })

  it('to-string keeps value unchanged', () => {
    const r = applyParse('V', 'to-string', {}, [['42'], ['hello']], ['V'], ['number'])
    expect(r.rows[0][0]).toBe('42')
    expect(r.rows[1][0]).toBe('hello')
    expect(r.columnTypes[0]).toBe('string')
  })

  it('to-date parses to ISO', () => {
    const r = applyParse('V', 'to-date', {}, [['2024-03-15']], ['V'], ['string'])
    expect(r.rows[0][0]).toContain('2024-03-15')
    expect(r.columnTypes[0]).toBe('date')
  })

  it('to-date leaves invalid date unchanged', () => {
    const r = applyParse('V', 'to-date', {}, [['not-a-date']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('not-a-date')
  })

  it('to-boolean maps truthy/falsy', () => {
    const r = applyParse('V', 'to-boolean', {}, [['yes'], ['no'], ['1'], ['0'], ['TRUE'], ['FALSE'], ['maybe']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('true')
    expect(r.rows[1][0]).toBe('false')
    expect(r.rows[2][0]).toBe('true')
    expect(r.rows[3][0]).toBe('false')
    expect(r.rows[4][0]).toBe('true')
    expect(r.rows[5][0]).toBe('false')
    expect(r.rows[6][0]).toBe('maybe')
    expect(r.columnTypes[0]).toBe('string')
  })

  it('parse-json extracts key', () => {
    const r = applyParse('V', 'parse-json', { key: 'name' }, [['{"name":"Alice","age":30}']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('Alice')
  })

  it('parse-json stringifies without key', () => {
    const r = applyParse('V', 'parse-json', {}, [['{"a":1}']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('{"a":1}')
  })

  it('parse-json leaves invalid json unchanged', () => {
    const r = applyParse('V', 'parse-json', {}, [['not json']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('not json')
  })
})

describe('parse: string operations', () => {
  beforeEach(() => {
    useDataTransforms().reset()
  })

  it('trim removes whitespace', () => {
    const r = applyParse('V', 'trim', {}, [['  hello  '], [' world']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('hello')
    expect(r.rows[1][0]).toBe('world')
  })

  it('lowercase converts to lowercase', () => {
    const r = applyParse('V', 'lowercase', {}, [['HELLO'], ['World']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('hello')
    expect(r.rows[1][0]).toBe('world')
  })

  it('uppercase converts to uppercase', () => {
    const r = applyParse('V', 'uppercase', {}, [['hello'], ['World']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('HELLO')
    expect(r.rows[1][0]).toBe('WORLD')
  })

  it('title-case capitalizes each word', () => {
    const r = applyParse('V', 'title-case', {}, [['hello world'], ['foo BAR baz']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('Hello World')
    expect(r.rows[1][0]).toBe('Foo Bar Baz')
  })

  it('slugify converts to url-safe slug', () => {
    const r = applyParse('V', 'slugify', {}, [['Hello World!'], ['Foo & Bar']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('hello-world')
    expect(r.rows[1][0]).toBe('foo-bar')
  })

  it('regex-replace replaces matches', () => {
    const r = applyParse('V', 'regex-replace', { pattern: '\\d+', replacement: '#' }, [['abc123def456']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('abc#def#')
  })

  it('regex-replace with no pattern returns value unchanged', () => {
    const r = applyParse('V', 'regex-replace', {}, [['hello']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('hello')
  })

  it('regex-replace with invalid regex returns value unchanged', () => {
    const r = applyParse('V', 'regex-replace', { pattern: '[invalid' }, [['hello']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('hello')
  })

  it('extract slices by position', () => {
    const r = applyParse('V', 'extract', { start: '1', end: '4' }, [['abcdef']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('bcd')
  })

  it('extract without end slices to end', () => {
    const r = applyParse('V', 'extract', { start: '2' }, [['abcdef']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('cdef')
  })

  it('pad-start pads with character', () => {
    const r = applyParse('V', 'pad-start', { length: '5', char: '0' }, [['42'], ['7']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('00042')
    expect(r.rows[1][0]).toBe('00007')
  })

  it('pad-end pads with character', () => {
    const r = applyParse('V', 'pad-end', { length: '5', char: '.' }, [['ab']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('ab...')
  })

  it('remove-diacritics strips accents', () => {
    const r = applyParse('V', 'remove-diacritics', {}, [['café'], ['naïve'], ['über']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('cafe')
    expect(r.rows[1][0]).toBe('naive')
    expect(r.rows[2][0]).toBe('uber')
  })

  it('split creates new columns', () => {
    const r = applyParse('Tags', 'split', { separator: ',' }, [['A', 'x,y,z'], ['B', 'a,b']], ['Name', 'Tags'], ['string', 'string'])
    expect(r.columns).toEqual(['Name', 'Tags_1', 'Tags_2', 'Tags_3'])
    expect(r.rows[0]).toEqual(['A', 'x', 'y', 'z'])
    expect(r.rows[1]).toEqual(['B', 'a', 'b', ''])
  })

  it('split with limit caps columns', () => {
    const r = applyParse('V', 'split', { separator: ',', limit: '2' }, [['a,b,c,d']], ['V'], ['string'])
    expect(r.columns).toEqual(['V_1', 'V_2'])
    expect(r.rows[0]).toEqual(['a', 'b'])
  })
})

describe('parse: numeric operations', () => {
  beforeEach(() => {
    useDataTransforms().reset()
  })

  it('round with decimals', () => {
    const r = applyParse('V', 'round', { decimals: '2' }, [['3.14159'], ['2.71828']], ['V'], ['number'])
    expect(r.rows[0][0]).toBe('3.14')
    expect(r.rows[1][0]).toBe('2.72')
  })

  it('round with no decimals param rounds to integer', () => {
    const r = applyParse('V', 'round', {}, [['3.7']], ['V'], ['number'])
    expect(r.rows[0][0]).toBe('4')
  })

  it('floor rounds down', () => {
    const r = applyParse('V', 'floor', {}, [['3.9'], ['-1.1']], ['V'], ['number'])
    expect(r.rows[0][0]).toBe('3')
    expect(r.rows[1][0]).toBe('-2')
  })

  it('ceil rounds up', () => {
    const r = applyParse('V', 'ceil', {}, [['3.1'], ['-1.9']], ['V'], ['number'])
    expect(r.rows[0][0]).toBe('4')
    expect(r.rows[1][0]).toBe('-1')
  })

  it('abs removes sign', () => {
    const r = applyParse('V', 'abs', {}, [['-42'], ['10']], ['V'], ['number'])
    expect(r.rows[0][0]).toBe('42')
    expect(r.rows[1][0]).toBe('10')
  })

  it('clamp constrains values', () => {
    const r = applyParse('V', 'clamp', { min: '10', max: '50' }, [['5'], ['30'], ['100']], ['V'], ['number'])
    expect(r.rows[0][0]).toBe('10')
    expect(r.rows[1][0]).toBe('30')
    expect(r.rows[2][0]).toBe('50')
  })

  it('log computes natural log', () => {
    const r = applyParse('V', 'log', {}, [['1'], [String(Math.E)]], ['V'], ['number'])
    expect(r.rows[0][0]).toBe('0')
    expect(Number(r.rows[1][0])).toBeCloseTo(1)
  })

  it('log returns unchanged for non-positive', () => {
    const r = applyParse('V', 'log', {}, [['0'], ['-5']], ['V'], ['number'])
    expect(r.rows[0][0]).toBe('0')
    expect(r.rows[1][0]).toBe('-5')
  })

  it('exp computes e^x', () => {
    const r = applyParse('V', 'exp', {}, [['0'], ['1']], ['V'], ['number'])
    expect(r.rows[0][0]).toBe('1')
    expect(Number(r.rows[1][0])).toBeCloseTo(Math.E)
  })

  it('normalize scales to 0-1', () => {
    const r = applyParse('V', 'normalize', {}, [['A', '10'], ['B', '50'], ['C', '30']], ['N', 'V'], ['string', 'number'])
    expect(r.rows[0][1]).toBe('0')
    expect(r.rows[1][1]).toBe('1')
    expect(r.rows[2][1]).toBe('0.5')
    expect(r.columnTypes[1]).toBe('number')
  })

  it('normalize with all same values returns 0', () => {
    const r = applyParse('V', 'normalize', {}, [['5'], ['5'], ['5']], ['V'], ['number'])
    expect(r.rows[0][0]).toBe('0')
  })

  it('standardize computes z-scores', () => {
    const r = applyParse('V', 'standardize', {}, [['10'], ['20'], ['30']], ['V'], ['number'])
    // mean=20, stddev≈8.165
    expect(Number(r.rows[0][0])).toBeCloseTo(-1.2247, 3)
    expect(Number(r.rows[1][0])).toBeCloseTo(0, 3)
    expect(Number(r.rows[2][0])).toBeCloseTo(1.2247, 3)
  })

  it('bin groups into buckets', () => {
    const r = applyParse('V', 'bin', { size: '10' }, [['3'], ['15'], ['27'], ['40']], ['V'], ['number'])
    expect(r.rows[0][0]).toBe('0')
    expect(r.rows[1][0]).toBe('10')
    expect(r.rows[2][0]).toBe('20')
    expect(r.rows[3][0]).toBe('40')
  })
})

describe('parse: date operations', () => {
  beforeEach(() => {
    useDataTransforms().reset()
  })

  it('extract-year gets year', () => {
    const r = applyParse('V', 'extract-year', {}, [['2024-03-15'], ['2023-12-01']], ['V'], ['date'])
    expect(r.rows[0][0]).toBe('2024')
    expect(r.rows[1][0]).toBe('2023')
    expect(r.columnTypes[0]).toBe('number')
  })

  it('extract-month gets month (1-12)', () => {
    const r = applyParse('V', 'extract-month', {}, [['2024-03-15'], ['2024-12-01']], ['V'], ['date'])
    expect(r.rows[0][0]).toBe('3')
    expect(r.rows[1][0]).toBe('12')
  })

  it('extract-day gets day of month', () => {
    const r = applyParse('V', 'extract-day', {}, [['2024-03-15'], ['2024-03-01']], ['V'], ['date'])
    expect(r.rows[0][0]).toBe('15')
    expect(r.rows[1][0]).toBe('1')
  })

  it('extract-weekday gets day name', () => {
    // 2024-03-15 is a Friday
    const r = applyParse('V', 'extract-weekday', {}, [['2024-03-15']], ['V'], ['date'])
    expect(r.rows[0][0]).toBe('Friday')
    expect(r.columnTypes[0]).toBe('string')
  })

  it('extract-hour gets hour', () => {
    const r = applyParse('V', 'extract-hour', {}, [['2024-03-15T14:30:00']], ['V'], ['date'])
    expect(r.rows[0][0]).toBe('14')
  })

  it('shift-date adds days', () => {
    const r = applyParse('V', 'shift-date', { amount: '5', unit: 'days' }, [['2024-03-15T00:00:00.000Z']], ['V'], ['date'])
    expect(r.rows[0][0]).toContain('2024-03-20')
  })

  it('shift-date adds months', () => {
    const r = applyParse('V', 'shift-date', { amount: '2', unit: 'months' }, [['2024-01-15T00:00:00.000Z']], ['V'], ['date'])
    expect(r.rows[0][0]).toContain('2024-03-15')
  })

  it('shift-date adds years', () => {
    const r = applyParse('V', 'shift-date', { amount: '-1', unit: 'years' }, [['2024-03-15T00:00:00.000Z']], ['V'], ['date'])
    expect(r.rows[0][0]).toContain('2023-03-15')
  })

  it('truncate-date to month', () => {
    const r = applyParse('V', 'truncate-date', { period: 'month' }, [['2024-03-15T14:30:00.000Z']], ['V'], ['date'])
    expect(r.rows[0][0]).toContain('2024-03-01')
  })

  it('truncate-date to year', () => {
    const r = applyParse('V', 'truncate-date', { period: 'year' }, [['2024-06-15T14:30:00.000Z']], ['V'], ['date'])
    expect(r.rows[0][0]).toContain('2024-01-01')
  })

  it('truncate-date to quarter', () => {
    const r = applyParse('V', 'truncate-date', { period: 'quarter' }, [['2024-05-15T00:00:00.000Z']], ['V'], ['date'])
    // May is Q2 → April 1
    expect(r.rows[0][0]).toContain('2024-04-01')
  })

  it('truncate-date to week', () => {
    // 2024-03-15 is Friday → start of week = Sunday 2024-03-10
    const r = applyParse('V', 'truncate-date', { period: 'week' }, [['2024-03-15T12:00:00.000Z']], ['V'], ['date'])
    expect(r.rows[0][0]).toContain('2024-03-10')
  })

  it('date-diff computes days between dates', () => {
    const r = applyParse('V', 'date-diff', { reference: '2024-03-01' }, [['2024-03-15'], ['2024-02-15']], ['V'], ['date'])
    expect(r.rows[0][0]).toBe('14')
    expect(r.rows[1][0]).toBe('-15')
    expect(r.columnTypes[0]).toBe('number')
  })
})

describe('parse: type incompatibility (error → null)', () => {
  beforeEach(() => {
    useDataTransforms().reset()
  })

  it('round on string column nullifies values', () => {
    const r = applyParse('V', 'round', { decimals: '2' }, [['hello'], ['world']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('')
    expect(r.rows[1][0]).toBe('')
  })

  it('floor on string column nullifies values', () => {
    const r = applyParse('V', 'floor', {}, [['hello']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('')
  })

  it('ceil on date column nullifies values', () => {
    const r = applyParse('V', 'ceil', {}, [['2024-03-15']], ['V'], ['date'])
    expect(r.rows[0][0]).toBe('')
  })

  it('abs on string column nullifies values', () => {
    const r = applyParse('V', 'abs', {}, [['hello']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('')
  })

  it('clamp on string column nullifies values', () => {
    const r = applyParse('V', 'clamp', { min: '0', max: '100' }, [['hello']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('')
  })

  it('log on string column nullifies values', () => {
    const r = applyParse('V', 'log', {}, [['hello']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('')
  })

  it('exp on string column nullifies values', () => {
    const r = applyParse('V', 'exp', {}, [['hello']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('')
  })

  it('normalize on string column nullifies values', () => {
    const r = applyParse('V', 'normalize', {}, [['hello'], ['world']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('')
    expect(r.rows[1][0]).toBe('')
  })

  it('standardize on date column nullifies values', () => {
    const r = applyParse('V', 'standardize', {}, [['2024-01-01'], ['2024-06-01']], ['V'], ['date'])
    expect(r.rows[0][0]).toBe('')
    expect(r.rows[1][0]).toBe('')
  })

  it('bin on string column nullifies values', () => {
    const r = applyParse('V', 'bin', { size: '10' }, [['hello']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('')
  })

  it('trim works on number column', () => {
    const r = applyParse('V', 'trim', {}, [[' 42 ']], ['V'], ['number'])
    expect(r.rows[0][0]).toBe('42')
    expect(r.columnTypes[0]).toBe('string')
  })

  it('lowercase works on number column', () => {
    const r = applyParse('V', 'lowercase', {}, [['42']], ['V'], ['number'])
    expect(r.rows[0][0]).toBe('42')
    expect(r.columnTypes[0]).toBe('string')
  })

  it('uppercase works on date column', () => {
    const r = applyParse('V', 'uppercase', {}, [['2024-01-01']], ['V'], ['date'])
    expect(r.rows[0][0]).toBe('2024-01-01')
    expect(r.columnTypes[0]).toBe('string')
  })

  it('slugify works on number column', () => {
    const r = applyParse('V', 'slugify', {}, [['42']], ['V'], ['number'])
    expect(r.rows[0][0]).toBe('42')
    expect(r.columnTypes[0]).toBe('string')
  })

  it('split works on number column', () => {
    const r = applyParse('V', 'split', { separator: '.' }, [['3.14']], ['V'], ['number'])
    expect(r.columns).toEqual(['V_1', 'V_2'])
    expect(r.rows[0]).toEqual(['3', '14'])
  })

  it('extract-year on string column nullifies values', () => {
    const r = applyParse('V', 'extract-year', {}, [['hello']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('')
  })

  it('extract-month on number column nullifies values', () => {
    const r = applyParse('V', 'extract-month', {}, [['42']], ['V'], ['number'])
    expect(r.rows[0][0]).toBe('')
  })

  it('shift-date on string column nullifies values', () => {
    const r = applyParse('V', 'shift-date', { amount: '5', unit: 'days' }, [['hello']], ['V'], ['string'])
    expect(r.rows[0][0]).toBe('')
  })

  it('parse-json on number column nullifies values', () => {
    const r = applyParse('V', 'parse-json', {}, [['42']], ['V'], ['number'])
    expect(r.rows[0][0]).toBe('')
  })

  it('type conversions accept all types (no error)', () => {
    // to-number on date should work (type conversion)
    const r1 = applyParse('V', 'to-number', {}, [['42']], ['V'], ['date'])
    expect(r1.rows[0][0]).toBe('42')

    useDataTransforms().reset()
    // to-string on number should work
    const r2 = applyParse('V', 'to-string', {}, [['42']], ['V'], ['number'])
    expect(r2.rows[0][0]).toBe('42')

    useDataTransforms().reset()
    // to-boolean on number should work
    const r3 = applyParse('V', 'to-boolean', {}, [['1']], ['V'], ['number'])
    expect(r3.rows[0][0]).toBe('true')
  })
})

describe('validateStep', () => {
  beforeEach(() => {
    useDataTransforms().reset()
  })

  it('returns null for valid parse step', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: 'parse' as const, config: { column: 'V', operation: 'round', decimals: '2' } }
    expect(validateStep(step, ['V'], ['number'])).toBeNull()
  })

  it('returns error for incompatible parse operation', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: 'parse' as const, config: { column: 'V', operation: 'round' } }
    const error = validateStep(step, ['V'], ['string'])
    expect(error).toContain('Round')
    expect(error).toContain('number')
    expect(error).toContain('string')
  })

  it('returns error when column not found', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: 'parse' as const, config: { column: 'Missing', operation: 'trim' } }
    expect(validateStep(step, ['V'], ['string'])).toContain('not found')
  })

  it('returns error for filter without column', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: 'filter' as const, config: {} }
    expect(validateStep(step, ['V'], ['string'])).toContain('No column')
  })

  it('returns error for sort without column', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: 'sort' as const, config: {} }
    expect(validateStep(step, ['V'], ['string'])).toContain('No column')
  })

  it('returns null for valid sort step', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: 'sort' as const, config: { column: 'V', direction: 'ascending' } }
    expect(validateStep(step, ['V'], ['number'])).toBeNull()
  })

  it('returns null for transpose (no validation needed)', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: 'transpose' as const, config: {} }
    expect(validateStep(step, ['V'], ['string'])).toBeNull()
  })

  it('returns null for type conversion on any column type', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: 'parse' as const, config: { column: 'V', operation: 'to-number' } }
    expect(validateStep(step, ['V'], ['string'])).toBeNull()
    expect(validateStep(step, ['V'], ['date'])).toBeNull()
    expect(validateStep(step, ['V'], ['number'])).toBeNull()
  })

  it('returns error for date operation on string column', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: 'parse' as const, config: { column: 'V', operation: 'extract-year' } }
    const error = validateStep(step, ['V'], ['string'])
    expect(error).toContain('date')
    expect(error).toContain('string')
  })

  it('returns null for string operation on number column (coerced)', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: 'parse' as const, config: { column: 'V', operation: 'trim' } }
    expect(validateStep(step, ['V'], ['number'])).toBeNull()
  })
})

describe('parse: edge cases', () => {
  beforeEach(() => {
    useDataTransforms().reset()
  })

  it('no-op when column missing', () => {
    const r = applyParse('Missing', 'trim', {}, [['hello']], ['Name'], ['string'])
    expect(r.rows[0][0]).toBe('hello')
    expect(r.columns).toEqual(['Name'])
  })

  it('no-op when operation missing', () => {
    const t = useDataTransforms()
    t.addStep('parse', { column: 'V' })
    const r = t.applyTransforms(['V'], [['hello']], ['string'])
    expect(r.rows[0][0]).toBe('hello')
  })

  it('incompatible step does not affect other columns', () => {
    const r = applyParse('V', 'round', { decimals: '2' }, [['hello', '42']], ['V', 'N'], ['string', 'number'])
    expect(r.rows[0][0]).toBe('') // nullified
    expect(r.rows[0][1]).toBe('42') // untouched
  })
})
