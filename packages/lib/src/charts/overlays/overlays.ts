import * as d3 from 'd3'
import type { ChartData, OverlayConfig } from '../types'
import { featureJoin, getSceneTransition } from '../../transitions'
import { nearest } from '../../dsl/suggest'
import { unquoteDslString } from '../../dsl/quoting'
import { parseNumericCell } from '../number-parse'
import { readSeriesTable, splitDataLines } from '../parse-data'

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

export interface OverlayGeometry {
  orientation: 'vertical' | 'horizontal'
  band: d3.ScaleBand<string>
  value: (v: number) => number
  base: (rowIndex: number) => number
}

interface OverlayCell {
  key: string
  overlay: ResolvedOverlay
  label: string
  low: number
  high: number
  fill: string
}

const VALUE_STROKE_WIDTH = 3
const OVERHANG_RATIO = 0.15
const STRIPE_SIZE = 6

export function overlayDomainValues(overlays: ResolvedOverlay[], rows: number[], base: (rowIndex: number) => number): number[] {
  const values: number[] = []
  for (const overlay of overlays) {
    for (const row of rows) {
      const offset = base(row)
      const low = overlay.low[row]
      const high = overlay.high[row]
      if (Number.isFinite(low) && Number.isFinite(high)) {
        values.push(offset + low, offset + high)
      }
    }
  }
  return values
}

export function overlayTooltipLines(overlays: ResolvedOverlay[], rowIndex: number, format: (v: number) => string): string[] {
  const lines: string[] = []
  for (const overlay of overlays) {
    const low = overlay.low[rowIndex]
    const high = overlay.high[rowIndex]
    if (!Number.isFinite(low) || !Number.isFinite(high)) {
      continue
    }
    const text = overlay.kind === 'range' ? `${format(low)} to ${format(high)}` : format(low)
    lines.push(`${overlay.title}: ${text}`)
  }
  return lines
}

function clipSuffix(layer: SVGGElement): string {
  const clipAttr = layer.closest('[clip-path]')?.getAttribute('clip-path') ?? ''
  return clipAttr.replace(/^url\(#bc-clip-/, '').replace(/\)$/, '')
}

function drawStripePatterns(layer: SVGGElement, overlays: ResolvedOverlay[]): Map<string, string> {
  const ids = new Map<string, string>()
  const svg = layer.ownerSVGElement
  if (!svg) {
    return ids
  }
  const suffix = clipSuffix(layer)
  const existing = d3.select(svg).select<SVGDefsElement>('defs')
  const defs = existing.empty() ? d3.select(svg).append<SVGDefsElement>('defs') : existing
  const stripes = overlays.filter(overlay => overlay.pattern === 'stripes')
  stripes.forEach((overlay, index) => {
    const id = `bc-overlay-stripes-${suffix}-${index}`
    ids.set(overlay.key, id)
    defs.select(`#${id}`).remove()
    const pattern = defs.append('pattern')
      .attr('id', id)
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('width', STRIPE_SIZE)
      .attr('height', STRIPE_SIZE)
      .attr('patternTransform', 'rotate(45)')
    pattern.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', STRIPE_SIZE)
      .attr('stroke', overlay.color)
      .attr('stroke-width', 2)
  })
  return ids
}

function overlayCells(overlays: ResolvedOverlay[], labels: string[], rows: number[], patternIds: Map<string, string>): OverlayCell[] {
  const cells: OverlayCell[] = []
  for (const overlay of overlays) {
    const patternId = patternIds.get(overlay.key)
    const fill = patternId ? `url(#${patternId})` : overlay.color
    labels.forEach((label, index) => {
      const low = overlay.low[rows[index]]
      const high = overlay.high[rows[index]]
      if (Number.isFinite(low) && Number.isFinite(high)) {
        cells.push({ key: `${overlay.key}|${label}`, overlay, label, low, high, fill })
      }
    })
  }
  return cells
}

function overlayBounds(cell: OverlayCell, geom: OverlayGeometry): { start: number, size: number } {
  const bandwidth = geom.band.bandwidth()
  const overhang = bandwidth * OVERHANG_RATIO
  const start = (geom.band(cell.label) ?? 0) - overhang
  return { start, size: bandwidth + overhang * 2 }
}

function rangeAttrs(cell: OverlayCell, geom: OverlayGeometry, rowOf: Map<string, number>) {
  const offset = geom.base(rowOf.get(cell.label) ?? 0)
  const top = geom.value(offset + cell.high)
  const bottom = geom.value(offset + cell.low)
  const { start, size } = overlayBounds(cell, geom)
  return { 'x': start, 'width': size, 'y': Math.min(top, bottom), 'height': Math.abs(bottom - top), 'fill': cell.fill, 'fill-opacity': cell.overlay.opacity, 'opacity': 1 }
}

function valueAttrs(cell: OverlayCell, geom: OverlayGeometry, rowOf: Map<string, number>) {
  const offset = geom.base(rowOf.get(cell.label) ?? 0)
  const position = geom.value(offset + cell.low)
  const { start, size } = overlayBounds(cell, geom)
  return { 'x1': start, 'x2': start + size, 'y1': position, 'y2': position, 'stroke': cell.overlay.color, 'stroke-width': VALUE_STROKE_WIDTH, 'stroke-opacity': cell.overlay.opacity, 'opacity': 1 }
}

export function overlayGroups(layer: SVGGElement): { ranges: SVGGElement, values: SVGGElement } {
  const group = (name: string) => {
    const existing = layer.querySelector<SVGGElement>(`:scope > .${name}`)
    if (existing) {
      return existing
    }
    return d3.select(layer).append('g').attr('class', name).node()!
  }
  const ranges = group('bc-overlays-ranges')
  const values = group('bc-overlays-values')
  return { ranges, values }
}

export function drawOverlays(container: HTMLElement, layer: SVGGElement, overlays: ResolvedOverlay[], labels: string[], rows: number[], geom: OverlayGeometry): void {
  const groups = overlayGroups(layer)
  const orch = getSceneTransition(container)
  const patternIds = drawStripePatterns(layer, overlays)
  const cells = overlayCells(overlays, labels, rows, patternIds)
  const rowOf = new Map(labels.map((label, index) => [label, rows[index]] as const))
  const ranges = cells.filter(cell => cell.overlay.kind === 'range')
  const values = cells.filter(cell => cell.overlay.kind === 'value')
  const faded = (attrs: Record<string, string | number>) => ({ ...attrs, opacity: 0 })
  featureJoin<OverlayCell>(orch, {
    role: 'mark-per-cell',
    parent: groups.ranges,
    selector: '.bc-overlay-range',
    data: ranges,
    key: cell => cell.key,
    insert: sel => sel.append('rect')
      .attr('class', 'bc-overlay bc-overlay-range')
      .attr('data-series', (cell: OverlayCell) => cell.overlay.title),
    attrs: cell => rangeAttrs(cell, geom, rowOf),
    enterFrom: cell => faded(rangeAttrs(cell, geom, rowOf)),
    exitTo: () => ({ opacity: 0 }),
  })
  featureJoin<OverlayCell>(orch, {
    role: 'mark-per-cell',
    parent: groups.values,
    selector: '.bc-overlay-value',
    data: values,
    key: cell => cell.key,
    insert: sel => sel.append('line')
      .attr('class', 'bc-overlay bc-overlay-value')
      .attr('data-series', (cell: OverlayCell) => cell.overlay.title),
    attrs: cell => valueAttrs(cell, geom, rowOf),
    enterFrom: cell => faded(valueAttrs(cell, geom, rowOf)),
    exitTo: () => ({ opacity: 0 }),
  })
}

export interface OverlayIssue {
  code: string
  message: string
  key?: string
  suggestion?: string
}

function nonNumericCells(overlay: OverlayConfig, rawData: string, key: string): OverlayIssue[] {
  const table = readSeriesTable(splitDataLines(rawData))
  if (!table) {
    return []
  }
  const issues: OverlayIssue[] = []
  for (const name of overlay.columns) {
    const index = table.names.indexOf(name)
    if (index === -1) {
      continue
    }
    for (const row of table.rows) {
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
    issues.push(...nonNumericCells(overlay, rawData, key))
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
