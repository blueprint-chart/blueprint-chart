import * as d3 from 'd3'
import type { ChartData, OverlayConfig } from '../types'
import { featureJoin, getSceneTransition } from '../../transitions'
import { nearest } from '../../dsl/suggest'
import { unquoteDslString } from '../../dsl/quoting'
import { parseNumericCell } from '../number-parse'
import { readSeriesTable, splitDataLines } from '../parse-data'
import { renderLegend } from '../legend/legend'
import { makeDefaultFormat } from '../plugins/tooltip'
import { formatValueLabel } from '../format-helpers'
import { estimateTextInk } from '../value-label-fit'
import { DirectLabelMode } from '../../enums'
import { contrastTextColor } from '../contrast'

export const OVERLAY_CHART_TYPES: ReadonlySet<string> = new Set(['bar-vertical', 'bar-horizontal', 'bar-multi', 'bar-grouped', 'bar-split', 'bar-stacked', 'column-stacked'])
export const OVERLAY_SERIES_CHART_TYPES: ReadonlySet<string> = new Set(['bar-multi', 'bar-grouped', 'bar-split'])
/** Chart types that draw the overlay key even when the legend is off. */
export const OVERLAY_KEY_CHART_TYPES: ReadonlySet<string> = new Set(['bar-multi'])
export const OVERLAY_STACKED_CHART_TYPES: ReadonlySet<string> = new Set(['bar-stacked', 'column-stacked'])

export interface ResolvedOverlay {
  key: string
  kind: 'value' | 'range'
  title: string
  color: string
  opacity: number
  pattern: 'solid' | 'stripes' | 'whisker'
  low: number[]
  high: number[]
  order: number
  bar?: string
  muteRef?: number
  aboveColor?: string
  belowColor?: string
  aboveTitle?: string
  belowTitle?: string
}

type Column = NonNullable<ChartData['series']>[number]

const DEFAULT_COLOR = 'currentColor'
const DEFAULT_VALUE_OPACITY = 100
const DEFAULT_RANGE_OPACITY = 30
const DEFAULT_WHISKER_OPACITY = 100

function toNumber(cell: number | undefined): number {
  return typeof cell === 'number' ? cell : Number.NaN
}

function resolveOverlay(config: OverlayConfig, columns: Column[], order: number, key: string): ResolvedOverlay {
  const kind = columns.length === 2 ? 'range' : 'value'
  const first = columns[0].values.map(toNumber)
  const second = (columns[1]?.values ?? columns[0].values).map(toNumber)
  const low = first.map((value, row) => Math.min(value, second[row]))
  const high = first.map((value, row) => Math.max(value, second[row]))
  const names = columns.map(column => column.name)
  const defaultTitle = kind === 'range' ? names.join(' to ') : names[0]
  const isRange = kind === 'range'
  const pattern = isRange && (config.pattern === 'stripes' || config.pattern === 'whisker') ? config.pattern : 'solid'
  const rangeOpacity = pattern === 'whisker' ? DEFAULT_WHISKER_OPACITY : DEFAULT_RANGE_OPACITY
  const defaultOpacity = kind === 'range' ? rangeOpacity : DEFAULT_VALUE_OPACITY
  const opacity = (config.opacity ?? defaultOpacity) / 100
  const color = config.color ?? DEFAULT_COLOR
  const title = config.title ?? defaultTitle
  const { muteIfCrosses: muteRef, aboveColor, belowColor, aboveTitle, belowTitle } = config
  return { key, kind, title, color, opacity, pattern, low, high, order, muteRef, aboveColor, belowColor, aboveTitle, belowTitle }
}

function isDrawable(config: OverlayConfig, byName: Map<string, Column>): boolean {
  const sizeOk = config.columns.length >= 1 && config.columns.length <= 2
  const allExist = config.columns.every(name => byName.has(name))
  return !config.hidden && sizeOk && allExist
}

function targetBar(config: OverlayConfig, barNames: string[]): string {
  const bar = config.bar
  const named = bar !== undefined && barNames.includes(bar)
  return named ? bar : barNames[0]
}

// Counted over every config, hidden ones included, so hiding an overlay never
// renames the next one sharing its columns. The record separator cannot occur
// in a column name, so a suffixed key never matches another column's key.
function overlayKeys(overlays: OverlayConfig[]): string[] {
  const seen = new Map<string, number>()
  return overlays.map((config) => {
    const base = config.columns.join('\u001f')
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    return count === 0 ? base : `${base}\u001e${count}`
  })
}

export function resolveOverlays(data: ChartData, overlays: OverlayConfig[] | undefined, chartType = 'bar-vertical', stackMode?: string): { data: ChartData, overlays: ResolvedOverlay[] } {
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
  const indexed = overlays.map((config, order) => ({ config, order }))
  const drawable = indexed.filter(({ config }) => isDrawable(config, byName))
  const keys = overlayKeys(overlays)
  const resolved = drawable.map(({ config, order }) => {
    const columns = config.columns.map(name => byName.get(name))
    return resolveOverlay(config, columns as Column[], order, keys[order])
  })
  const ranges = resolved.filter(overlay => overlay.kind === 'range')
  const values = resolved.filter(overlay => overlay.kind === 'value')
  const [bar] = remaining
  const isSeries = OVERLAY_SERIES_CHART_TYPES.has(chartType)
  const isStacked = OVERLAY_STACKED_CHART_TYPES.has(chartType)
  const ordered = [...ranges, ...values]
  if (!isSeries && !isStacked) {
    const series = remaining.length > 1 ? remaining : []
    return { data: { ...data, values: bar.values, series }, overlays: ordered }
  }
  const split = { ...data, values: bar.values, series: remaining }
  if (isStacked) {
    const kept = stackMode === 'percent' ? [] : ordered
    return { data: split, overlays: kept }
  }
  const barNames = remaining.map(column => column.name)
  const targeted = ordered.map(overlay => ({ ...overlay, bar: targetBar(overlays[overlay.order], barNames) }))
  return { data: split, overlays: targeted }
}

export interface BarCue {
  faded: boolean
  color?: string
}

function crossesRef(overlay: ResolvedOverlay, row: number): boolean {
  const ref = overlay.muteRef
  const low = overlay.low[row]
  const high = overlay.high[row]
  if (overlay.kind !== 'range' || ref === undefined || !Number.isFinite(ref)) {
    return false
  }
  return Number.isFinite(low) && Number.isFinite(high) && low <= ref && ref <= high
}

function targetColor(overlay: ResolvedOverlay | undefined, row: number, barValue: number): string | undefined {
  const marker = overlay?.low[row]
  if (!overlay || marker === undefined || !Number.isFinite(marker)) {
    return undefined
  }
  return barValue >= marker ? overlay.aboveColor : overlay.belowColor
}

export function rowIndex(labels: readonly string[]): Map<string, number> {
  const entries = labels.map((label, row) => [label, row] as const)
  return new Map(entries)
}

export function barCue(overlays: ResolvedOverlay[], row: number, barValue: number, bar?: string): BarCue {
  const own = overlays.filter(overlay => overlay.bar === bar)
  const faded = own.some(overlay => crossesRef(overlay, row))
  const colored = own.filter(overlay => overlay.kind === 'value' && (overlay.aboveColor || overlay.belowColor))
  const [first] = colored.sort((a, b) => a.order - b.order)
  const color = targetColor(first, row, barValue)
  return { faded, color }
}

export function cueLabelFill(cue: BarCue, colorize: string | undefined, color: string): string {
  if (cue.faded) {
    return 'currentColor'
  }
  return contrastTextColor(colorize ?? cue.color ?? color)
}

export function stackRowTotals(series: { values: number[] }[], rowCount: number): number[] {
  const rows = Array.from({ length: rowCount }, (_, row) => row)
  return rows.map(row => d3.sum(series, s => s.values[row]))
}

export interface OverlayGeometry {
  orientation: 'vertical' | 'horizontal'
  slotStart: (label: string) => number
  slotSize: number
  value: (v: number) => number
  base: (rowIndex: number) => number
  clear?: (rowIndex: number) => number
}

interface OverlayCell {
  key: string
  overlay: ResolvedOverlay
  label: string
  low: number
  high: number
  fill: string
  geom: OverlayGeometry
}

const VALUE_STROKE_WIDTH = 3
const WHISKER_STROKE_WIDTH = 2
const WHISKER_CAP_SHARE = 0.4
const WHISKER_CAP_MAX = 12
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
    defs.selectAll('pattern').filter(function () {
      return (this as Element).getAttribute('data-overlay-key') === overlay.key
    }).remove()
    appendStripePattern(defs.node()!, id, overlay)
  })
  keepLeavingStripePatterns(layer, defs.node()!, ids)
  return ids
}

function appendStripePattern(defs: SVGDefsElement, id: string, overlay: ResolvedOverlay): void {
  const pattern = d3.select(defs).append('pattern')
    .attr('id', id)
    .attr('data-overlay-key', overlay.key)
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('width', STRIPE_SIZE)
    .attr('height', STRIPE_SIZE)
    .attr('patternTransform', 'rotate(45)')
  pattern.append('rect')
    .attr('width', STRIPE_SIZE / 2)
    .attr('height', STRIPE_SIZE)
    .attr('fill', overlay.color)
}

function keepLeavingStripePatterns(layer: SVGGElement, defs: SVGDefsElement, ids: Map<string, string>): void {
  const parent = layer.parentNode as SVGGElement
  const suffix = clipSuffix(layer)
  const leavingIds = new Map<string, string>()
  const bands = d3.select(parent).selectAll<SVGRectElement, OverlayCell | undefined>('.bc-overlays-under .bc-overlay-stripes')
  bands.each(function (cell) {
    if (!cell || ids.has(cell.overlay.key)) {
      return
    }
    let id = leavingIds.get(cell.overlay.key)
    if (!id) {
      id = `bc-overlay-stripes-${suffix}-leaving-${leavingIds.size}`
      leavingIds.set(cell.overlay.key, id)
      appendStripePattern(defs, id, cell.overlay)
    }
    this.setAttribute('fill', `url(#${id})`)
  })
}

const MASK_EXTENT = 100_000

function ensureBarMask(layer: SVGGElement): { id: string, holes: SVGGElement } | null {
  const svg = layer.ownerSVGElement
  if (!svg) {
    return null
  }
  const suffix = clipSuffix(layer)
  const id = `bc-overlay-mask-${suffix}`
  const existing = svg.querySelector<SVGMaskElement>(`mask[id="${id}"]`)
  if (existing) {
    return { id, holes: existing.querySelector<SVGGElement>('.bc-overlay-mask-ranges')! }
  }
  const defs = d3.select(svg).select<SVGDefsElement>('defs')
  const mask = defs.append('mask')
    .attr('id', id)
    .attr('maskUnits', 'userSpaceOnUse')
    .attr('x', -MASK_EXTENT)
    .attr('y', -MASK_EXTENT)
    .attr('width', MASK_EXTENT * 2)
    .attr('height', MASK_EXTENT * 2)
  const gapsId = `bc-overlay-gaps-${suffix}`
  const gaps = mask.append('pattern')
    .attr('id', gapsId)
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('width', STRIPE_SIZE)
    .attr('height', STRIPE_SIZE)
    .attr('patternTransform', 'rotate(45)')
  gaps.append('rect').attr('width', STRIPE_SIZE).attr('height', STRIPE_SIZE).attr('fill', 'black')
  gaps.append('rect').attr('width', STRIPE_SIZE / 2).attr('height', STRIPE_SIZE).attr('fill', 'white')
  mask.append('rect')
    .attr('x', -MASK_EXTENT)
    .attr('y', -MASK_EXTENT)
    .attr('width', MASK_EXTENT * 2)
    .attr('height', MASK_EXTENT * 2)
    .attr('fill', 'white')
  const holes = mask.append('g').attr('class', 'bc-overlay-mask-ranges').attr('fill', `url(#${gapsId})`).node()!
  return { id, holes }
}

function underBarsGroup(layer: SVGGElement): SVGGElement {
  const parent = layer.parentNode as SVGGElement
  const existing = parent.querySelector<SVGGElement>(':scope > .bc-overlays-under')
  if (existing) {
    return existing
  }
  let anchor: Element | null = parent.querySelector('.bc-bar') ?? layer
  while (anchor && anchor.parentNode !== parent) {
    anchor = anchor.parentElement
  }
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  group.setAttribute('class', 'bc-overlays-under')
  parent.insertBefore(group, anchor)
  return group as SVGGElement
}

type OverlayGeometryFor = (overlay: ResolvedOverlay) => OverlayGeometry | null

function overlayCells(overlays: ResolvedOverlay[], labels: string[], rows: number[], patternIds: Map<string, string>, geometryFor: OverlayGeometryFor): OverlayCell[] {
  const cells: OverlayCell[] = []
  for (const overlay of overlays) {
    const geom = geometryFor(overlay)
    if (!geom) {
      continue
    }
    const patternId = patternIds.get(overlay.key)
    const fill = patternId ? `url(#${patternId})` : overlay.color
    labels.forEach((label, index) => {
      const low = overlay.low[rows[index]]
      const high = overlay.high[rows[index]]
      if (Number.isFinite(low) && Number.isFinite(high)) {
        cells.push({ key: `${overlay.key}|${label}`, overlay, label, low, high, fill, geom })
      }
    })
  }
  return cells
}

function rangeAttrs(cell: OverlayCell, rowOf: Map<string, number>) {
  const geom = cell.geom
  const offset = geom.base(rowOf.get(cell.label) ?? 0)
  const first = geom.value(offset + cell.high)
  const second = geom.value(offset + cell.low)
  const start = geom.slotStart(cell.label)
  const size = geom.slotSize
  const from = Math.min(first, second)
  const length = Math.abs(second - first)
  const style = { 'fill': cell.fill, 'fill-opacity': cell.overlay.opacity, 'opacity': 1 }
  if (geom.orientation === 'horizontal') {
    return { x: from, width: length, y: start, height: size, ...style }
  }
  return { x: start, width: size, y: from, height: length, ...style }
}

function valueAttrs(cell: OverlayCell, rowOf: Map<string, number>) {
  const geom = cell.geom
  const offset = geom.base(rowOf.get(cell.label) ?? 0)
  const position = geom.value(offset + cell.low)
  const start = geom.slotStart(cell.label)
  const end = start + geom.slotSize
  const style = { 'stroke': cell.overlay.color, 'stroke-width': VALUE_STROKE_WIDTH, 'stroke-opacity': cell.overlay.opacity, 'opacity': 1 }
  if (geom.orientation === 'horizontal') {
    return { x1: position, x2: position, y1: start, y2: end, ...style }
  }
  return { x1: start, x2: end, y1: position, y2: position, ...style }
}

function whiskerPath(segments: [number, number][][], orientation: OverlayGeometry['orientation']): string {
  const place = ([along, across]: [number, number]) => orientation === 'horizontal' ? `${across},${along}` : `${along},${across}`
  return segments.map(([from, to]) => `M${place(from)}L${place(to)}`).join('')
}

function whiskerAttrs(cell: OverlayCell, rowOf: Map<string, number>) {
  const geom = cell.geom
  const offset = geom.base(rowOf.get(cell.label) ?? 0)
  const high = geom.value(offset + cell.high)
  const low = geom.value(offset + cell.low)
  const center = geom.slotStart(cell.label) + geom.slotSize / 2
  const cap = Math.min(geom.slotSize * WHISKER_CAP_SHARE, WHISKER_CAP_MAX)
  const half = cap / 2
  const segments: [number, number][][] = [
    [[center - half, high], [center + half, high]],
    [[center, high], [center, low]],
    [[center - half, low], [center + half, low]],
  ]
  const d = whiskerPath(segments, geom.orientation)
  return { 'd': d, 'fill': 'none', 'stroke': cell.overlay.color, 'stroke-width': WHISKER_STROKE_WIDTH, 'stroke-opacity': cell.overlay.opacity, 'opacity': 1 }
}

/** Far pixel a value label must clear on this row and bar, past the outer whisker cap, or undefined when no whisker sits there. */
export function whiskerEdge(overlays: ResolvedOverlay[], row: number, bar: string | undefined, geom: Pick<OverlayGeometry, 'value' | 'base'>, barEnd: number, outward: 1 | -1): number | undefined {
  const offset = geom.base(row)
  const ends = overlays
    .filter(overlay => overlay.pattern === 'whisker' && overlay.bar === bar)
    .filter(overlay => Number.isFinite(overlay.low[row]) && Number.isFinite(overlay.high[row]))
    .flatMap(overlay => [overlay.low[row], overlay.high[row]])
    .map(value => geom.value(offset + value) + outward * WHISKER_STROKE_WIDTH / 2)
  if (!ends.length) {
    return undefined
  }
  const reaches = [barEnd, ...ends].map(pixel => pixel * outward)
  const reach = Math.max(...reaches)
  return reach * outward
}

export function overlayGroups(layer: SVGGElement): { ranges: SVGGElement, whiskers: SVGGElement, values: SVGGElement } {
  const group = (name: string) => {
    const existing = layer.querySelector<SVGGElement>(`:scope > .${name}`)
    if (existing) {
      return existing
    }
    return d3.select(layer).append('g').attr('class', name).node()!
  }
  const ranges = group('bc-overlays-ranges')
  const whiskers = group('bc-overlays-whiskers')
  const values = group('bc-overlays-values')
  return { ranges, whiskers, values }
}

export function drawOverlays(container: HTMLElement, layer: SVGGElement, overlays: ResolvedOverlay[], labels: string[], rows: number[], geometryFor: OverlayGeometryFor): void {
  const groups = overlayGroups(layer)
  const orch = getSceneTransition(container)
  const patternIds = drawStripePatterns(layer, overlays)
  const cells = overlayCells(overlays, labels, rows, patternIds, geometryFor)
  const rowOf = new Map(labels.map((label, index) => [label, rows[index]] as const))
  const allRanges = cells.filter(cell => cell.overlay.kind === 'range')
  const ranges = allRanges.filter(cell => cell.overlay.pattern === 'solid')
  const whiskers = allRanges.filter(cell => cell.overlay.pattern === 'whisker')
  const striped = allRanges.filter(cell => cell.overlay.pattern === 'stripes')
  const values = cells.filter(cell => cell.overlay.kind === 'value')
  const faded = (attrs: Record<string, string | number>) => ({ ...attrs, opacity: 0 })
  drawStripedRanges(container, layer, striped, rowOf)
  featureJoin<OverlayCell>(orch, {
    role: 'mark-per-cell',
    parent: groups.ranges,
    selector: '.bc-overlay-range',
    data: ranges,
    key: cell => cell.key,
    insert: sel => sel.append('rect')
      .attr('class', 'bc-overlay bc-overlay-range')
      .attr('data-series', (cell: OverlayCell) => cell.overlay.title),
    attrs: cell => rangeAttrs(cell, rowOf),
    enterFrom: cell => faded(rangeAttrs(cell, rowOf)),
    exitTo: () => ({ opacity: 0 }),
  })
  featureJoin<OverlayCell>(orch, {
    role: 'mark-per-cell',
    parent: groups.whiskers,
    selector: '.bc-overlay-whisker',
    data: whiskers,
    key: cell => cell.key,
    insert: sel => sel.append('path')
      .attr('class', 'bc-overlay bc-overlay-whisker')
      .attr('data-series', (cell: OverlayCell) => cell.overlay.title),
    attrs: cell => whiskerAttrs(cell, rowOf),
    enterFrom: cell => faded(whiskerAttrs(cell, rowOf)),
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
    attrs: cell => valueAttrs(cell, rowOf),
    enterFrom: cell => faded(valueAttrs(cell, rowOf)),
    exitTo: () => ({ opacity: 0 }),
  })
}

const SHAPE_ATTRS = ['x', 'y', 'width', 'height', 'opacity']

function rectShapes(group: SVGGElement, selector: string): Map<string, Record<string, string>> {
  const shapes = new Map<string, Record<string, string>>()
  d3.select(group).selectAll<SVGRectElement, OverlayCell | undefined>(selector).each(function (cell) {
    if (!cell) {
      return
    }
    const entries = SHAPE_ATTRS.map(name => [name, this.getAttribute(name)])
    const present = entries.filter(([, value]) => value !== null)
    const shape = Object.fromEntries(present)
    shapes.set(cell.key, shape)
  })
  return shapes
}

function seedLeavingHoles(holes: SVGGElement, under: SVGGElement, cells: OverlayCell[], priorShapes: Map<string, Record<string, string>>): void {
  const keys = new Set(cells.map(cell => cell.key))
  const priorCells = d3.select(under).selectAll<SVGRectElement, OverlayCell | undefined>('.bc-overlay-stripes').data()
  for (const cell of priorCells) {
    if (!cell || keys.has(cell.key)) {
      continue
    }
    const hole = d3.select(holes).append('rect').attr('class', 'bc-overlay-mask-range').datum(cell)
    const shape = priorShapes.get(cell.key) ?? {}
    for (const [name, value] of Object.entries(shape)) {
      hole.attr(name, value)
    }
  }
}

function clearBarMasks(parent: SVGGElement): void {
  const bars = parent.querySelectorAll('.bc-bar[mask]')
  for (const bar of bars) {
    bar.removeAttribute('mask')
  }
}

function drawStripedRanges(container: HTMLElement, layer: SVGGElement, cells: OverlayCell[], rowOf: Map<string, number>): void {
  const parent = layer.parentNode as SVGGElement
  const bars = parent.querySelectorAll('.bc-bar')
  const hasMask = Boolean(layer.ownerSVGElement?.querySelector(`mask[id="bc-overlay-mask-${clipSuffix(layer)}"]`))
  const hasPriorStripes = Boolean(parent.querySelector('.bc-overlays-under .bc-overlay-stripes'))
  if (!cells.length && !hasMask && !hasPriorStripes) {
    clearBarMasks(parent)
    return
  }
  const orch = getSceneTransition(container)
  const faded = (attrs: Record<string, string | number>) => ({ ...attrs, opacity: 0 })
  const under = underBarsGroup(layer)
  const priorShapes = rectShapes(under, '.bc-overlay-stripes')
  featureJoin<OverlayCell>(orch, {
    role: 'mark-per-cell',
    parent: under,
    selector: '.bc-overlay-range',
    data: cells,
    key: cell => cell.key,
    insert: sel => sel.append('rect')
      .attr('class', 'bc-overlay bc-overlay-range bc-overlay-stripes')
      .attr('data-series', (cell: OverlayCell) => cell.overlay.title),
    attrs: cell => rangeAttrs(cell, rowOf),
    enterFrom: cell => faded(rangeAttrs(cell, rowOf)),
    exitTo: () => ({ opacity: 0 }),
  })
  const mask = ensureBarMask(layer)
  if (!mask) {
    return
  }
  if (!hasMask) {
    seedLeavingHoles(mask.holes, under, cells, priorShapes)
  }
  const holeAttrs = (cell: OverlayCell) => {
    const { x, y, width, height } = rangeAttrs(cell, rowOf)
    return { x, y, width, height, opacity: 1 }
  }
  featureJoin<OverlayCell>(orch, {
    role: 'mark-per-cell',
    parent: mask.holes,
    selector: '.bc-overlay-mask-range',
    data: cells,
    // Its own key: sharing the striped rect's key would make each one the
    // other's transition predecessor, freezing whichever tweens first.
    key: cell => `hole|${cell.key}`,
    insert: sel => sel.append('rect').attr('class', 'bc-overlay-mask-range'),
    attrs: holeAttrs,
    enterFrom: (cell) => {
      const prior = priorShapes.get(cell.key)
      return prior ?? faded(holeAttrs(cell))
    },
    exitTo: () => ({ opacity: 0 }),
  })
  for (const bar of bars) {
    bar.setAttribute('mask', `url(#${mask.id})`)
  }
}

export function mountOverlayLayer(container: HTMLElement, parent: SVGGElement, prior: Element[], overlays: ResolvedOverlay[], labels: string[], rows: number[], geometryFor: OverlayGeometryFor): void {
  if (!overlays.length && !prior.length) {
    clearBarMasks(parent)
    return
  }
  const layer = d3.select(parent).append('g').attr('class', 'bc-overlays').node()!
  const groups = overlayGroups(layer)
  for (const el of prior) {
    const isStriped = el.classList.contains('bc-overlay-stripes')
    const isRange = el.classList.contains('bc-overlay-range')
    const isWhisker = el.classList.contains('bc-overlay-whisker')
    const rangeTarget = isStriped ? underBarsGroup(layer) : groups.ranges
    const valueTarget = isWhisker ? groups.whiskers : groups.values
    const target = isRange ? rangeTarget : valueTarget
    target.appendChild(el)
  }
  drawOverlays(container, layer, overlays, labels, rows, geometryFor)
}

const DIRECT_LABEL_GAP = 6
const DIRECT_LABEL_PADDING = 8

export function directLabelWidth(overlays: ResolvedOverlay[]): number {
  const widths = overlays.map(overlay => estimateTextInk(overlay.title))
  return Math.max(...widths) + DIRECT_LABEL_PADDING
}

function hasValueAt(overlay: ResolvedOverlay, row: number): boolean {
  return Number.isFinite(overlay.low[row]) && Number.isFinite(overlay.high[row])
}

function hasAnyValue(overlay: ResolvedOverlay): boolean {
  return overlay.low.some((_, row) => hasValueAt(overlay, row))
}

export function drawOverlayDirectLabels(group: SVGGElement, overlays: ResolvedOverlay[], labels: readonly string[], rows: number[], geometryFor: OverlayGeometryFor): void {
  for (const overlay of overlays) {
    const geom = geometryFor(overlay)
    const index = rows.findIndex(row => hasValueAt(overlay, row))
    if (!geom || index < 0) {
      continue
    }
    const row = rows[index]
    const offset = geom.base(row)
    const centre = geom.slotStart(labels[index]) + geom.slotSize / 2
    const overlayEnd = geom.value(offset + overlay.high[row])
    const farEnd = Math.max(overlayEnd, geom.clear?.(row) ?? overlayEnd)
    d3.select(group).append('text')
      .attr('class', 'bc-overlay-label')
      .attr('data-series', overlay.title)
      .attr('x', farEnd + DIRECT_LABEL_GAP)
      .attr('y', centre)
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '11px')
      .attr('fill', overlay.color)
      .text(overlay.title)
  }
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

const TARGET_KEYS = ['aboveColor', 'belowColor', 'aboveTitle', 'belowTitle'] as const

function cueConfigIssues(overlay: OverlayConfig, key: string): OverlayIssue[] {
  const issues: OverlayIssue[] = []
  const isRange = overlay.columns.length === 2
  const isValue = overlay.columns.length === 1
  if (overlay.muteIfCrosses !== undefined && isValue) {
    issues.push({ code: 'overlay-mute-on-value', key, message: 'Fading only applies to a range overlay, so muteIfCrosses is ignored here.' })
  }
  if (overlay.muteIfCrosses !== undefined && Number.isNaN(overlay.muteIfCrosses)) {
    issues.push({ code: 'overlay-mute-not-number', key, message: 'muteIfCrosses needs a number, so no bar fades.' })
  }
  const hasTarget = TARGET_KEYS.some(name => overlay[name] !== undefined)
  if (hasTarget && isRange) {
    issues.push({ code: 'overlay-target-on-range', key, message: 'Target colors and titles only apply to a value overlay, so they are ignored here.' })
  }
  const aboveUntinted = overlay.aboveTitle !== undefined && overlay.aboveColor === undefined
  const belowUntinted = overlay.belowTitle !== undefined && overlay.belowColor === undefined
  if ((aboveUntinted || belowUntinted) && isValue) {
    issues.push({ code: 'overlay-title-without-color', key, message: 'A target title needs a target color, so it is ignored here.' })
  }
  return issues
}

function targetConflictIssues(overlays: OverlayConfig[], barOf: (overlay: OverlayConfig) => string | undefined): OverlayIssue[] {
  const issues: OverlayIssue[] = []
  const seen = new Set<string | undefined>()
  overlays.forEach((overlay, index) => {
    const isValue = overlay.columns.length === 1
    const hasColor = overlay.aboveColor !== undefined || overlay.belowColor !== undefined
    if (!isValue || overlay.hidden || !hasColor) {
      return
    }
    const bar = barOf(overlay)
    if (seen.has(bar)) {
      issues.push({ code: 'overlay-target-conflict', key: `overlay[${index}]`, message: 'Only the first value overlay with a target color colors the bars, so this one is ignored.' })
    }
    seen.add(bar)
  })
  return issues
}

function barKeyIssues(overlay: OverlayConfig, index: number, isSeries: boolean, barNames: string[]): OverlayIssue[] {
  const key = `overlay[${index}]`
  const [first] = barNames
  if (!isSeries) {
    return overlay.bar === undefined ? [] : [{ code: 'overlay-bar-ignored', key, message: 'The bar key only applies to bar-multi, bar-grouped and bar-split charts, so it is ignored here.' }]
  }
  if (!first) {
    return []
  }
  if (overlay.bar === undefined) {
    return [{ code: 'overlay-bar-missing', key, message: `This overlay names no bar, so it goes on "${first}".` }]
  }
  if (barNames.includes(overlay.bar)) {
    return []
  }
  const suggestion = nearest(overlay.bar, barNames)
  return [{ code: 'overlay-bar-unknown', key, message: `Bar "${overlay.bar}" is not a bar series, so this overlay goes on "${first}".`, ...(suggestion && { suggestion }) }]
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
  issues.push(...cueConfigIssues(overlay, key))
  const allExist = overlay.columns.every(name => names.includes(name))
  if (isRange && allExist && rawData !== undefined && !overlay.hidden) {
    issues.push(...nonNumericCells(overlay, rawData, key))
  }
  return issues
}

export function overlayIssues(data: ChartData, overlays: OverlayConfig[], chartType: string, rawData?: string, stackMode?: string): OverlayIssue[] {
  if (!overlays.length) {
    return []
  }
  if (!OVERLAY_CHART_TYPES.has(chartType)) {
    return [{ code: 'overlay-unsupported-type', key: 'overlay[0]', message: `Overlays only draw on bar-vertical, bar-horizontal, bar-multi, bar-grouped, bar-split, bar-stacked and column-stacked charts, not ${chartType}.` }]
  }
  const names = data.series?.map(column => column.name) ?? []
  const claimed = new Set(overlays.flatMap(overlay => overlay.columns))
  const barNames = names.filter(name => !claimed.has(name))
  const isSeries = OVERLAY_SERIES_CHART_TYPES.has(chartType)
  const barOf = (overlay: OverlayConfig) => isSeries ? targetBar(overlay, barNames) : undefined
  const issues = overlays.flatMap((overlay, index) => overlayConfigIssues(overlay, index, data, rawData))
  const barIssues = overlays.flatMap((overlay, index) => barKeyIssues(overlay, index, isSeries, barNames))
  issues.push(...barIssues)
  issues.push(...targetConflictIssues(overlays, barOf))
  const isPercentStack = OVERLAY_STACKED_CHART_TYPES.has(chartType) && stackMode === 'percent'
  if (isPercentStack) {
    issues.push({ code: 'overlay-percent-stack', message: 'Overlays do not draw on a percent stack, so they are ignored.' })
  }
  const leavesNoBar = names.length > 0 && names.every(name => claimed.has(name))
  if (leavesNoBar) {
    issues.push({ code: 'overlay-no-bar', message: 'Overlays use every column, so no bar is left to draw.' })
  }
  return issues
}

export interface OverlayLegendPlacement {
  x: number
  y: number
  position: string
  anchor: string
  width: number
  height: number
  inset: { left: number, right: number }
}

const KEY_SWATCH_SIZE = 12
const KEY_LINE_HEIGHT = 3
const KEY_WHISKER_PATH = 'M3,1L9,1M6,1L6,11M3,11L9,11'

function sharedStripePatternId(svg: SVGSVGElement | null, overlay: ResolvedOverlay): string | undefined {
  const patterns = Array.from(svg?.querySelectorAll('defs pattern[data-overlay-key]') ?? [])
  const match = patterns.find(pattern => pattern.getAttribute('data-overlay-key') === overlay.key)
  return match?.id
}

function styleKeySwatch(swatch: SVGRectElement, overlay: ResolvedOverlay): void {
  const selection = d3.select(swatch)
  if (overlay.kind === 'value') {
    selection
      .attr('y', (KEY_SWATCH_SIZE - KEY_LINE_HEIGHT) / 2)
      .attr('height', KEY_LINE_HEIGHT)
      .attr('fill', overlay.color)
      .attr('fill-opacity', overlay.opacity)
    return
  }
  if (overlay.pattern === 'whisker') {
    selection.attr('fill', 'none')
    const x = Number(selection.attr('x') ?? 0)
    const y = Number(selection.attr('y') ?? 0)
    d3.select(swatch.parentNode as SVGGElement).insert('path', 'rect + *')
      .attr('class', 'bc-overlay-key-whisker')
      .attr('transform', `translate(${x},${y})`)
      .attr('d', KEY_WHISKER_PATH)
      .attr('fill', 'none')
      .attr('stroke', overlay.color)
      .attr('stroke-width', WHISKER_STROKE_WIDTH)
      .attr('stroke-opacity', overlay.opacity)
    return
  }
  const patternId = overlay.pattern === 'stripes' ? sharedStripePatternId(swatch.ownerSVGElement, overlay) : undefined
  const fill = patternId ? `url(#${patternId})` : overlay.color
  selection
    .attr('fill', fill)
    .attr('fill-opacity', overlay.opacity)
}

export interface OverlayKeyEntry {
  title: string
  color: string
  overlay?: ResolvedOverlay
}

function cueKeyEntries(overlay: ResolvedOverlay): OverlayKeyEntry[] {
  const entries: OverlayKeyEntry[] = []
  if (overlay.aboveColor !== undefined) {
    entries.push({ title: overlay.aboveTitle ?? `Above ${overlay.title}`, color: overlay.aboveColor })
  }
  if (overlay.belowColor !== undefined) {
    entries.push({ title: overlay.belowTitle ?? `Below ${overlay.title}`, color: overlay.belowColor })
  }
  return entries
}

export function overlayKeyEntries(overlays: ResolvedOverlay[], withOverlayTitles = true, directLabelled: ResolvedOverlay[] = []): OverlayKeyEntry[] {
  const ordered = [...overlays].sort((a, b) => a.order - b.order)
  return ordered.flatMap((overlay) => {
    const titled = withOverlayTitles && !directLabelled.includes(overlay)
    const own = titled ? [{ title: overlay.title, color: overlay.color, overlay }] : []
    const cues = overlay.kind === 'value' ? cueKeyEntries(overlay) : []
    return [...own, ...cues]
  })
}

export interface OverlayLabelPlan {
  direct: ResolvedOverlay[]
  keyEntries: OverlayKeyEntry[]
}

export function planOverlayLabels(overlays: ResolvedOverlay[], directLabelling: string | boolean | undefined, lpMargins: { right?: number }, eligible: ResolvedOverlay[] = overlays, valueLabelRoom = 0): OverlayLabelPlan {
  const mode = directLabelling ?? DirectLabelMode.Auto
  const wantsDirect = Boolean(mode)
  const direct = wantsDirect ? eligible.filter(hasAnyValue) : []
  if (direct.length > 0) {
    const reservedRight = lpMargins.right ?? 15
    const labelWidth = directLabelWidth(direct)
    lpMargins.right = Math.max(reservedRight, valueLabelRoom + labelWidth)
  }
  const keyEntries = overlayKeyEntries(overlays, true, direct)
  return { direct, keyEntries }
}

export function clearingGeometry(geometryFor: OverlayGeometryFor, barValue: (overlay: ResolvedOverlay, row: number) => number, labelEnd: (overlay: ResolvedOverlay, row: number) => number | undefined): OverlayGeometryFor {
  return (overlay) => {
    const geom = geometryFor(overlay)
    if (!geom) {
      return null
    }
    const clear = (row: number) => {
      const value = barValue(overlay, row)
      const zero = geom.value(0)
      const valueEnd = Number.isFinite(value) ? geom.value(value) : zero
      const barEnd = Math.max(zero, valueEnd)
      const textEnd = labelEnd(overlay, row) ?? barEnd
      return Math.max(barEnd, textEnd)
    }
    return { ...geom, clear }
  }
}

export function drawOverlayDirectLabelGroup(chartArea: SVGGElement, direct: ResolvedOverlay[], labels: readonly string[], rows: number[], geometryFor: OverlayGeometryFor): void {
  if (direct.length === 0) {
    return
  }
  const group = d3.select(chartArea).append('g').attr('class', 'bc-overlay-labels').node()!
  drawOverlayDirectLabels(group, direct, labels, rows, geometryFor)
}

const NO_SERIES = { names: [], colors: [] }

export function drawOverlayLegend(chartArea: SVGGElement, entries: OverlayKeyEntry[], placement: OverlayLegendPlacement, series: { names: string[], colors: string[] } = NO_SERIES): void {
  const titles = [...series.names, ...entries.map(entry => entry.title)]
  const colors = [...series.colors, ...entries.map(entry => entry.color)]
  const { y, position, anchor, width, height, x, inset } = placement
  renderLegend(chartArea, titles, colors, y, position, anchor, width, height, x, [], inset)
  const swatches = chartArea.querySelectorAll<SVGRectElement>('.bc-legend-item rect')
  entries.forEach((entry, index) => {
    if (entry.overlay) {
      styleKeySwatch(swatches[series.names.length + index], entry.overlay)
    }
  })
}

export function overlayTooltipFormat(overlays: ResolvedOverlay[], rowLabels: string[], numberFormat?: string): ((datum: unknown) => string) | undefined {
  if (!overlays.length) {
    return undefined
  }
  const base = makeDefaultFormat(numberFormat)
  const formatNumber = (v: number) => formatValueLabel(v, numberFormat)
  return (datum: unknown) => {
    const { label, seriesName } = datum as { label: string, seriesName?: string }
    const row = rowLabels.indexOf(label)
    const own = overlays.filter(overlay => overlay.bar === undefined || overlay.bar === seriesName)
    const lines = overlayTooltipLines(own, row, formatNumber)
    return [base(datum), ...lines].join('\n')
  }
}
