import type { ChartData, OverlayConfig } from '../types'
import { nearest } from '../../dsl/suggest'
import { unquoteDslString } from '../../dsl/quoting'
import { parseNumericCell } from '../number-parse'
import { readSeriesRows } from '../parse-data'

export const OVERLAY_CHART_TYPES: ReadonlySet<string> = new Set(['bar-vertical', 'bar-horizontal'])

export interface ResolvedOverlay {
  key: string
  kind: 'value' | 'range'
  title: string
  color: string
  opacity: number
  pattern: 'solid' | 'stripes'
  low: number[]
  high: number[]
}

type Column = NonNullable<ChartData['series']>[number]

const DEFAULT_COLOR = 'currentColor'
const DEFAULT_VALUE_OPACITY = 100
const DEFAULT_RANGE_OPACITY = 30

function toNumber(cell: number | undefined): number {
  return typeof cell === 'number' ? cell : Number.NaN
}

function resolveOverlay(config: OverlayConfig, columns: Column[]): ResolvedOverlay {
  const kind = columns.length === 2 ? 'range' : 'value'
  const first = columns[0].values.map(toNumber)
  const second = (columns[1]?.values ?? columns[0].values).map(toNumber)
  const low = first.map((value, row) => Math.min(value, second[row]))
  const high = first.map((value, row) => Math.max(value, second[row]))
  const names = columns.map(column => column.name)
  const defaultTitle = kind === 'range' ? names.join(' to ') : names[0]
  const defaultOpacity = kind === 'range' ? DEFAULT_RANGE_OPACITY : DEFAULT_VALUE_OPACITY
  const opacity = (config.opacity ?? defaultOpacity) / 100
  const isStripes = kind === 'range' && config.pattern === 'stripes'
  const pattern = isStripes ? 'stripes' : 'solid'
  const key = config.columns.join('\u001f')
  const color = config.color ?? DEFAULT_COLOR
  const title = config.title ?? defaultTitle
  return { key, kind, title, color, opacity, pattern, low, high }
}

function isDrawable(config: OverlayConfig, byName: Map<string, Column>): boolean {
  const sizeOk = config.columns.length >= 1 && config.columns.length <= 2
  const allExist = config.columns.every(name => byName.has(name))
  return !config.hidden && sizeOk && allExist
}

export function resolveOverlays(data: ChartData, overlays: OverlayConfig[] | undefined): { data: ChartData, overlays: ResolvedOverlay[] } {
  if (!overlays?.length || !data.series) {
    return { data, overlays: [] }
  }
  const entries = data.series.map(column => [column.name, column] as const)
  const byName = new Map(entries)
  const claimed = new Set(overlays.flatMap(config => config.columns))
  const remaining = data.series.filter(column => !claimed.has(column.name))
  if (!remaining.length) {
    return { data, overlays: [] }
  }
  const drawable = overlays.filter(config => isDrawable(config, byName))
  const resolved = drawable.map((config) => {
    const columns = config.columns.map(name => byName.get(name))
    return resolveOverlay(config, columns as Column[])
  })
  const ranges = resolved.filter(overlay => overlay.kind === 'range')
  const values = resolved.filter(overlay => overlay.kind === 'value')
  const [bar, ...series] = remaining
  return { data: { ...data, values: bar.values, series }, overlays: [...ranges, ...values] }
}

export interface OverlayIssue {
  code: string
  message: string
  key?: string
  suggestion?: string
}

function nonNumericCells(overlay: OverlayConfig, data: ChartData, rawData: string, key: string): OverlayIssue[] {
  const names = data.series?.map(column => column.name) ?? []
  const lines = rawData.split('\n').map(line => line.trim()).filter(Boolean)
  const rows = readSeriesRows(lines)
  const issues: OverlayIssue[] = []
  for (const name of overlay.columns) {
    const index = names.indexOf(name)
    for (const row of rows) {
      const cell = row.cells[index]
      const text = cell === undefined ? '' : unquoteDslString(cell)
      if (text !== '' && parseNumericCell(cell) === undefined) {
        issues.push({ code: 'overlay-non-numeric-cell', key, message: `Overlay column "${name}" has a non-numeric value "${text}" in row "${row.label}".` })
      }
    }
  }
  return issues
}

function overlayConfigIssues(overlay: OverlayConfig, index: number, data: ChartData, rawData: string | undefined): OverlayIssue[] {
  const key = `overlay[${index}]`
  const issues: OverlayIssue[] = []
  const names = data.series?.map(column => column.name) ?? []
  for (const name of overlay.columns) {
    if (!names.includes(name)) {
      const suggestion = nearest(name, names)
      issues.push({ code: 'overlay-unknown-column', key, message: `Overlay column "${name}" is not in the data.`, ...(suggestion && { suggestion }) })
    }
  }
  if (overlay.columns.length > 2) {
    issues.push({ code: 'overlay-too-many-columns', key, message: 'An overlay takes one column, or two for a range.' })
  }
  if (overlay.columns.length === 1 && overlay.pattern) {
    issues.push({ code: 'overlay-pattern-on-value', key, message: 'Pattern only applies to a range overlay, so this one stays solid.' })
  }
  const isRange = overlay.columns.length === 2
  const allExist = overlay.columns.every(name => names.includes(name))
  if (isRange && allExist && rawData !== undefined && !overlay.hidden) {
    issues.push(...nonNumericCells(overlay, data, rawData, key))
  }
  return issues
}

export function overlayIssues(data: ChartData, overlays: OverlayConfig[], chartType: string, rawData?: string): OverlayIssue[] {
  if (!overlays.length) {
    return []
  }
  if (!OVERLAY_CHART_TYPES.has(chartType)) {
    return [{ code: 'overlay-unsupported-type', key: 'overlay[0]', message: `Overlays only draw on bar-vertical and bar-horizontal charts, not ${chartType}.` }]
  }
  const issues = overlays.flatMap((overlay, index) => overlayConfigIssues(overlay, index, data, rawData))
  const names = data.series?.map(column => column.name) ?? []
  const claimed = new Set(overlays.flatMap(overlay => overlay.columns))
  const leavesNoBar = names.length > 0 && names.every(name => claimed.has(name))
  if (leavesNoBar) {
    issues.push({ code: 'overlay-no-bar', message: 'Overlays use every column, so no bar is left to draw.' })
  }
  return issues
}
