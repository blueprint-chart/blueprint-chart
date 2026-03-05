import * as d3 from 'd3'

export interface ParsedNumberFormat {
  prefix: string
  d3Spec: string
  suffix: string
}

/**
 * Fix legacy d3-format specifiers.
 * Converts wrapping parens `(,.0f)` to d3-correct prefix-only `(,.0f`.
 */
export function safeD3Spec(fmt: string): string {
  if (!fmt) {
    return fmt
  }
  if (fmt.startsWith('(') && fmt.endsWith(')')) {
    return fmt.slice(0, -1)
  }
  return fmt
}

/** @deprecated Use safeD3Spec instead */
export const safeFormat = safeD3Spec

/**
 * Parse a number format string into its components.
 *
 * Supports two formats:
 * - Plain d3-format: `,.0f`, `(,.2f`
 * - Pipe-delimited with prefix/suffix: `$|,.0f|`, `|,.0f|%`, `$|,.2f|M`
 *
 * Legacy paren format `(,.0f)` is auto-corrected to `(,.0f`.
 */
export function parseNumberFormat(fmt: string): ParsedNumberFormat {
  if (!fmt) {
    return { prefix: '', d3Spec: '', suffix: '' }
  }

  if (fmt.includes('|')) {
    const parts = fmt.split('|')
    return {
      prefix: parts[0] ?? '',
      d3Spec: safeD3Spec(parts[1] ?? ''),
      suffix: parts[2] ?? '',
    }
  }

  return { prefix: '', d3Spec: safeD3Spec(fmt), suffix: '' }
}

/**
 * Build a tick formatter function from a number format string.
 * Returns null if the format string is empty.
 *
 * Handles prefix/suffix via pipe syntax: `$|,.0f|M` → "$1,234M"
 */
export function buildNumberFormatter(fmt: string): ((value: number | { valueOf(): number }) => string) | null {
  if (!fmt) {
    return null
  }

  const { prefix, d3Spec, suffix } = parseNumberFormat(fmt)

  if (!d3Spec) {
    return null
  }

  const d3Fn = d3.format(d3Spec)

  if (!prefix && !suffix) {
    return d3Fn as (value: number | { valueOf(): number }) => string
  }

  return (value: number | { valueOf(): number }) => `${prefix}${d3Fn(value)}${suffix}`
}
