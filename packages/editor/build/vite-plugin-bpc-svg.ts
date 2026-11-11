import { readFileSync } from 'node:fs'
import { resolve, dirname, basename } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import type { Plugin } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const libSrc = resolve(__dirname, '../../lib/src')

export const ID_TOKEN = '__BPC_ID__'

export const THEME_COLORS = [
  'var(--bc-thumb-series-0)',
  'var(--bc-thumb-series-1)',
  'var(--bc-thumb-series-2)',
  'var(--bc-thumb-series-3)',
]

// Load the PEG.js parser via dynamic import
let parserPromise: Promise<(input: string) => ChartNode> | null = null

function loadParser(): Promise<(input: string) => ChartNode> {
  if (!parserPromise) {
    const grammarUrl = pathToFileURL(resolve(libSrc, 'dsl/grammar.js')).href
    parserPromise = import(grammarUrl).then(
      m => (input: string) => m.parse(input) as ChartNode,
    )
  }
  return parserPromise
}

// ---------------------------------------------------------------------------
// Types (inlined to avoid importing from lib)
// ---------------------------------------------------------------------------

export interface PropertyNode {
  type: 'property'
  key: string
  value: string | number
  values?: (string | number)[]
  isPercentage: boolean
}

export interface ChartNode {
  type: 'chart'
  chartType: string
  properties: PropertyNode[]
  data: { type: 'data', entries: PropertyNode[] } | null
}

export interface ThumbnailOptions {
  edgePadding: boolean
  compact: boolean
}

// ---------------------------------------------------------------------------
// Data extraction
// ---------------------------------------------------------------------------

interface SingleSeriesData {
  kind: 'single'
  labels: string[]
  values: number[]
}

interface MultiSeriesData {
  kind: 'multi'
  labels: string[]
  seriesNames: string[]
  series: number[][] // series[seriesIdx][labelIdx]
  textColumns: { name: string, values: string[] }[]
}

type ChartData = SingleSeriesData | MultiSeriesData

export function extractOptions(chart: ChartNode): ThumbnailOptions {
  const edgePaddingProp = chart.properties.find(p => p.key === 'edgePadding')
  const edgePadding = edgePaddingProp ? String(edgePaddingProp.value) === 'true' : false
  const compact = chart.properties.some(p => p.key === 'colors')
  return { edgePadding, compact }
}

export function extractData(entries: PropertyNode[]): ChartData {
  if (entries.length === 0) {
    return { kind: 'single', labels: [], values: [] }
  }

  if (entries[0].key === 'series' && !entries[0].quotedKey) {
    const seriesNames = entries[0].values
      ? entries[0].values.map(s => String(s).trim())
      : String(entries[0].value).split(',').map(s => s.trim())
    const labels: string[] = []
    const series: number[][] = seriesNames.map(() => [])

    for (let i = 1; i < entries.length; i++) {
      labels.push(entries[i].key)
      const vals = entries[i].values
        ? entries[i].values.map(v => Number(v))
        : String(entries[i].value).split(',').map(s => Number(s.trim()))
      for (let j = 0; j < seriesNames.length; j++) {
        series[j].push(vals[j] ?? 0)
      }
    }
    const textColumns = seriesNames.flatMap((name, j) => {
      const cells = entries.slice(1).map(e => (e.values ?? String(e.value).split(','))[j])
      return cells.every(cell => typeof cell === 'string' && Number.isNaN(Number(cell)))
        ? [{ name, values: cells.map(String) }]
        : []
    })
    return { kind: 'multi', labels, seriesNames, series, textColumns }
  }

  const labels: string[] = []
  const values: number[] = []
  for (const e of entries) {
    labels.push(e.key)
    values.push(Number(e.value))
  }
  return { kind: 'single', labels, values }
}

export function extractColors(chart: ChartNode): string[] {
  const colorsProp = chart.properties.find(p => p.key === 'colors')
  if (!colorsProp) {
    return THEME_COLORS
  }
  const raw = colorsProp.values ?? String(colorsProp.value).split(',')
  return raw.map(c => String(c).trim())
}

// ---------------------------------------------------------------------------
// Scale helpers
// ---------------------------------------------------------------------------

function linearScale(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain
  const [r0, r1] = range
  const span = d1 - d0 || 1
  return (v: number) => r0 + ((v - d0) / span) * (r1 - r0)
}

function pointPositions(count: number, range: [number, number], padding: number): number[] {
  const [r0, r1] = range
  const width = r1 - r0
  if (count <= 1) {
    return [r0 + width / 2]
  }
  // Mimic d3.scalePoint().padding(p) — outer padding = p * step
  const step = width / (count - 1 + padding * 2)
  const offset = padding * step
  return Array.from({ length: count }, (_, i) => r0 + offset + i * step)
}

export function niceTicks(max: number): number[] {
  if (max <= 0) {
    return [0, 1, 2, 3]
  }
  const target = max / 3
  const magnitude = 10 ** Math.floor(Math.log10(target))
  const candidates = [1, 2, 3, 5, 10].map(m => m * magnitude)
  const step = candidates.find(c => c * 3 >= max - 1e-9) ?? candidates[4]
  return [0, step, step * 2, step * 3]
}

// ---------------------------------------------------------------------------
// SVG renderers
// ---------------------------------------------------------------------------

const LAYOUT = {
  width: 96,
  height: 64,
  normal: { l: 12, r: 6, t: 8, b: 12 },
  compact: { l: 6, r: 6, t: 6, b: 6 },
}

const TEXT_ATTRS = 'font-family="Inter, system-ui, sans-serif" font-size="4.6" fill="var(--bc-thumb-label)"'
const AXIS_ATTRS = 'stroke="var(--bc-thumb-axis)" stroke-width="0.8"'
const GRID_SPACING = 6

interface PlotBox {
  left: number
  right: number
  top: number
  bottom: number
}

function fmt(n: number): number {
  return Number(n.toFixed(2))
}

function plotBox(opts: ThumbnailOptions): PlotBox {
  const pad = opts.compact ? LAYOUT.compact : LAYOUT.normal
  return { left: pad.l, right: LAYOUT.width - pad.r, top: pad.t, bottom: LAYOUT.height - pad.b }
}

function valueY(box: PlotBox, ticks: number[]) {
  return linearScale([0, ticks[3]], [box.bottom, box.top])
}

function bandCenters(count: number, from: number, to: number): number[] {
  const step = (to - from) / count
  return Array.from({ length: count }, (_, i) => from + step * (i + 0.5))
}

function svgDoc(frame: string, marks: string, defs = ''): string {
  return `<svg viewBox="0 0 ${LAYOUT.width} ${LAYOUT.height}" xmlns="http://www.w3.org/2000/svg">${defs}<g class="bpc-frame">${frame}</g><g class="bpc-marks">${marks}</g></svg>`
}

function glowDefs(): string {
  const filter = `<filter id="${ID_TOKEN}f" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.3"/></filter>`
  const top = '<stop offset="0" stop-color="var(--bc-thumb-series-0)" stop-opacity="var(--bc-thumb-area-opacity)"/>'
  const bottom = '<stop offset="1" stop-color="var(--bc-thumb-series-0)" stop-opacity="0"/>'
  const gradient = `<linearGradient id="${ID_TOKEN}g" x1="0" x2="0" y1="0" y2="1">${top}${bottom}</linearGradient>`
  return `<defs>${filter}${gradient}</defs>`
}

function glowCopy(markSvg: string): string {
  const glow = markSvg.replace('/>', ` filter="url(#${ID_TOKEN}f)" opacity="var(--bc-thumb-glow)"/>`)
  return glow + markSvg
}

function label(x: number, y: number, anchor: string, text: string | number): string {
  return `<text x="${fmt(x)}" y="${fmt(y)}" text-anchor="${anchor}" ${TEXT_ATTRS}>${text}</text>`
}

function dotRow(y: number, from: number, to: number): string {
  const dots: string[] = []
  for (let x = from; x <= to; x += GRID_SPACING) {
    dots.push(`<circle cx="${fmt(x)}" cy="${fmt(y)}" r="0.55" fill="var(--bc-thumb-grid)"/>`)
  }
  return dots.join('')
}

function dotColumn(x: number, from: number, to: number): string {
  const dots: string[] = []
  for (let y = from; y <= to; y += GRID_SPACING) {
    dots.push(`<circle cx="${fmt(x)}" cy="${fmt(y)}" r="0.55" fill="var(--bc-thumb-grid)"/>`)
  }
  return dots.join('')
}

function valueX(box: PlotBox, ticks: number[]) {
  return linearScale([0, ticks[3]], [box.left, box.right])
}

function horizontalGrid(box: PlotBox): string {
  const columns = [0, 1, 2, 3].map(k => box.left + ((box.right - box.left) * k) / 3)
  return columns.map(x => dotColumn(x, box.top, box.bottom)).join('')
}

function leftAxis(x: number, box: PlotBox): string {
  return `<line x1="${fmt(x)}" x2="${fmt(x)}" y1="${box.top}" y2="${box.bottom}" ${AXIS_ATTRS}/>`
}

function categoryLabelsLeft(box: PlotBox, categoryLabels: string[], categoryYs: number[]): string {
  return categoryLabels.map((l, i) => label(box.left - 2.5, categoryYs[i] + 1.6, 'end', l)).join('')
}

function horizontalFrame(box: PlotBox, categoryLabels: string[], categoryYs: number[], ticks: number[]): string {
  const x = valueX(box, ticks)
  const tickLabels = ticks.map(t => label(x(t), LAYOUT.height - 4, 'middle', fmt(t))).join('')
  return horizontalGrid(box) + categoryLabelsLeft(box, categoryLabels, categoryYs) + leftAxis(box.left, box) + tickLabels
}

function sparseLabels(labels: string[]): string[] {
  if (labels.length <= 4) {
    return labels
  }
  return labels.map((l, i) => (i === 0 || i === labels.length - 1 ? l : ''))
}

function verticalFrame(box: PlotBox, categoryLabels: string[], categoryXs: number[], ticks: number[]): string {
  const y = valueY(box, ticks)
  const grid = ticks.map(t => dotRow(y(t), box.left, box.right)).join('')
  const tickLabels = ticks.map(t => label(box.left - 2.5, y(t) + 1.6, 'end', fmt(t))).join('')
  const baseline = `<line x1="${box.left}" x2="${box.right}" y1="${box.bottom}" y2="${box.bottom}" ${AXIS_ATTRS}/>`
  const shown = sparseLabels(categoryLabels)
  const categories = shown.map((l, i) => (l ? label(categoryXs[i], LAYOUT.height - 4, 'middle', l) : '')).join('')
  return grid + tickLabels + baseline + categories
}

function linePath(xs: number[], ys: number[]): string {
  return xs.map((x, i) => `${i ? 'L' : 'M'}${fmt(x)},${fmt(ys[i])}`).join(' ')
}

function heroLine(xs: number[], ys: number[], color: string, areaBottom?: number): string {
  const d = linePath(xs, ys)
  const closing = areaBottom === undefined ? '' : ` L${fmt(xs.at(-1)!)},${areaBottom} L${fmt(xs[0])},${areaBottom} Z`
  const area = closing ? `<path d="${d}${closing}" fill="url(#${ID_TOKEN}g)"/>` : ''
  const glow = `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.6" filter="url(#${ID_TOKEN}f)" opacity="var(--bc-thumb-glow)"/>`
  const line = `<path d="${d}" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`
  const end = `<circle cx="${fmt(xs.at(-1)!)}" cy="${fmt(ys.at(-1)!)}" r="2" fill="var(--bc-thumb-bg)" stroke="${color}" stroke-width="1.2"/>`
  return area + glow + line + end
}

function lineLayout(count: number, maxVal: number, opts: ThumbnailOptions) {
  const box = plotBox(opts)
  const ticks = niceTicks(maxVal)
  const y = valueY(box, ticks)
  const xs = pointPositions(count, [box.left, box.right], opts.edgePadding ? 0.6 : 0)
  return { box, ticks, y, xs }
}

const CIRC_VB = '0 0 40 40'

function renderBarVertical(data: ChartData, colors: string[], opts: ThumbnailOptions): string {
  if (data.kind !== 'single') {
    return ''
  }
  const { labels, values } = data
  const box = plotBox(opts)
  const maxVal = Math.max(0, ...values)
  const ticks = niceTicks(maxVal)
  const y = valueY(box, ticks)
  const xs = bandCenters(labels.length, box.left, box.right)
  const barWidth = fmt(((box.right - box.left) / labels.length) * 0.56)
  const hero = values.indexOf(maxVal)
  const bars = values.map((v, i) => {
    const top = fmt(y(v))
    const geometry = `x="${fmt(xs[i] - barWidth / 2)}" y="${top}" width="${barWidth}" height="${fmt(box.bottom - top)}" rx="1.2"`
    if (i === hero) {
      return glowCopy(`<rect ${geometry} fill="${colors[0]}"/>`)
    }
    return `<rect ${geometry} fill="${colors[1 % colors.length]}" fill-opacity="0.6"/>`
  })
  return svgDoc(verticalFrame(box, labels, xs, ticks), bars.join(''), glowDefs())
}

function renderBarHorizontal(data: ChartData, colors: string[], opts: ThumbnailOptions): string {
  if (data.kind !== 'single') {
    return ''
  }
  const { labels, values } = data
  const box = plotBox(opts)
  const maxVal = Math.max(0, ...values)
  const ticks = niceTicks(maxVal)
  const x = valueX(box, ticks)
  const ys = bandCenters(labels.length, box.top, box.bottom)
  const barHeight = fmt(((box.bottom - box.top) / labels.length) * 0.6)
  const hero = values.indexOf(maxVal)
  const bars = values.map((v, i) => {
    const geometry = `x="${box.left}" y="${fmt(ys[i] - barHeight / 2)}" width="${fmt(x(v) - box.left)}" height="${barHeight}" rx="1.2"`
    if (i === hero) {
      return glowCopy(`<rect ${geometry} fill="${colors[0]}"/>`)
    }
    return `<rect ${geometry} fill="${colors[1 % colors.length]}" fill-opacity="0.6"/>`
  })
  return svgDoc(horizontalFrame(box, labels, ys, ticks), bars.join(''), glowDefs())
}

function renderBarMulti(data: ChartData, colors: string[], opts: ThumbnailOptions): string {
  if (data.kind !== 'multi') {
    return ''
  }
  const { labels, series } = data
  const box = plotBox(opts)
  const ticks = niceTicks(Math.max(0, ...series.flat()))
  const y = valueY(box, ticks)
  const step = (box.right - box.left) / labels.length
  const groupWidth = step * 0.7
  const barWidth = groupWidth / series.length
  const rects: string[] = []
  for (let li = 0; li < labels.length; li++) {
    const groupLeft = box.left + step * li + (step - groupWidth) / 2
    for (let si = 0; si < series.length; si++) {
      const top = fmt(y(series[si][li]))
      const x = fmt(groupLeft + si * barWidth + 0.4)
      rects.push(`<rect x="${x}" y="${top}" width="${fmt(barWidth - 0.8)}" height="${fmt(box.bottom - top)}" rx="1" fill="${colors[si % colors.length]}"/>`)
    }
  }
  const xs = bandCenters(labels.length, box.left, box.right)
  return svgDoc(verticalFrame(box, labels, xs, ticks), rects.join(''))
}

function renderLine(data: ChartData, colors: string[], opts: ThumbnailOptions): string {
  if (data.kind !== 'single') {
    return ''
  }
  const { labels, values } = data
  const { box, ticks, y, xs } = lineLayout(labels.length, Math.max(0, ...values), opts)
  const ys = values.map(y)
  return svgDoc(verticalFrame(box, labels, xs, ticks), heroLine(xs, ys, colors[0]), glowDefs())
}

function renderLineMulti(data: ChartData, colors: string[], opts: ThumbnailOptions): string {
  if (data.kind !== 'multi') {
    return ''
  }
  const { labels, series } = data
  const { box, ticks, y, xs } = lineLayout(labels.length, Math.max(0, ...series.flat()), opts)
  const others = series.slice(1).map((vals, i) => {
    const d = linePath(xs, vals.map(y))
    return `<path d="${d}" fill="none" stroke="${colors[(i + 1) % colors.length]}" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.85"/>`
  })
  const hero = heroLine(xs, series[0].map(y), colors[0])
  return svgDoc(verticalFrame(box, labels, xs, ticks), others.join('') + hero, glowDefs())
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const x1 = cx + r * Math.cos(startAngle)
  const y1 = cy + r * Math.sin(startAngle)
  const x2 = cx + r * Math.cos(endAngle)
  const y2 = cy + r * Math.sin(endAngle)
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0
  return `${x1.toFixed(3)} ${y1.toFixed(3)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(3)} ${y2.toFixed(3)}`
}

function renderPieOrDonut(data: ChartData, colors: string[], donut: boolean): string {
  if (data.kind !== 'single') {
    return ''
  }
  const { values } = data
  const total = values.reduce((a, b) => a + b, 0)
  if (total === 0) {
    return ''
  }

  const cx = 20, cy = 20, outerR = 18
  const innerR = donut ? outerR * 0.6 : 0
  let angle = -Math.PI / 2

  const paths = values.map((v, i) => {
    const sliceAngle = (v / total) * 2 * Math.PI
    const start = angle
    const end = angle + sliceAngle
    angle = end

    if (innerR > 0) {
      const outerArc = arcPath(cx, cy, outerR, start, end)
      const ix1 = cx + innerR * Math.cos(end)
      const iy1 = cy + innerR * Math.sin(end)
      return `<path d="M ${outerArc} L ${ix1.toFixed(3)} ${iy1.toFixed(3)} A ${innerR} ${innerR} 0 ${sliceAngle > Math.PI ? 1 : 0} 0 ${(cx + innerR * Math.cos(start)).toFixed(3)} ${(cy + innerR * Math.sin(start)).toFixed(3)} Z" fill="${colors[i % colors.length]}"/>`
    }
    else {
      const outerArc = arcPath(cx, cy, outerR, start, end)
      return `<path d="M ${cx} ${cy} L ${outerArc} Z" fill="${colors[i % colors.length]}"/>`
    }
  }).join('')

  return `<svg viewBox="${CIRC_VB}" xmlns="http://www.w3.org/2000/svg">${paths}</svg>`
}

function renderArea(data: ChartData, colors: string[], opts: ThumbnailOptions): string {
  if (data.kind !== 'single') {
    return ''
  }
  const { labels, values } = data
  const { box, ticks, y, xs } = lineLayout(labels.length, Math.max(0, ...values), opts)
  const ys = values.map(y)
  return svgDoc(verticalFrame(box, labels, xs, ticks), heroLine(xs, ys, colors[0], box.bottom), glowDefs())
}

function renderAreaStacked(data: ChartData, colors: string[], opts: ThumbnailOptions): string {
  if (data.kind !== 'multi') {
    return ''
  }
  const { labels, series } = data
  const totals = labels.map((_, li) => series.reduce((sum, s) => sum + s[li], 0))
  const { box, ticks, y, xs } = lineLayout(labels.length, Math.max(0, ...totals), opts)
  const cumulative = labels.map(() => 0)
  const layers = series.map((vals, si) => {
    const lower = cumulative.map(y)
    vals.forEach((v, li) => {
      cumulative[li] += v
    })
    const upper = cumulative.map(y)
    const top = xs.map((x, li) => `${fmt(x)},${fmt(upper[li])}`)
    const bottom = xs.map((x, li) => `${fmt(x)},${fmt(lower[li])}`).reverse()
    const opacity = si > 0 ? 0.75 : 0.95
    return `<path d="M${top.join(' L')} L${bottom.join(' L')} Z" fill="${colors[si % colors.length]}" fill-opacity="${opacity}" stroke="var(--bc-thumb-bg)" stroke-width="0.6"/>`
  })
  return svgDoc(verticalFrame(box, labels, xs, ticks), layers.join(''))
}

function renderColumnStacked(data: ChartData, colors: string[], opts: ThumbnailOptions): string {
  if (data.kind !== 'multi') {
    return ''
  }
  const { labels, series } = data
  const box = plotBox(opts)
  const totals = labels.map((_, li) => series.reduce((sum, s) => sum + s[li], 0))
  const ticks = niceTicks(Math.max(0, ...totals))
  const y = valueY(box, ticks)
  const xs = bandCenters(labels.length, box.left, box.right)
  const barWidth = ((box.right - box.left) / labels.length) * 0.56
  const rects: string[] = []
  for (let li = 0; li < labels.length; li++) {
    let acc = 0
    for (let si = 0; si < series.length; si++) {
      const top = y(acc + series[si][li])
      const gap = si > 0 ? 0.5 : 0
      const height = Math.max(0, y(acc) - top - gap)
      rects.push(`<rect x="${fmt(xs[li] - barWidth / 2)}" y="${fmt(top)}" width="${fmt(barWidth)}" height="${fmt(height)}" rx="1" fill="${colors[si % colors.length]}"/>`)
      acc += series[si][li]
    }
  }
  return svgDoc(verticalFrame(box, labels, xs, ticks), rects.join(''))
}

function renderBarSplit(data: ChartData, colors: string[], opts: ThumbnailOptions): string {
  if (data.kind !== 'multi') {
    return ''
  }
  const { labels, series, seriesNames } = data
  const box = plotBox(opts)
  const gap = 3
  const panelWidth = (box.right - box.left - gap * (series.length - 1)) / series.length
  const ticks = niceTicks(Math.max(0, ...series.flat()))
  const x = linearScale([0, ticks[3]], [0, panelWidth])
  const ys = bandCenters(labels.length, box.top, box.bottom)
  const barHeight = ((box.bottom - box.top) / labels.length) * 0.6
  const frame: string[] = [horizontalGrid(box), categoryLabelsLeft(box, labels, ys)]
  const rects: string[] = []
  for (let si = 0; si < series.length; si++) {
    const panelLeft = box.left + si * (panelWidth + gap)
    frame.push(leftAxis(panelLeft, box))
    frame.push(label(panelLeft + panelWidth / 2, LAYOUT.height - 4, 'middle', seriesNames[si]))
    for (let li = 0; li < labels.length; li++) {
      rects.push(`<rect x="${fmt(panelLeft)}" y="${fmt(ys[li] - barHeight / 2)}" width="${fmt(x(series[si][li]))}" height="${fmt(barHeight)}" rx="1" fill="${colors[si % colors.length]}"/>`)
    }
  }
  return svgDoc(frame.join(''), rects.join(''))
}

function renderBarGrouped(data: ChartData, colors: string[], opts: ThumbnailOptions): string {
  if (data.kind !== 'multi') {
    return ''
  }
  const { labels, series } = data
  const box = plotBox(opts)
  const ticks = niceTicks(Math.max(0, ...series.flat()))
  const x = valueX(box, ticks)
  const step = (box.bottom - box.top) / labels.length
  const groupHeight = step * 0.8
  const barHeight = groupHeight / series.length
  const rects: string[] = []
  for (let li = 0; li < labels.length; li++) {
    const groupTop = box.top + step * li + (step - groupHeight) / 2
    for (let si = 0; si < series.length; si++) {
      const y = fmt(groupTop + si * barHeight + 0.3)
      rects.push(`<rect x="${box.left}" y="${y}" width="${fmt(x(series[si][li]) - box.left)}" height="${fmt(barHeight - 0.6)}" rx="0.8" fill="${colors[si % colors.length]}"/>`)
    }
  }
  const ys = bandCenters(labels.length, box.top, box.bottom)
  return svgDoc(horizontalFrame(box, labels, ys, ticks), rects.join(''))
}

function renderBarStacked(data: ChartData, colors: string[], opts: ThumbnailOptions): string {
  if (data.kind !== 'multi') {
    return ''
  }
  const { labels, series } = data
  const box = plotBox(opts)
  const totals = labels.map((_, li) => series.reduce((sum, s) => sum + s[li], 0))
  const ticks = niceTicks(Math.max(0, ...totals))
  const x = valueX(box, ticks)
  const ys = bandCenters(labels.length, box.top, box.bottom)
  const barHeight = ((box.bottom - box.top) / labels.length) * 0.6
  const rects: string[] = []
  for (let li = 0; li < labels.length; li++) {
    let acc = 0
    for (let si = 0; si < series.length; si++) {
      const gap = si > 0 ? 0.5 : 0
      const left = x(acc) + gap
      const width = Math.max(0, x(acc + series[si][li]) - left)
      rects.push(`<rect x="${fmt(left)}" y="${fmt(ys[li] - barHeight / 2)}" width="${fmt(width)}" height="${fmt(barHeight)}" rx="1" fill="${colors[si % colors.length]}"/>`)
      acc += series[si][li]
    }
  }
  return svgDoc(horizontalFrame(box, labels, ys, ticks), rects.join(''))
}

function scatterPoints(data: MultiSeriesData) {
  const textNames = new Set(data.textColumns.map(c => c.name))
  const [x, y, size] = data.series.filter((_, i) => !textNames.has(data.seriesNames[i]))
  const groups = data.textColumns[0]?.values
  return data.labels.flatMap((_, i) => {
    if (!Number.isFinite(x?.[i]) || !Number.isFinite(y?.[i])) {
      return []
    }
    return [{ x: x[i], y: y[i], size: size?.[i] > 0 ? size[i] : 1, group: groups?.[i] }]
  })
}

function renderScatter(data: ChartData, colors: string[], opts: ThumbnailOptions): string {
  if (data.kind !== 'multi') {
    return ''
  }
  const points = scatterPoints(data)
  if (points.length === 0) {
    return ''
  }
  const box = plotBox(opts)
  const sizes = points.map(p => p.size)
  const xTicks = niceTicks(Math.max(0, ...points.map(p => p.x)))
  const yTicks = niceTicks(Math.max(0, ...points.map(p => p.y)))
  const x = valueX(box, xTicks)
  const y = valueY(box, yTicks)
  const radius = linearScale([Math.min(...sizes), Math.max(...sizes)], [1.6, 3])
  const groups = [...new Set(points.map(p => p.group))]
  const circles = points.map((p) => {
    const color = colors[groups.indexOf(p.group) % colors.length]
    return `<circle cx="${fmt(x(p.x))}" cy="${fmt(y(p.y))}" r="${fmt(radius(p.size))}" fill="${color}" fill-opacity="0.85" stroke="var(--bc-thumb-bg)" stroke-width="0.5"/>`
  })
  const tickLabels = xTicks.map(t => String(fmt(t)))
  const frame = verticalFrame(box, tickLabels, xTicks.map(x), yTicks)
  return svgDoc(frame, circles.join(''))
}

function renderDotPlot(data: ChartData, colors: string[], opts: ThumbnailOptions): string {
  if (data.kind !== 'multi') {
    return ''
  }
  const { labels, series } = data
  const box = plotBox(opts)
  const ticks = niceTicks(Math.max(0, ...series.flat()))
  const x = valueX(box, ticks)
  const ys = bandCenters(labels.length, box.top, box.bottom)
  const marks = labels.map((_, li) => {
    const values = series.map(s => s[li])
    const y = fmt(ys[li])
    const connector = `<line x1="${fmt(x(Math.min(...values)))}" x2="${fmt(x(Math.max(...values)))}" y1="${y}" y2="${y}" stroke="var(--bc-thumb-axis)" stroke-width="1.4" stroke-linecap="round"/>`
    const others = values.slice(1).map((v, i) => `<circle cx="${fmt(x(v))}" cy="${y}" r="2.2" fill="${colors[(i + 1) % colors.length]}"/>`)
    const hero = `<circle cx="${fmt(x(values[0]))}" cy="${y}" r="2.6" fill="${colors[0]}" stroke="var(--bc-thumb-bg)" stroke-width="0.6"/>`
    return connector + others.join('') + hero
  })
  return svgDoc(horizontalFrame(box, labels, ys, ticks), marks.join(''))
}

export function renderToSvg(chartType: string, data: ChartData, colors: string[], opts: ThumbnailOptions = { edgePadding: false, compact: false }): string {
  switch (chartType) {
    case 'bar-vertical': return renderBarVertical(data, colors, opts)
    case 'bar-horizontal': return renderBarHorizontal(data, colors, opts)
    case 'bar-multi': return renderBarMulti(data, colors, opts)
    case 'line': return renderLine(data, colors, opts)
    case 'line-multi': return renderLineMulti(data, colors, opts)
    case 'pie': return renderPieOrDonut(data, colors, false)
    case 'donut': return renderPieOrDonut(data, colors, true)
    case 'area': return renderArea(data, colors, opts)
    case 'area-stacked': return renderAreaStacked(data, colors, opts)
    case 'column-stacked': return renderColumnStacked(data, colors, opts)
    case 'bar-stacked': return renderBarStacked(data, colors, opts)
    case 'bar-split': return renderBarSplit(data, colors, opts)
    case 'bar-grouped': return renderBarGrouped(data, colors, opts)
    case 'scatter': return renderScatter(data, colors, opts)
    case 'dot-plot': return renderDotPlot(data, colors, opts)
    default: return ''
  }
}

// ---------------------------------------------------------------------------
// Plugin
// ---------------------------------------------------------------------------

export default function bpcSvgPlugin(): Plugin {
  return {
    name: 'vite-plugin-bpc-svg',
    enforce: 'pre',

    async load(id) {
      if (!id.endsWith('.bpc') || id.includes('?')) {
        return
      }

      const source = readFileSync(id, 'utf-8')
      const parse = await loadParser()
      const ast = parse(source)
      const data = extractData(ast.data?.entries ?? [])
      const colors = extractColors(ast)
      const opts = extractOptions(ast)
      const svg = renderToSvg(ast.chartType, data, colors, opts)
      const name = basename(id, '.bpc')

      // Escape backticks and backslashes for template literal
      const escaped = svg.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')

      return {
        code: `
import { h } from 'vue'
const svg = \`${escaped}\`
let count = 0
export default {
  setup() {
    const html = svg.replaceAll('${ID_TOKEN}', \`bpc-${name}-\${count++}-\`)
    return () => h('div', { innerHTML: html, style: 'width:100%;height:100%' })
  },
}
`,
        map: null,
      }
    },
  }
}
