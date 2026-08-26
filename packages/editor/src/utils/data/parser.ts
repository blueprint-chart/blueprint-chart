import type { TransformResult } from '@blueprint-chart/lib'
import {
  cleanNumericValue,
  detectColumnTypes,
  isDateValue,
  isNumberValue,
  parseBpcData,
} from '@blueprint-chart/lib'

export type { ColumnType } from '@blueprint-chart/lib'
export { cleanNumericValue, detectColumnTypes, isDateValue, isNumberValue, parseBpcData }

export type ParsedData = TransformResult

export function detectDelimiter(raw: string): string {
  const firstLine = raw.split('\n')[0] ?? ''
  const tabs = (firstLine.match(/\t/g) ?? []).length
  const commas = (firstLine.match(/,/g) ?? []).length
  return tabs >= commas ? '\t' : ','
}

function splitRow(line: string, delimiter: string): string[] {
  if (delimiter === '\t') {
    return line.split('\t').map(c => c.trim())
  }

  const cells: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      }
      else {
        inQuotes = !inQuotes
      }
    }
    else if (ch === delimiter && !inQuotes) {
      cells.push(current.trim())
      current = ''
    }
    else {
      current += ch
    }
  }
  cells.push(current.trim())
  return cells
}

export interface ParseDelimitedOptions {
  firstRowIsHeader?: boolean
  delimiter?: 'auto' | ',' | '\t' | ';' | '|'
  decimalSeparator?: '.' | ','
  trimWhitespace?: boolean
}

export function serializeDelimited(columns: string[], rows: string[][], delimiter: string = '\t'): string {
  const escape = (cell: string) => {
    if (delimiter === '\t') {
      return cell
    }
    if (cell.includes(delimiter) || cell.includes('"') || cell.includes('\n')) {
      return `"${cell.replace(/"/g, '""')}"`
    }
    return cell
  }
  const header = columns.map(escape).join(delimiter)
  const body = rows.map(row => row.map(escape).join(delimiter))
  return [header, ...body].join('\n')
}

export function parseDelimited(raw: string, options?: ParseDelimitedOptions): ParsedData {
  const opts = options ?? {}
  const shouldTrim = opts.trimWhitespace !== false
  const lines = raw.split('\n').filter(l => l.trim().length > 0)

  if (lines.length === 0) {
    return { columns: [], rows: [], columnTypes: [] }
  }

  const delimiter = opts.delimiter && opts.delimiter !== 'auto'
    ? opts.delimiter
    : detectDelimiter(raw)

  const firstRowIsHeader = opts.firstRowIsHeader !== false

  let columns: string[]
  let rows: string[][]

  if (firstRowIsHeader) {
    columns = splitRow(lines[0], delimiter)
    rows = lines.slice(1).map(line => splitRow(line, delimiter))
  }
  else {
    const firstRow = splitRow(lines[0], delimiter)
    columns = firstRow.map((_, i) => `Column ${i + 1}`)
    rows = lines.map(line => splitRow(line, delimiter))
  }

  if (shouldTrim) {
    columns = columns.map(c => c.trim())
    rows = rows.map(r => r.map(c => c.trim()))
  }

  if (opts.decimalSeparator === ',') {
    rows = rows.map(r => r.map((cell) => {
      if (/^\d+,\d+$/.test(cell)) {
        return cell.replace(',', '.')
      }
      return cell
    }))
  }

  // Clean comparison/approximation prefixes (e.g. "<1" → "1", "~50" → "50")
  rows = rows.map(r => r.map(cleanNumericValue))

  const columnTypes = detectColumnTypes(columns, rows)

  return { columns, rows, columnTypes }
}
