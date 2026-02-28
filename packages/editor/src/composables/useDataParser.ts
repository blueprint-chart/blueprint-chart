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

interface CsvParseState {
  cells: string[]
  current: string
  inQuotes: boolean
  index: number
}

function handleQuoteChar(state: CsvParseState, line: string) {
  if (state.inQuotes && line[state.index + 1] === '"') {
    state.current += '"'
    state.index++
  }
  else {
    state.inQuotes = !state.inQuotes
  }
}

function handleDelimiterChar(state: CsvParseState) {
  state.cells.push(state.current.trim())
  state.current = ''
}

function parseCsvRow(line: string, delimiter: string): string[] {
  const state: CsvParseState = { cells: [], current: '', inQuotes: false, index: 0 }
  for (; state.index < line.length; state.index++) {
    const ch = line[state.index]
    if (ch === '"') {
      handleQuoteChar(state, line)
    }
    else if (ch === delimiter && !state.inQuotes) {
      handleDelimiterChar(state)
    }
    else {
      state.current += ch
    }
  }
  state.cells.push(state.current.trim())
  return state.cells
}

function splitRow(line: string, delimiter: string): string[] {
  if (delimiter === '\t') {
    return line.split('\t').map(c => c.trim())
  }
  return parseCsvRow(line, delimiter)
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

export function parseDelimited(raw: string): ParsedData {
  const lines = raw.split('\n').filter(l => l.trim().length > 0)

  if (lines.length === 0) {
    return { columns: [], rows: [], columnTypes: [] }
  }

  const delimiter = detectDelimiter(raw)
  const columns = splitRow(lines[0], delimiter)
  const rows = lines.slice(1).map(line => splitRow(line, delimiter))
  const columnTypes = detectColumnTypes(columns, rows)

  return { columns, rows, columnTypes }
}
