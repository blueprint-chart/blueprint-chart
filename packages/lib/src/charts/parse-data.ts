import type { ChartData } from './types'
import { parseNumericCell } from './number-parse'
import { splitTopLevelCommas, unescapeDslString, unquoteDslString } from '../dsl/quoting'

// A quoted label, escapes included, so `"5\" pipe"` reads as one label instead
// of terminating at the inner quote.
const LABEL = '"((?:[^"\\\\]|\\\\.)*)"'
const NEW_ROW = new RegExp(`^${LABEL}\\s*=\\s*(.+)$`)
const OLD_ROW = new RegExp(`^${LABEL}\\s*=\\s*"([^"]*)"$`)
const SINGLE_ROW = new RegExp(`^${LABEL}\\s*=\\s*(.+)$`)

/**
 * Number a label that repeats an earlier one: `Alpha`, `Alpha (2)`, `Alpha (3)`.
 *
 * Every consumer reads a label as its row's identity — band-scale domains,
 * data-join keys, `labels.indexOf(...)` lookups — so rows sharing a label used
 * to collapse into the first one and the rest vanished from the chart with no
 * error and no visual cue (#22). Numbering keeps every row and shows the author
 * which ones were duplicated. A name already taken by a literal label is
 * skipped, so the numbering cannot collide its way back into a lost row.
 */
function numberRepeatedLabels(labels: string[]): string[] {
  const used = new Set<string>()
  return labels.map((label) => {
    let unique = label
    for (let n = 2; used.has(unique); n++) {
      unique = `${label} (${n})`
    }
    used.add(unique)
    return unique
  })
}

export function parseData(raw: string): ChartData {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
  const labels: string[] = []
  const values: (number | undefined)[] = []

  // Check for multi-series header
  const seriesMatch = lines[0]?.match(/^series\s*=\s*(.+)$/)
  if (seriesMatch) {
    const segments = splitTopLevelCommas(seriesMatch[1].trim())
    const rows: { cells: string[], label: string, legacy: boolean }[] = []
    for (let i = 1; i < lines.length; i++) {
      // Legacy format: "Label" = "40,44,42". New format: "Label" = 40,44,42
      const matchOld = lines[i].match(OLD_ROW)
      const match = matchOld ?? lines[i].match(NEW_ROW)
      if (match) {
        rows.push({
          cells: splitTopLevelCommas(match[2]),
          label: unescapeDslString(match[1]),
          legacy: matchOld !== null,
        })
      }
    }

    // New format: series = "A","B","C", individually quoted names.
    // Legacy format: series = "A,B,C", one quoted string listing the columns,
    // spelled exactly like a single name containing a comma. Only the legacy
    // value rows tell the two apart, so require one before splitting:
    // `series = "Paris, France"` on its own stays one series.
    const seriesNames = segments.length > 1 || !rows.some(r => r.legacy)
      ? segments.map(unquoteDslString)
      : unquoteDslString(segments[0]).split(',').map(s => s.trim())
    const seriesValues: (number | undefined)[][] = seriesNames.map(() => [])

    for (const row of rows) {
      labels.push(row.label)
      for (let s = 0; s < seriesNames.length; s++) {
        seriesValues[s].push(parseNumericCell(row.cells[s]))
      }
    }

    const series = seriesNames.map((name, i) => ({
      name,
      // Cast preserves the ChartData.values: number[] contract while keeping
      // `undefined` holes for missing cells; consumer code coalesces with `?? 0`.
      values: seriesValues[i] as number[],
    }))

    // values array uses first series for single-series charts
    return { labels: numberRepeatedLabels(labels), values: (seriesValues[0] ?? []) as number[], series }
  }

  // Single-series format
  for (const line of lines) {
    const match = line.match(SINGLE_ROW)
    if (match) {
      labels.push(unescapeDslString(match[1]))
      values.push(parseNumericCell(match[2]))
    }
  }

  return { labels: numberRepeatedLabels(labels), values: values as number[] }
}
