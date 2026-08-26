import type { ChartData } from './types'
import { parseNumericCell } from './number-parse'

export function parseData(raw: string): ChartData {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
  const labels: string[] = []
  const values: (number | undefined)[] = []

  // Check for multi-series header
  const seriesMatch = lines[0]?.match(/^series\s*=\s*(.+)$/)
  if (seriesMatch) {
    const raw = seriesMatch[1].trim()
    // New format: series = "A","B","C" — individually quoted names
    // Legacy format: series = "A,B,C" — single quoted string with commas
    const seriesNames = raw.includes('","')
      ? raw.split(',').map(s => s.trim().replace(/^"|"$/g, ''))
      : raw.replace(/^"|"$/g, '').split(',').map(s => s.trim())
    const seriesValues: (number | undefined)[][] = seriesNames.map(() => [])

    for (let i = 1; i < lines.length; i++) {
      // New format: "Label" = 40,44,42
      const matchNew = lines[i].match(/^"([^"]+)"\s*=\s*([^"]+)$/)
      // Legacy format: "Label" = "40,44,42"
      const matchOld = lines[i].match(/^"([^"]+)"\s*=\s*"([^"]*)"$/)
      const match = matchOld ?? matchNew
      if (match) {
        labels.push(match[1])
        const vals = match[2].split(',')
        for (let s = 0; s < seriesNames.length; s++) {
          seriesValues[s].push(parseNumericCell(vals[s]))
        }
      }
    }

    const series = seriesNames.map((name, i) => ({
      name,
      // Cast preserves the ChartData.values: number[] contract while keeping
      // `undefined` holes for missing cells; consumer code coalesces with `?? 0`.
      values: seriesValues[i] as number[],
    }))

    // values array uses first series for single-series charts
    return { labels, values: (seriesValues[0] ?? []) as number[], series }
  }

  // Single-series format
  for (const line of lines) {
    const match = line.match(/^"([^"]+)"\s*=\s*(.+)$/)
    if (match) {
      labels.push(match[1])
      values.push(parseNumericCell(match[2]))
    }
  }

  return { labels, values: values as number[] }
}
