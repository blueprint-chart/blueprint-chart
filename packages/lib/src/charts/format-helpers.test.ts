import * as d3 from 'd3'
import { parseNumberFormat, buildNumberFormatter, safeD3Spec } from './format-helpers'

describe('safeD3Spec', () => {
  it('passes through valid d3-format strings', () => {
    const valid = [',.0f', '.1%', ',~f', ',.2f', '.1f']
    for (const fmt of valid) {
      expect(() => d3.format(safeD3Spec(fmt))).not.toThrow()
    }
  })

  it('fixes legacy paren format (,.0f) → (,.0f', () => {
    const fixed = safeD3Spec('(,.0f)')
    expect(fixed).toBe('(,.0f')
    expect(() => d3.format(fixed)).not.toThrow()
  })

  it('does not alter already-correct paren format', () => {
    expect(safeD3Spec('(,.0f')).toBe('(,.0f')
  })

  it('returns empty string for falsy input', () => {
    expect(safeD3Spec('')).toBe('')
  })
})

describe('parseNumberFormat', () => {
  it('parses plain d3 format (no pipes)', () => {
    const r = parseNumberFormat(',.0f')
    expect(r).toEqual({ prefix: '', d3Spec: ',.0f', suffix: '' })
  })

  it('parses pipe-delimited format with prefix', () => {
    const r = parseNumberFormat('$|,.0f|')
    expect(r).toEqual({ prefix: '$', d3Spec: ',.0f', suffix: '' })
  })

  it('parses pipe-delimited format with suffix', () => {
    const r = parseNumberFormat('|,.0f|%')
    expect(r).toEqual({ prefix: '', d3Spec: ',.0f', suffix: '%' })
  })

  it('parses pipe-delimited format with both', () => {
    const r = parseNumberFormat('$|,.2f|M')
    expect(r).toEqual({ prefix: '$', d3Spec: ',.2f', suffix: 'M' })
  })

  it('handles legacy paren format in pipe syntax', () => {
    const r = parseNumberFormat('|(,.0f)|')
    expect(r.d3Spec).toBe('(,.0f')
  })

  it('handles legacy paren format without pipes', () => {
    const r = parseNumberFormat('(,.0f)')
    expect(r.d3Spec).toBe('(,.0f')
    expect(r.prefix).toBe('')
    expect(r.suffix).toBe('')
  })

  it('handles empty string', () => {
    const r = parseNumberFormat('')
    expect(r).toEqual({ prefix: '', d3Spec: '', suffix: '' })
  })

  it('handles null/undefined', () => {
    expect(parseNumberFormat(null as unknown as string)).toEqual({ prefix: '', d3Spec: '', suffix: '' })
    expect(parseNumberFormat(undefined as unknown as string)).toEqual({ prefix: '', d3Spec: '', suffix: '' })
  })
})

describe('buildNumberFormatter', () => {
  it('returns null for empty format', () => {
    expect(buildNumberFormatter('')).toBeNull()
    expect(buildNumberFormatter(null as unknown as string)).toBeNull()
  })

  it('formats with plain d3 spec', () => {
    const fn = buildNumberFormatter(',.0f')!
    expect(fn(1234)).toBe('1,234')
  })

  it('formats with suffix via pipe syntax', () => {
    const fn = buildNumberFormatter('|,.0f|%')!
    expect(fn(12)).toBe('12%')
  })

  it('formats with prefix via pipe syntax', () => {
    const fn = buildNumberFormatter('$|,.0f|')!
    expect(fn(1234)).toBe('$1,234')
  })

  it('formats with both prefix and suffix', () => {
    const fn = buildNumberFormatter('$|,.2f|M')!
    expect(fn(1.5)).toBe('$1.50M')
  })

  it('handles paren negative with prefix/suffix', () => {
    const fn = buildNumberFormatter('$|(,.0f|')!
    expect(fn(-1234)).toBe('$(1,234)')
    expect(fn(1234)).toBe('$1,234')
  })

  it('handles legacy paren format without pipes', () => {
    const fn = buildNumberFormatter('(,.0f)')!
    expect(fn(-1234)).toBe('(1,234)')
  })
})

import { percentValueLabel } from './format-helpers'

describe('percentValueLabel', () => {
  it('renders an integer percentage of the total', () => {
    expect(percentValueLabel(10, 60)).toBe('17%')
    expect(percentValueLabel(30, 60)).toBe('50%')
  })
  it('returns 0% for a non-positive total', () => {
    expect(percentValueLabel(5, 0)).toBe('0%')
    expect(percentValueLabel(5, -1)).toBe('0%')
  })
})
