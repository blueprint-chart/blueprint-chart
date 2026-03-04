import { describe, it, expect } from 'vitest'
import { checkBenford } from './useBenfordCheck'
import type { ColumnType } from './useDataParser'

// Generate data that follows Benford's distribution
function benfordData(n: number): string[] {
  const expected = [0, 0.301, 0.176, 0.125, 0.097, 0.079, 0.067, 0.058, 0.051, 0.046]
  const result: string[] = []
  for (let d = 1; d <= 9; d++) {
    const count = Math.round(expected[d] * n)
    for (let i = 0; i < count; i++) {
      result.push(`${d}${Math.floor(Math.random() * 100)}`)
    }
  }
  // pad to n
  while (result.length < n) { result.push('100') }
  return result.slice(0, n)
}

// Generate uniform leading digits
function uniformData(n: number): string[] {
  const result: string[] = []
  for (let i = 0; i < n; i++) {
    const d = (i % 9) + 1
    result.push(`${d}00`)
  }
  return result
}

describe('checkBenford', () => {
  it('passes for data following Benford distribution', () => {
    const values = benfordData(100)
    const columns = ['Category', 'Amount']
    const rows = values.map((v, i) => [`item${i}`, v])
    const columnTypes: ColumnType[] = ['string', 'number']

    const result = checkBenford(columns, rows, columnTypes)
    expect(result.pass).toBe(true)
    expect(result.suspicious).toEqual([])
    expect(result.eligible).toBe(true)
  })

  it('flags uniform distribution as suspicious', () => {
    const values = uniformData(90)
    const columns = ['Category', 'Amount']
    const rows = values.map((v, i) => [`item${i}`, v])
    const columnTypes: ColumnType[] = ['string', 'number']

    const result = checkBenford(columns, rows, columnTypes)
    expect(result.pass).toBe(false)
    expect(result.suspicious).toContain('Amount')
    expect(result.eligible).toBe(true)
  })

  it('skips non-numeric columns', () => {
    const columns = ['Name', 'Label']
    const rows = Array.from({ length: 20 }, (_, i) => [`item${i}`, `label${i}`])
    const columnTypes: ColumnType[] = ['string', 'string']

    const result = checkBenford(columns, rows, columnTypes)
    expect(result.pass).toBe(true)
    expect(result.suspicious).toEqual([])
    expect(result.eligible).toBe(false)
  })

  it('skips columns with fewer than 10 values', () => {
    const columns = ['Amount']
    const rows = Array.from({ length: 5 }, (_, i) => [`${(i % 9) + 1}00`])
    const columnTypes: ColumnType[] = ['number']

    const result = checkBenford(columns, rows, columnTypes)
    expect(result.pass).toBe(true)
    expect(result.suspicious).toEqual([])
    expect(result.eligible).toBe(false)
  })

  it('returns pass when no numeric columns exist', () => {
    const columns = ['Name']
    const rows = [['Alice'], ['Bob']]
    const columnTypes: ColumnType[] = ['string']

    const result = checkBenford(columns, rows, columnTypes)
    expect(result.pass).toBe(true)
    expect(result.suspicious).toEqual([])
    expect(result.eligible).toBe(false)
  })

  it('handles negative numbers (uses absolute value)', () => {
    const values = benfordData(100).map((v, i) => i % 3 === 0 ? `-${v}` : v)
    const columns = ['Amount']
    const rows = values.map(v => [v])
    const columnTypes: ColumnType[] = ['number']

    const result = checkBenford(columns, rows, columnTypes)
    expect(result.pass).toBe(true)
  })

  it('detects numeric columns even when typed as string', () => {
    const values = uniformData(90)
    const columns = ['Amount']
    const rows = values.map(v => [v])
    const columnTypes: ColumnType[] = ['string']

    const result = checkBenford(columns, rows, columnTypes)
    expect(result.pass).toBe(false)
    expect(result.suspicious).toContain('Amount')
  })

  it('handles zero values (skips them)', () => {
    const values = benfordData(100)
    // Replace some with zeros
    values[0] = '0'
    values[1] = '0'
    values[2] = '0'
    const columns = ['Amount']
    const rows = values.map(v => [v])
    const columnTypes: ColumnType[] = ['number']

    const result = checkBenford(columns, rows, columnTypes)
    expect(result.pass).toBe(true)
  })
})
