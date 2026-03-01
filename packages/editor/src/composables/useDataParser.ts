export type ColumnType = 'date' | 'number' | 'string'

export interface ParsedData {
  columns: string[]
  rows: string[][]
  columnTypes: ColumnType[]
}

function detectDelimiter(raw: string): string {
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

function isDateValue(value: string): boolean {
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

function isNumberValue(value: string): boolean {
  if (!value) {
    return false
  }
  const cleaned = value.replace(/[,%$€£¥₹]/g, '').trim()
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

export interface ParseDelimitedOptions {
  firstRowIsHeader?: boolean
  delimiter?: 'auto' | ',' | '\t' | ';' | '|'
  decimalSeparator?: '.' | ','
  trimWhitespace?: boolean
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

  const columnTypes = detectColumnTypes(columns, rows)

  return { columns, rows, columnTypes }
}
