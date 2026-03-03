import type { ColumnType } from './useDataParser'

const BENFORD_EXPECTED = [
  0, // digit 0 (unused)
  0.30103, // digit 1: log10(1 + 1/1)
  0.17609, // digit 2
  0.12494, // digit 3
  0.09691, // digit 4
  0.07918, // digit 5
  0.06695, // digit 6
  0.05799, // digit 7
  0.05115, // digit 8
  0.04576, // digit 9
]

const MIN_VALUES = 10
const MAX_DEVIATION = 0.10

function leadingDigit(value: string): number | null {
  const n = parseFloat(value)
  if (!Number.isFinite(n) || n === 0) {
    return null
  }
  const abs = Math.abs(n)
  const s = abs.toExponential()
  const d = parseInt(s[0], 10)
  return d >= 1 && d <= 9 ? d : null
}

function isNumericColumn(columnType: ColumnType, rows: string[][], col: number): boolean {
  if (columnType === 'number') {
    return true
  }
  let numericCount = 0
  for (const row of rows) {
    const v = row[col]
    if (v !== undefined && v !== null && v !== '') {
      const n = parseFloat(v)
      if (Number.isFinite(n)) {
        numericCount++
      }
    }
  }
  return numericCount >= MIN_VALUES
}

export interface BenfordResult {
  pass: boolean
  suspicious: string[]
  eligible: boolean
}

export function checkBenford(
  columns: string[],
  rows: string[][],
  columnTypes: ColumnType[],
): BenfordResult {
  const suspicious: string[] = []
  let hasEligibleColumn = false

  for (let col = 0; col < columns.length; col++) {
    if (!isNumericColumn(columnTypes[col], rows, col)) {
      continue
    }

    const counts = new Array(10).fill(0) as number[]
    let total = 0

    for (const row of rows) {
      const digit = leadingDigit(row[col])
      if (digit !== null) {
        counts[digit]++
        total++
      }
    }

    if (total < MIN_VALUES) {
      continue
    }
    hasEligibleColumn = true

    let flagged = false
    for (let d = 1; d <= 9; d++) {
      const observed = counts[d] / total
      if (Math.abs(observed - BENFORD_EXPECTED[d]) > MAX_DEVIATION) {
        flagged = true
        break
      }
    }

    if (flagged) {
      suspicious.push(columns[col])
    }
  }

  return {
    pass: suspicious.length === 0,
    suspicious,
    eligible: hasEligibleColumn,
  }
}
