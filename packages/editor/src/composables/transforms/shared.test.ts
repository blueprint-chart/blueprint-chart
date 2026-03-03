import { describe, it, expect } from 'vitest'
import { parseNumeric, compareValues, resolveColumns } from './shared'

describe('parseNumeric', () => {
  it('parses plain numbers', () => {
    expect(parseNumeric('42')).toBe(42)
    expect(parseNumeric('3.14')).toBeCloseTo(3.14)
  })

  it('strips currency symbols', () => {
    expect(parseNumeric('$1,234.50')).toBe(1234.5)
    expect(parseNumeric('€99')).toBe(99)
    expect(parseNumeric('£1,000')).toBe(1000)
    expect(parseNumeric('¥500')).toBe(500)
    expect(parseNumeric('₹2,500')).toBe(2500)
  })

  it('strips percentage signs and commas', () => {
    expect(parseNumeric('75%')).toBe(75)
    expect(parseNumeric('1,000,000')).toBe(1000000)
  })

  it('trims whitespace', () => {
    expect(parseNumeric('  42  ')).toBe(42)
  })

  it('returns 0 for non-numeric strings', () => {
    expect(parseNumeric('abc')).toBe(0)
    expect(parseNumeric('')).toBe(0)
  })
})

describe('compareValues', () => {
  it('compares numbers numerically', () => {
    expect(compareValues('10', '2', 'number')).toBeGreaterThan(0)
    expect(compareValues('2', '10', 'number')).toBeLessThan(0)
    expect(compareValues('5', '5', 'number')).toBe(0)
  })

  it('compares numbers with currency formatting', () => {
    expect(compareValues('$100', '$50', 'number')).toBeGreaterThan(0)
  })

  it('compares dates chronologically', () => {
    expect(compareValues('2024-03-15', '2024-01-01', 'date')).toBeGreaterThan(0)
    expect(compareValues('2024-01-01', '2024-03-15', 'date')).toBeLessThan(0)
  })

  it('compares strings lexicographically', () => {
    expect(compareValues('apple', 'banana', 'string')).toBeLessThan(0)
    expect(compareValues('banana', 'apple', 'string')).toBeGreaterThan(0)
    expect(compareValues('same', 'same', 'string')).toBe(0)
  })
})

describe('resolveColumns', () => {
  it('resolves comma-separated columns', () => {
    expect(resolveColumns({ columns: 'A,B,C' })).toEqual(['A', 'B', 'C'])
  })

  it('trims whitespace from column names', () => {
    expect(resolveColumns({ columns: ' A , B ' })).toEqual(['A', 'B'])
  })

  it('filters empty entries', () => {
    expect(resolveColumns({ columns: 'A,,B,' })).toEqual(['A', 'B'])
  })

  it('resolves single column key', () => {
    expect(resolveColumns({ column: 'Name' })).toEqual(['Name'])
  })

  it('prefers columns over column', () => {
    expect(resolveColumns({ columns: 'A,B', column: 'C' })).toEqual(['A', 'B'])
  })

  it('returns empty array when no config', () => {
    expect(resolveColumns({})).toEqual([])
  })
})
