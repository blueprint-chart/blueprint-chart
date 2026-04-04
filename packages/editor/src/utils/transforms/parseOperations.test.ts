import { parseOperations, parseOperationMap, isTypeCompatible, getOutputType } from './parseOperations'

describe('parseOperations registry', () => {
  it('has all expected operations', () => {
    expect(parseOperations.length).toBeGreaterThanOrEqual(30)
  })

  it('has unique ids', () => {
    const ids = parseOperations.map(o => o.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('each operation has required fields', () => {
    for (const op of parseOperations) {
      expect(op.id).toBeTruthy()
      expect(op.label).toBeTruthy()
      expect(op.description).toBeTruthy()
      expect(['type', 'string', 'numeric', 'date']).toContain(op.category)
      expect(op.accepts.length).toBeGreaterThan(0)
      expect(['string', 'number', 'date']).toContain(op.outputType)
    }
  })

  it('type conversions accept all types', () => {
    const typeOps = parseOperations.filter(o => o.category === 'type' && o.id !== 'parse-json')
    for (const op of typeOps) {
      expect(op.accepts).toContain('string')
      expect(op.accepts).toContain('number')
      expect(op.accepts).toContain('date')
    }
  })

  it('string operations accept all types', () => {
    const stringOps = parseOperations.filter(o => o.category === 'string')
    for (const op of stringOps) {
      expect(op.accepts).toContain('string')
      expect(op.accepts).toContain('number')
      expect(op.accepts).toContain('date')
    }
  })

  it('numeric operations accept only number', () => {
    const numericOps = parseOperations.filter(o => o.category === 'numeric')
    for (const op of numericOps) {
      expect(op.accepts).toEqual(['number'])
    }
  })

  it('date operations accept only date', () => {
    const dateOps = parseOperations.filter(o => o.category === 'date')
    for (const op of dateOps) {
      expect(op.accepts).toEqual(['date'])
    }
  })

  it('parse-json only accepts string', () => {
    const op = parseOperationMap.get('parse-json')
    expect(op?.accepts).toEqual(['string'])
  })
})

describe('parseOperationMap', () => {
  it('contains all operations from the array', () => {
    expect(parseOperationMap.size).toBe(parseOperations.length)
  })

  it('maps id to correct operation', () => {
    const trim = parseOperationMap.get('trim')
    expect(trim?.label).toBe('Trim')
    expect(trim?.category).toBe('string')
  })

  it('returns undefined for unknown id', () => {
    expect(parseOperationMap.get('nonexistent')).toBeUndefined()
  })
})

describe('isTypeCompatible', () => {
  it('returns true for compatible type', () => {
    expect(isTypeCompatible('round', 'number')).toBe(true)
    expect(isTypeCompatible('trim', 'string')).toBe(true)
    expect(isTypeCompatible('extract-year', 'date')).toBe(true)
  })

  it('returns false for incompatible type', () => {
    expect(isTypeCompatible('round', 'string')).toBe(false)
    expect(isTypeCompatible('extract-year', 'string')).toBe(false)
    expect(isTypeCompatible('extract-month', 'number')).toBe(false)
  })

  it('returns true for type conversions on any type', () => {
    expect(isTypeCompatible('to-number', 'string')).toBe(true)
    expect(isTypeCompatible('to-number', 'date')).toBe(true)
    expect(isTypeCompatible('to-number', 'number')).toBe(true)
  })

  it('returns true for string ops on any type', () => {
    expect(isTypeCompatible('trim', 'number')).toBe(true)
    expect(isTypeCompatible('trim', 'date')).toBe(true)
    expect(isTypeCompatible('lowercase', 'number')).toBe(true)
  })

  it('returns false for unknown operation', () => {
    expect(isTypeCompatible('nonexistent', 'string')).toBe(false)
  })
})

describe('getOutputType', () => {
  it('returns correct output type for type conversions', () => {
    expect(getOutputType('to-number')).toBe('number')
    expect(getOutputType('to-string')).toBe('string')
    expect(getOutputType('to-date')).toBe('date')
    expect(getOutputType('to-boolean')).toBe('string')
  })

  it('returns correct output type for numeric ops', () => {
    expect(getOutputType('round')).toBe('number')
    expect(getOutputType('normalize')).toBe('number')
  })

  it('returns correct output type for date extraction', () => {
    expect(getOutputType('extract-year')).toBe('number')
    expect(getOutputType('extract-weekday')).toBe('string')
    expect(getOutputType('shift-date')).toBe('date')
  })

  it('returns string for unknown operation', () => {
    expect(getOutputType('nonexistent')).toBe('string')
  })
})
