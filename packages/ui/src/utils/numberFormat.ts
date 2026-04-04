import { format as d3Format } from 'd3-format'

export interface NumberFormatConfig {
  prefix: string
  suffix: string
  decimals: string
  scale: string
  negStyle: string
  thousandsSep: boolean
}

export const DEFAULT_CONFIG: NumberFormatConfig = {
  prefix: '',
  suffix: '',
  decimals: '2',
  scale: 'none',
  negStyle: 'minus',
  thousandsSep: true,
}

/**
 * Build a pure d3-format specifier from config (no prefix/suffix).
 * The returned string is safe for `d3.format()`.
 */
export function configToD3(c: NumberFormatConfig): string {
  let s = ''
  if (c.negStyle === 'paren') {
    s += '('
  }
  if (c.thousandsSep) {
    s += ','
  }
  if (c.decimals === 'auto') {
    s += '~'
  }
  else {
    s += `.${c.decimals}`
  }
  s += c.scale === '%' ? '%' : 'f'
  return s
}

/**
 * Serialize config to a model value string.
 *
 * If prefix or suffix are set, uses pipe-delimited format: `prefix|d3spec|suffix`
 * Otherwise emits the plain d3 specifier for backward compatibility.
 */
export function configToModel(c: NumberFormatConfig): string {
  const d3Spec = configToD3(c)
  if (c.prefix || c.suffix) {
    return `${c.prefix}|${d3Spec}|${c.suffix}`
  }
  return d3Spec
}

/**
 * Parse a model value string back into config.
 *
 * Supports:
 * - Plain d3-format: `,.0f`, `(,.0f`
 * - Legacy paren: `(,.0f)`
 * - Pipe-delimited: `$|,.0f|`, `|,.0f|%`
 */
export function parseModelString(s: string): NumberFormatConfig {
  const c: NumberFormatConfig = { ...DEFAULT_CONFIG }
  if (!s) {
    return c
  }

  let d3Part = s
  if (s.includes('|')) {
    const parts = s.split('|')
    c.prefix = parts[0] ?? ''
    d3Part = parts[1] ?? ''
    c.suffix = parts[2] ?? ''
  }
  else {
    c.prefix = ''
    c.suffix = ''
  }

  // Parse the d3 specifier part
  // Handle paren style (d3 uses '(' prefix; also handle legacy '(…)' format)
  if (d3Part.startsWith('(')) {
    c.negStyle = 'paren'
    d3Part = d3Part.slice(1)
    if (d3Part.endsWith(')')) {
      d3Part = d3Part.slice(0, -1)
    }
  }

  c.thousandsSep = d3Part.includes(',')
  d3Part = d3Part.replace(',', '')

  if (d3Part.includes('~')) {
    c.decimals = 'auto'
  }
  else {
    const decMatch = d3Part.match(/\.(\d+)/)
    if (decMatch) {
      c.decimals = decMatch[1]
    }
  }

  if (d3Part.endsWith('%')) {
    c.scale = '%'
  }
  else {
    c.scale = 'none'
  }

  return c
}

/**
 * Format a sample number for preview display.
 * Uses the core d3 format, then wraps with prefix/suffix/negative styling.
 */
export function formatSample(value: number, c: NumberFormatConfig): string {
  try {
    const core = configToD3(c)
    const formatted = d3Format(core)(Math.abs(value))
    const full = `${c.prefix}${formatted}${c.suffix}`

    if (value < 0) {
      return c.negStyle === 'paren' ? `(${full})` : `\u2212${full}`
    }
    return full
  }
  catch {
    return String(value)
  }
}
