import type { AxisRange, ChartData } from '../../types'
import { ScaleType } from '../../../enums'
import { nearest } from '../../../dsl/suggest'
import { MAPPING_NONE, numericColumns, resolveScatterMapping } from './mapping'
import type { ScatterMapping } from './mapping'
import { buildScatterPoints } from './points'
import type { DropReason } from './points'
import { isTrendMode, trendSegments } from './trend'

export interface ScatterIssue {
  code: string
  severity: 'error' | 'warning'
  message: string
  key?: 'x' | 'y' | 'size' | 'group'
  suggestion?: string
}

type ScaleTypes = { x?: ScaleType, y?: ScaleType }
type Ranges = { x?: AxisRange, y?: AxisRange }

const MAPPING_KEYS = ['x', 'y', 'size', 'group'] as const
export const MAX_LISTED_ROWS = 5

const DROP_REASONS: Record<DropReason, string> = {
  'missing-x': 'missing x',
  'missing-y': 'missing y',
  'invalid-size': 'size must be above 0',
  'non-positive-log-x': 'x must be above 0 on a log axis',
  'non-positive-log-y': 'y must be above 0 on a log axis',
}

const AXIS_PREFIX = { x: 'horizontal', y: 'vertical' } as const

export function columnNames(data: ChartData): string[] {
  return [...numericColumns(data), ...(data.textColumns ?? []).map(c => c.name)]
}

function unknownColumns(data: ChartData, overrides: ScatterMapping): ScatterIssue[] {
  const names = columnNames(data)
  return MAPPING_KEYS.flatMap((key) => {
    const name = overrides[key]
    if (!name || name === MAPPING_NONE || names.includes(name)) {
      return []
    }
    return [{ code: 'unknown-column', severity: 'error' as const, key, message: `${key} names "${name}", which is not a column.`, suggestion: nearest(name, names) }]
  })
}

export function droppedRows<R extends string>(dropped: { name: string, reason: R }[], reasons: Record<R, string>): { code: 'dropped-rows', severity: 'warning', message: string }[] {
  if (!dropped.length) {
    return []
  }
  const listed = dropped.slice(0, MAX_LISTED_ROWS).map(d => `"${d.name}" (${reasons[d.reason]})`)
  const more = dropped.length - listed.length
  const rows = `${dropped.length} ${dropped.length === 1 ? 'row' : 'rows'}`
  return [{ code: 'dropped-rows', severity: 'warning', message: `${rows} not drawn: ${listed.join(', ')}${more > 0 ? `, and ${more} more` : ''}.` }]
}

function skippedTrends(skipped: string[]): ScatterIssue[] {
  return skipped.map(name => ({
    code: 'trend-skipped',
    severity: 'warning' as const,
    message: `Trend line skipped${name === 'overall' ? '' : ` for ${name}`}: needs at least 3 points.`,
  }))
}

function ignoredLogRanges(scaleTypes: ScaleTypes, ranges: Ranges): ScatterIssue[] {
  return (['x', 'y'] as const).flatMap(axis => (['min', 'max'] as const).flatMap((bound) => {
    const raw = ranges[axis]?.[bound]
    if (scaleTypes[axis] !== ScaleType.Log || raw === undefined || String(raw).trim() === '' || !(Number(raw) <= 0)) {
      return []
    }
    const property = `${AXIS_PREFIX[axis]}Range${bound === 'min' ? 'Min' : 'Max'}`
    return [{ code: 'log-range-ignored', severity: 'warning' as const, message: `${property} must be above 0 on a log axis; it is ignored.` }]
  }))
}

export function scatterIssues(data: ChartData, overrides: ScatterMapping, scaleTypes: ScaleTypes, ranges: Ranges, trend?: string): ScatterIssue[] {
  const unknown = unknownColumns(data, overrides)
  const mapping = resolveScatterMapping(data, overrides)
  if (!mapping.y) {
    return [...unknown, { code: 'scatter-missing-y', severity: 'error', key: 'y', message: 'Scatter needs at least two numeric columns.' }]
  }
  const logRanges = ignoredLogRanges(scaleTypes, ranges)
  if (unknown.length) {
    return [...unknown, ...logRanges]
  }
  const { points, dropped } = buildScatterPoints(data, mapping, scaleTypes)
  const skipped = isTrendMode(trend) ? trendSegments(points, trend, scaleTypes).skipped : []
  return [...droppedRows(dropped, DROP_REASONS), ...skippedTrends(skipped), ...logRanges]
}
