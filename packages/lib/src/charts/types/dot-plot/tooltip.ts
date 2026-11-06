import { buildNumberFormatter } from '../../format-helpers'
import type { DotPlotRow } from './rows'
import type { ResolvedDotPlot } from './mapping'

export function formatDotPlotTooltip(row: DotPlotRow, resolved: ResolvedDotPlot, format?: string): string {
  const fmt = (format ? buildNumberFormatter(format) : null) ?? String
  const lines = [row.name, ...resolved.values.map((name, i) => `${name}: ${fmt(row.values[i])}`)]
  if (row.low !== undefined && resolved.low) {
    lines.push(`${resolved.low}: ${fmt(row.low)}`)
  }
  if (row.high !== undefined && resolved.high) {
    lines.push(`${resolved.high}: ${fmt(row.high)}`)
  }
  return lines.join('\n')
}
