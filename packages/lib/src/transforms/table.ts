import type { ColumnType } from '../recommendations/types'
import type { ChartData } from '../charts/types'
import type { TransformResult } from './types'
import { stripDigitGroupSpaces } from '../charts/number-parse'
import { quoteDslString } from '../dsl/quoting'

const DATE_PATTERNS = [
  /^\d{4}-\d{2}-\d{2}$/,
  /^\d{4}-\d{2}$/,
  /^\d{4}$/,
  /^\d{1,2}\/\d{1,2}\/\d{2,4}$/,
  /^\d{1,2}-\d{1,2}-\d{2,4}$/,
  /^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}$/i,
  /^\d{4}\/\d{2}\/\d{2}$/,
  /^\d{4}\/\d{2}$/,
  /^Q[1-4]\s+\d{4}$/,
]

export function isDateValue(value: string): boolean {
  if (!value) {
    return false
  }
  for (const pattern of DATE_PATTERNS) {
    if (pattern.test(value)) {
      // YYYY-MM and YYYY are valid date-like patterns but Date.parse may not handle them
      // so we accept them directly when the regex matches
      if (/^\d{4}(-\d{2})?$/.test(value) || /^\d{4}\/\d{2}$/.test(value) || /^Q[1-4]\s+\d{4}$/.test(value)) {
        return true
      }
      return !Number.isNaN(Date.parse(value))
    }
  }
  return false
}

/**
 * Strip comparison/approximation prefixes (<, >, ≤, ≥, ~) from numeric values.
 * Returns the cleaned string (e.g. "<1" → "1", "~50" → "50").
 * Non-numeric strings are returned unchanged.
 */
export function cleanNumericValue(value: string): string {
  const match = value.match(/^[<>≤≥~]\s*(.+)$/)
  if (match) {
    const inner = stripDigitGroupSpaces(match[1]).replace(/[,%$€£¥₹]/g, '').trim()
    if (inner.length > 0 && !Number.isNaN(Number(inner))) {
      return match[1].trim()
    }
  }
  return value
}

export function isNumberValue(value: string): boolean {
  if (!value) {
    return false
  }
  const cleaned = stripDigitGroupSpaces(cleanNumericValue(value)).replace(/[,%$€£¥₹]/g, '').trim()
  return cleaned.length > 0 && !Number.isNaN(Number(cleaned))
}

export function detectColumnTypes(columns: string[], rows: string[][]): ColumnType[] {
  return columns.map((_, ci) => {
    const values = rows.map(r => r[ci] ?? '').filter(v => v.length > 0)
    if (values.length === 0) {
      return 'string'
    }
    if (values.every(isDateValue)) {
      return 'date'
    }
    if (values.every(isNumberValue)) {
      return 'number'
    }
    return 'string'
  })
}

/** Read a `data { … }` body into the table the pipeline operates on. */
export function parseBpcData(raw: string): TransformResult {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length === 0) {
    return { columns: [], rows: [], columnTypes: [] }
  }

  const seriesMatch = lines[0]?.match(/^series\s*=\s*(.+)$/)
  if (seriesMatch) {
    const raw = seriesMatch[1].trim()
    // Individually quoted names: series = "A","B","C"
    // Single quoted string with commas: series = "A,B,C"
    const seriesNames = raw.includes('","')
      ? raw.split(',').map(s => s.trim().replace(/^"|"$/g, ''))
      : raw.replace(/^"|"$/g, '').split(',').map(s => s.trim())
    const columns = ['label', ...seriesNames]
    const rows: string[][] = []
    for (let i = 1; i < lines.length; i++) {
      // New format: "Label" = 40,44,42
      const matchNew = lines[i].match(/^"([^"]*)"\s*=\s*([^"]+)$/)
      // Legacy format: "Label" = "40,44,42"
      const matchOld = lines[i].match(/^"([^"]*)"\s*=\s*"([^"]*)"$/)
      const match = matchOld ?? matchNew
      if (match) {
        rows.push([match[1], ...match[2].split(',').map(v => v.trim())])
      }
    }
    const columnTypes = detectColumnTypes(columns, rows)
    return { columns, rows, columnTypes }
  }

  const columns = ['label', 'value']
  const rows: string[][] = []
  for (const line of lines) {
    const match = line.match(/^"([^"]*)"\s*=\s*(.+)$/)
    if (match) {
      rows.push([match[1], match[2].replace(/%$/, '').trim()])
    }
  }
  const columnTypes = detectColumnTypes(columns, rows)
  return { columns, rows, columnTypes }
}

function formatValue(v: string): string {
  if (/^-?\d+(\.\d+)?%?$/.test(v)) {
    return v
  }
  return quoteDslString(v)
}

/** Write a table back as a `data { … }` body. */
export function serializeTableData(cols: string[], rows: string[][]): string {
  if (cols.length <= 2) {
    return rows
      .map((row) => {
        const label = row[0] ?? ''
        const value = row[1] ?? ''
        return `${quoteDslString(label)} = ${formatValue(value)}`
      })
      .join('\n')
  }

  const seriesNames = cols.slice(1)
  const header = `series = ${seriesNames.map(quoteDslString).join(',')}`
  const lines = rows.map((row) => {
    const label = row[0] ?? ''
    const values = row.slice(1).map(v => formatValue(v ?? '')).join(',')
    return `${quoteDslString(label)} = ${values}`
  })
  return [header, ...lines].join('\n')
}

/**
 * Rebuild a table from parsed chart data, for the steps that run on top of an
 * already-resolved chart (a scene's own transforms). Missing cells come back
 * empty so a hole stays a hole instead of reading as the string "undefined".
 */
export function chartDataToTable(data: ChartData): TransformResult {
  const cell = (v: number | undefined) => (v == null || !Number.isFinite(v) ? '' : String(v))
  const columns = ['label', ...(data.series ? data.series.map(s => s.name) : ['value'])]
  const rows = data.labels.map((label, i) => [
    label,
    ...(data.series ? data.series.map(s => cell(s.values[i])) : [cell(data.values[i])]),
  ])
  return { columns, rows, columnTypes: detectColumnTypes(columns, rows) }
}
