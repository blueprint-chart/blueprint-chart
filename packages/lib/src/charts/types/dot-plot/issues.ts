import { DotStyle, ScaleType } from '../../../enums'
import { nearest } from '../../../dsl/suggest'
import type { ChartData } from '../../types'
import { MAPPING_NONE } from '../scatter/mapping'
import { columnNames, droppedRows, MAX_LISTED_ROWS } from '../scatter/issues'
import { resolveDotPlotMapping } from './mapping'
import type { DotPlotMapping } from './mapping'
import { buildDotPlotRows } from './rows'
import type { DotPlotDropReason } from './rows'

export interface DotPlotIssue {
  code: string
  severity: 'warning'
  message: string
  key?: 'low' | 'high'
  suggestion?: string
}

const MAPPING_KEYS = ['low', 'high'] as const

const DROP_REASONS: Record<DotPlotDropReason, string> = {
  'missing-value': 'missing value',
  'missing-range': 'missing low or high',
  'non-positive-log': 'values must be above 0 on a log axis',
}

const quoted = (names: string[]) => names.map(name => `"${name}"`).join(', ')

function unknownColumns(data: ChartData, overrides: DotPlotMapping): DotPlotIssue[] {
  const names = columnNames(data)
  return MAPPING_KEYS.flatMap((key) => {
    const name = overrides[key]
    if (!name || name === MAPPING_NONE || names.includes(name)) {
      return []
    }
    return [{ code: 'unknown-column', severity: 'warning' as const, key, message: `${key} names "${name}", which is not a column.`, suggestion: nearest(name, names) }]
  })
}

function valuesOutsideRange(rows: { name: string, values: number[], low?: number, high?: number }[]): DotPlotIssue[] {
  const outside = rows.filter(({ values: [value], low = -Infinity, high = Infinity }) => value < Math.min(low, high) || value > Math.max(low, high))
  if (!outside.length) {
    return []
  }
  const listed = outside.slice(0, MAX_LISTED_ROWS).map(row => row.name)
  const more = outside.length - listed.length
  const rowCount = `${outside.length} ${outside.length === 1 ? 'row has' : 'rows have'}`
  return [{ code: 'value-outside-range', severity: 'warning', message: `${rowCount} a value outside low to high: ${quoted(listed)}${more > 0 ? `, and ${more} more` : ''}.` }]
}

function ignoredColumns(values: string[], ignored: string[]): DotPlotIssue[] {
  if (!ignored.length) {
    return []
  }
  return [{ code: 'ignored-columns', severity: 'warning', message: `Range mode uses ${quoted(values)} as the value and ignores ${quoted(ignored)}.` }]
}

function missingRangeColumns(overrides: DotPlotMapping, mode: string): DotPlotIssue[] {
  if (overrides.dotStyle !== DotStyle.Range || mode === 'range') {
    return []
  }
  return [{ code: 'missing-range-columns', severity: 'warning', message: 'Range style needs a low and a high column. Pick them in low and high.' }]
}

export function dotPlotIssues(data: ChartData, overrides: DotPlotMapping, scaleType?: ScaleType): DotPlotIssue[] {
  const resolved = resolveDotPlotMapping(data, overrides)
  const { rows, dropped } = buildDotPlotRows(data, resolved, scaleType)
  return [
    ...unknownColumns(data, overrides),
    ...missingRangeColumns(overrides, resolved.mode),
    ...droppedRows(dropped, DROP_REASONS),
    ...(resolved.mode === 'range' ? valuesOutsideRange(rows) : []),
    ...ignoredColumns(resolved.values, resolved.ignored),
  ]
}
