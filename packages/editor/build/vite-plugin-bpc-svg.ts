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

function bandPositions(count: number, range: [number, number], padding = 0.2) {
  const [r0, r1] = range
  const total = r1 - r0
  const step = total / count
  const bandWidth = step * (1 - padding)
  const offset = (step - bandWidth) / 2
  return {
    bandWidth,
    positions: Array.from({ length: count }, (_, i) => r0 + i * step + offset),
  }
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

const RECT_VB = '0 0 48 36'
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

function renderBarHorizontal(data: ChartData, colors: string[]): string {
  if (data.kind !== 'single') {
    return ''
  }
  const { labels, values } = data
  const maxVal = Math.max(...values)
  const scale = linearScale([0, maxVal], [0, 42])
  const { bandWidth, positions } = bandPositions(labels.length, [2, 34])

  const rects = values.map((v, i) => {
    const w = scale(v)
    return `<rect x="2" y="${positions[i]}" width="${w}" height="${bandWidth}" fill="${colors[0]}" rx="0.5"/>`
  }).join('')

  return `<svg viewBox="${RECT_VB}" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`
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
  const maxVal = Math.max(...values)
  const minVal = Math.min(...values)
  const yScale = linearScale([minVal, maxVal], [32, 4])
  const xs = pointPositions(labels.length, [2, 46], opts.edgePadding ? 0.6 : 0)

  const points = values.map((v, i) => `${xs[i].toFixed(2)},${yScale(v).toFixed(2)}`).join(' ')

  return `<svg viewBox="${RECT_VB}" xmlns="http://www.w3.org/2000/svg"><polyline points="${points}" fill="none" stroke="${colors[0]}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
}

function renderLineMulti(data: ChartData, colors: string[], opts: ThumbnailOptions): string {
  if (data.kind !== 'multi') {
    return ''
  }
  const { labels, series } = data
  const allVals = series.flat()
  const maxVal = Math.max(...allVals)
  const minVal = Math.min(...allVals)
  const yScale = linearScale([minVal, maxVal], [32, 4])
  const xs = pointPositions(labels.length, [2, 46], opts.edgePadding ? 0.6 : 0)

  const lines = series.map((vals, si) => {
    const points = vals.map((v, i) => `${xs[i].toFixed(2)},${yScale(v).toFixed(2)}`).join(' ')
    return `<polyline points="${points}" fill="none" stroke="${colors[si % colors.length]}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`
  }).join('')

  return `<svg viewBox="${RECT_VB}" xmlns="http://www.w3.org/2000/svg">${lines}</svg>`
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
  const maxVal = Math.max(...values)
  const minVal = Math.min(0, ...values)
  const yScale = linearScale([minVal, maxVal], [32, 4])
  const xs = pointPositions(labels.length, [2, 46], opts.edgePadding ? 0.6 : 0)

  const linePoints = values.map((v, i) => `${xs[i].toFixed(2)},${yScale(v).toFixed(2)}`)
  const areaPath = `M ${linePoints[0]} ${linePoints.slice(1).map(p => `L ${p}`).join(' ')} L ${xs[values.length - 1].toFixed(2)},34 L ${xs[0].toFixed(2)},34 Z`
  const polyPoints = linePoints.join(' ')

  return `<svg viewBox="${RECT_VB}" xmlns="http://www.w3.org/2000/svg"><path d="${areaPath}" fill="${colors[0]}" opacity="0.3"/><polyline points="${polyPoints}" fill="none" stroke="${colors[0]}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
}

function renderAreaStacked(data: ChartData, colors: string[], opts: ThumbnailOptions): string {
  if (data.kind !== 'multi') {
    return ''
  }
  const { labels, series } = data
  const stacked: number[][] = series.map(() => labels.map(() => 0))
  for (let li = 0; li < labels.length; li++) {
    let cumulative = 0
    for (let si = 0; si < series.length; si++) {
      cumulative += series[si][li]
      stacked[si][li] = cumulative
    }
  }
  const maxVal = Math.max(...stacked[stacked.length - 1])
  const yScale = linearScale([0, maxVal], [32, 4])
  const xs = pointPositions(labels.length, [2, 46], opts.edgePadding ? 0.6 : 0)

  const areas: string[] = []
  for (let si = series.length - 1; si >= 0; si--) {
    const topPoints = labels.map((_, li) => `${xs[li].toFixed(2)},${yScale(stacked[si][li]).toFixed(2)}`)
    const bottomPoints = si === 0
      ? labels.map((_, li) => `${xs[li].toFixed(2)},34`).reverse()
      : labels.map((_, li) => `${xs[li].toFixed(2)},${yScale(stacked[si - 1][li]).toFixed(2)}`).reverse()
    const d = `M ${topPoints[0]} ${topPoints.slice(1).map(p => `L ${p}`).join(' ')} ${bottomPoints.map(p => `L ${p}`).join(' ')} Z`
    areas.push(`<path d="${d}" fill="${colors[si % colors.length]}" opacity="0.7"/>`)
  }

  return `<svg viewBox="${RECT_VB}" xmlns="http://www.w3.org/2000/svg">${areas.join('')}</svg>`
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

function renderBarSplit(data: ChartData, colors: string[]): string {
  if (data.kind !== 'multi') {
    return ''
  }
  const { labels, series } = data
  const n = series.length
  const gap = 2
  const leftMargin = 2
  const totalWidth = 48 - leftMargin * 2
  const panelWidth = (totalWidth - (n - 1) * gap) / n
  const maxVal = Math.max(...series.flat())
  const scale = linearScale([0, maxVal], [0, panelWidth])
  const { bandWidth, positions } = bandPositions(labels.length, [2, 34])

  const rects: string[] = []
  for (let si = 0; si < n; si++) {
    const xOffset = leftMargin + si * (panelWidth + gap)
    for (let li = 0; li < labels.length; li++) {
      const w = scale(series[si][li])
      rects.push(`<rect x="${xOffset.toFixed(2)}" y="${positions[li].toFixed(2)}" width="${w.toFixed(2)}" height="${bandWidth.toFixed(2)}" fill="${colors[si % colors.length]}" rx="0.5"/>`)
    }
  }

  return `<svg viewBox="${RECT_VB}" xmlns="http://www.w3.org/2000/svg">${rects.join('')}</svg>`
}

function renderBarGrouped(data: ChartData, colors: string[]): string {
  if (data.kind !== 'multi') {
    return ''
  }
  const { labels, series } = data
  const allVals = series.flat()
  const maxVal = Math.max(...allVals)
  const scale = linearScale([0, maxVal], [0, 42])
  const seriesCount = series.length
  const { bandWidth: groupHeight, positions: groupPositions } = bandPositions(labels.length, [2, 34], 0.15)
  const barHeight = groupHeight / seriesCount

  const rects: string[] = []
  for (let li = 0; li < labels.length; li++) {
    for (let si = 0; si < seriesCount; si++) {
      const w = scale(series[si][li])
      const y = groupPositions[li] + si * barHeight
      rects.push(`<rect x="2" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${(barHeight * 0.9).toFixed(2)}" fill="${colors[si % colors.length]}" rx="0.5"/>`)
    }
  }

  return `<svg viewBox="${RECT_VB}" xmlns="http://www.w3.org/2000/svg">${rects.join('')}</svg>`
}

function renderBarStacked(data: ChartData, colors: string[]): string {
  if (data.kind !== 'multi') {
    return ''
  }
  const { labels, series } = data
  const totals = labels.map((_, li) => series.reduce((sum, s) => sum + s[li], 0))
  const maxVal = Math.max(...totals)
  const scale = linearScale([0, maxVal], [0, 42])
  const { bandWidth, positions } = bandPositions(labels.length, [2, 34])

  const rects: string[] = []
  for (let li = 0; li < labels.length; li++) {
    let cumWidth = 0
    for (let si = 0; si < series.length; si++) {
      const w = scale(series[si][li])
      const x = 2 + cumWidth
      rects.push(`<rect x="${x.toFixed(2)}" y="${positions[li].toFixed(2)}" width="${w.toFixed(2)}" height="${bandWidth.toFixed(2)}" fill="${colors[si % colors.length]}" rx="0.5"/>`)
      cumWidth += w
    }
  }

  return `<svg viewBox="${RECT_VB}" xmlns="http://www.w3.org/2000/svg">${rects.join('')}</svg>`
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

function renderScatter(data: ChartData, colors: string[]): string {
  if (data.kind !== 'multi') {
    return ''
  }
  const points = scatterPoints(data)
  if (points.length === 0) {
    return ''
  }
  const xs = points.map(p => p.x)
  const ys = points.map(p => p.y)
  const sizes = points.map(p => p.size)
  const xScale = linearScale([Math.min(...xs), Math.max(...xs)], [5, 43])
  const yScale = linearScale([Math.min(...ys), Math.max(...ys)], [31, 5])
  const radius = linearScale([Math.min(...sizes), Math.max(...sizes)], [1.5, 3.5])
  const groups = [...new Set(points.map(p => p.group))]

  const circles = points.map((p) => {
    const color = colors[groups.indexOf(p.group) % colors.length]
    return `<circle cx="${xScale(p.x).toFixed(2)}" cy="${yScale(p.y).toFixed(2)}" r="${radius(p.size).toFixed(2)}" fill="${color}" fill-opacity="0.7"/>`
  }).join('')

  return `<svg viewBox="${RECT_VB}" xmlns="http://www.w3.org/2000/svg">${circles}</svg>`
}

function renderDotPlot(data: ChartData, colors: string[]): string {
  if (data.kind !== 'multi') {
    return ''
  }
  const { labels, series } = data
  const all = series.flat()
  const xScale = linearScale([Math.min(...all), Math.max(...all)], [4, 44])
  const { bandWidth, positions } = bandPositions(labels.length, [2, 34])

  const marks = labels.map((_, li) => {
    const values = series.map(s => s[li])
    const y = (positions[li] + bandWidth / 2).toFixed(2)
    const line = `<line x1="${xScale(Math.min(...values)).toFixed(2)}" y1="${y}" x2="${xScale(Math.max(...values)).toFixed(2)}" y2="${y}" stroke="#adb5bd" stroke-width="0.8"/>`
    const dots = values.map((v, si) => `<circle cx="${xScale(v).toFixed(2)}" cy="${y}" r="2" fill="${colors[si % colors.length]}"/>`)
    return line + dots.join('')
  })

  return `<svg viewBox="${RECT_VB}" xmlns="http://www.w3.org/2000/svg">${marks.join('')}</svg>`
}

export function renderToSvg(chartType: string, data: ChartData, colors: string[], opts: ThumbnailOptions = { edgePadding: false, compact: false }): string {
  switch (chartType) {
    case 'bar-vertical': return renderBarVertical(data, colors, opts)
    case 'bar-horizontal': return renderBarHorizontal(data, colors)
    case 'bar-multi': return renderBarMulti(data, colors, opts)
    case 'line': return renderLine(data, colors, opts)
    case 'line-multi': return renderLineMulti(data, colors, opts)
    case 'pie': return renderPieOrDonut(data, colors, false)
    case 'donut': return renderPieOrDonut(data, colors, true)
    case 'area': return renderArea(data, colors, opts)
    case 'area-stacked': return renderAreaStacked(data, colors, opts)
    case 'column-stacked': return renderColumnStacked(data, colors, opts)
    case 'bar-stacked': return renderBarStacked(data, colors)
    case 'bar-split': return renderBarSplit(data, colors)
    case 'bar-grouped': return renderBarGrouped(data, colors)
    case 'scatter': return renderScatter(data, colors)
    case 'dot-plot': return renderDotPlot(data, colors)
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
