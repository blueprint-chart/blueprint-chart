import { format as d3Format } from 'd3-format'
import { configToD3, configToModel, parseModelString, formatSample, DEFAULT_CONFIG, type NumberFormatConfig } from './numberFormat'

describe('configToD3', () => {
  it('produces a valid d3-format string for the default config', () => {
    const s = configToD3(DEFAULT_CONFIG)
    expect(() => d3Format(s)).not.toThrow()
    expect(s).toBe(',.2f')
  })

  it('handles thousands separator off', () => {
    const s = configToD3({ ...DEFAULT_CONFIG, thousandsSep: false })
    expect(s).toBe('.2f')
    expect(() => d3Format(s)).not.toThrow()
  })

  it('handles auto decimals (tilde, no dot)', () => {
    const s = configToD3({ ...DEFAULT_CONFIG, decimals: 'auto' })
    expect(s).toBe(',~f')
    expect(s).not.toContain('.')
    expect(() => d3Format(s)).not.toThrow()
  })

  it('handles percentage scale', () => {
    const s = configToD3({ ...DEFAULT_CONFIG, scale: '%', thousandsSep: false, decimals: '0' })
    expect(s).toBe('.0%')
    expect(() => d3Format(s)).not.toThrow()
  })

  it('handles paren negative style (prefix only, no closing paren)', () => {
    const s = configToD3({ ...DEFAULT_CONFIG, negStyle: 'paren' })
    expect(s).toBe('(,.2f')
    expect(() => d3Format(s)).not.toThrow()
  })

  it('never includes prefix or suffix in the d3 string', () => {
    const s = configToD3({ ...DEFAULT_CONFIG, prefix: '$', suffix: '%' })
    expect(s).toBe(',.2f')
    expect(s).not.toContain('$')
  })
})

describe('configToModel', () => {
  it('emits plain d3 format when no prefix/suffix', () => {
    expect(configToModel(DEFAULT_CONFIG)).toBe(',.2f')
  })

  it('emits pipe-delimited format with prefix', () => {
    expect(configToModel({ ...DEFAULT_CONFIG, prefix: '$' })).toBe('$|,.2f|')
  })

  it('emits pipe-delimited format with suffix', () => {
    expect(configToModel({ ...DEFAULT_CONFIG, suffix: '%', decimals: '0', thousandsSep: false })).toBe('|.0f|%')
  })

  it('emits pipe-delimited format with both', () => {
    expect(configToModel({ ...DEFAULT_CONFIG, prefix: '$', suffix: 'M' })).toBe('$|,.2f|M')
  })
})

describe('parseModelString', () => {
  it('returns defaults for empty string', () => {
    expect(parseModelString('')).toEqual(DEFAULT_CONFIG)
  })

  it('round-trips configToModel for configs without prefix/suffix', () => {
    const configs: NumberFormatConfig[] = [
      { ...DEFAULT_CONFIG },
      { ...DEFAULT_CONFIG, thousandsSep: false, decimals: '1' },
      { ...DEFAULT_CONFIG, scale: '%', thousandsSep: false, decimals: '0' },
      { ...DEFAULT_CONFIG, negStyle: 'paren' },
      { ...DEFAULT_CONFIG, decimals: 'auto' },
    ]
    for (const c of configs) {
      const model = configToModel(c)
      const parsed = parseModelString(model)
      expect(parsed).toEqual({ ...c, prefix: '', suffix: '' })
    }
  })

  it('round-trips configToModel for configs with prefix/suffix', () => {
    const configs: NumberFormatConfig[] = [
      { ...DEFAULT_CONFIG, prefix: '$' },
      { ...DEFAULT_CONFIG, suffix: '%', decimals: '0', thousandsSep: false },
      { ...DEFAULT_CONFIG, prefix: '$', suffix: 'M' },
    ]
    for (const c of configs) {
      const model = configToModel(c)
      const parsed = parseModelString(model)
      expect(parsed).toEqual(c)
    }
  })

  it('parses ,.0f correctly', () => {
    const c = parseModelString(',.0f')
    expect(c.thousandsSep).toBe(true)
    expect(c.decimals).toBe('0')
    expect(c.scale).toBe('none')
    expect(c.negStyle).toBe('minus')
    expect(c.prefix).toBe('')
    expect(c.suffix).toBe('')
  })

  it('parses (,.0f as paren negative style', () => {
    const c = parseModelString('(,.0f')
    expect(c.negStyle).toBe('paren')
    expect(c.thousandsSep).toBe(true)
    expect(c.decimals).toBe('0')
  })

  it('parses legacy (,.0f) with closing paren', () => {
    const c = parseModelString('(,.0f)')
    expect(c.negStyle).toBe('paren')
    expect(c.thousandsSep).toBe(true)
    expect(c.decimals).toBe('0')
    expect(c.scale).toBe('none')
  })

  it('parses pipe format |,.0f|%', () => {
    const c = parseModelString('|,.0f|%')
    expect(c.prefix).toBe('')
    expect(c.suffix).toBe('%')
    expect(c.thousandsSep).toBe(true)
    expect(c.decimals).toBe('0')
  })

  it('parses pipe format $|,.0f|', () => {
    const c = parseModelString('$|,.0f|')
    expect(c.prefix).toBe('$')
    expect(c.suffix).toBe('')
  })
})

describe('formatSample', () => {
  it('formats a positive number with defaults', () => {
    expect(formatSample(1234.5, DEFAULT_CONFIG)).toBe('1,234.50')
  })

  it('formats a negative number with minus sign', () => {
    const result = formatSample(-1234.5, DEFAULT_CONFIG)
    expect(result).toContain('\u2212')
    expect(result).toContain('1,234.50')
  })

  it('formats with paren negative style', () => {
    const result = formatSample(-1234.5, { ...DEFAULT_CONFIG, negStyle: 'paren' })
    expect(result).toMatch(/^\(.+\)$/)
  })

  it('formats with suffix', () => {
    const result = formatSample(12, { ...DEFAULT_CONFIG, suffix: '%', decimals: '0', thousandsSep: false })
    expect(result).toBe('12%')
  })

  it('formats with prefix', () => {
    const result = formatSample(1234, { ...DEFAULT_CONFIG, prefix: '$', decimals: '0' })
    expect(result).toBe('$1,234')
  })

  it('formats percentage via d3 scale', () => {
    const result = formatSample(0.123, { ...DEFAULT_CONFIG, scale: '%', thousandsSep: false, decimals: '0' })
    expect(result).toBe('12%')
  })

  it('does not throw for any config', () => {
    const configs: NumberFormatConfig[] = [
      { ...DEFAULT_CONFIG },
      { ...DEFAULT_CONFIG, prefix: '$', suffix: 'M' },
      { ...DEFAULT_CONFIG, negStyle: 'paren' },
      { ...DEFAULT_CONFIG, scale: '%', thousandsSep: false, decimals: '0' },
      { ...DEFAULT_CONFIG, suffix: '%', decimals: '0', thousandsSep: false },
    ]
    for (const c of configs) {
      expect(() => formatSample(1234, c)).not.toThrow()
      expect(() => formatSample(-1234, c)).not.toThrow()
      expect(() => formatSample(0, c)).not.toThrow()
    }
  })
})
