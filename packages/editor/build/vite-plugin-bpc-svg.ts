import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import type { Plugin } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const libSrc = resolve(__dirname, '../../lib/src')

const DEFAULT_COLORS = ['#6878E8', '#E07B38', '#B83B5E', '#F0C33E', '#2DAA90', '#503880']

// Palette lookup inlined to avoid importing @blueprint-chart/lib at the Node level.
// Only the palette names we actually reference in thumbnails matter, but we include
// all of them so any .bpc file works.
const PALETTE_MAP: Record<string, readonly string[]> = Object.create(null)

function loadPaletteMap() {
  if (Object.keys(PALETTE_MAP).length > 0) {
    return
  }
  // Read the palettes source to extract the data.
  const src = readFileSync(resolve(libSrc, 'charts/palettes.ts'), 'utf-8')
  // Extract palette entries using regex - each line looks like:
  // { name: 'X', label: 'Y', colors: ['#...', ...] },
  const re = /\{\s*name:\s*'([^']+)',\s*label:\s*'[^']+',\s*colors:\s*\[([^\]]+)\]\s*\}/g
  let m
  while ((m = re.exec(src)) !== null) {
    const name = m[1]
    const colors = m[2].match(/'#[0-9a-fA-F]+'/g)?.map(c => c.slice(1, -1)) ?? []
    PALETTE_MAP[name] = colors
  }
}

function resolvePalette(paletteName: string | undefined): string[] | undefined {
  if (!paletteName) {
    return undefined
  }
  loadPaletteMap()
  const scheme = PALETTE_MAP[paletteName]
  return scheme ? [...scheme] : undefined
}

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
}

type ChartData = SingleSeriesData | MultiSeriesData

export function extractOptions(chart: ChartNode): ThumbnailOptions {
  const edgePaddingProp = chart.properties.find(p => p.key === 'edgePadding')
  const edgePadding = edgePaddingProp ? String(edgePaddingProp.value) === 'true' : false
  return { edgePadding }
}

export function extractData(entries: PropertyNode[]): ChartData {
  if (entries.length === 0) {
    return { kind: 'single', labels: [], values: [] }
  }

  if (entries[0].key === '_series') {
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
    return { kind: 'multi', labels, seriesNames, series }
  }

  const labels: string[] = []
  const values: number[] = []
  for (const e of entries) {
    labels.push(e.key)
    values.push(Number(e.value))
  }
  return { kind: 'single', labels, values }
}

function extractColors(chart: ChartNode): string[] {
  const colorsProp = chart.properties.find(p => p.key === 'colors')
  if (colorsProp) {
    return colorsProp.values
      ? colorsProp.values.map(c => String(c).trim())
      : String(colorsProp.value).split(',').map(c => c.trim())
  }
  const paletteProp = chart.properties.find(p => p.key === 'colorPalette')
  if (paletteProp) {
    const colors = resolvePalette(String(paletteProp.value))
    if (colors) {
      return colors
    }
  }
  return DEFAULT_COLORS
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

// ---------------------------------------------------------------------------
// SVG renderers
// ---------------------------------------------------------------------------

const RECT_VB = '0 0 48 36'
const CIRC_VB = '0 0 40 40'

function renderBarVertical(data: ChartData, colors: string[]): string {
  if (data.kind !== 'single') {
    return ''
  }
  const { labels, values } = data
  const maxVal = Math.max(...values)
  const scale = linearScale([0, maxVal], [0, 30])
  const { bandWidth, positions } = bandPositions(labels.length, [2, 46])

  const rects = values.map((v, i) => {
    const h = scale(v)
    const y = 34 - h
    return `<rect x="${positions[i]}" y="${y}" width="${bandWidth}" height="${h}" fill="${colors[0]}" rx="0.5"/>`
  }).join('')

  return `<svg viewBox="${RECT_VB}" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`
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

function renderBarMulti(data: ChartData, colors: string[]): string {
  if (data.kind !== 'multi') {
    return ''
  }
  const { labels, series } = data
  const allVals = series.flat()
  const maxVal = Math.max(...allVals)
  const scale = linearScale([0, maxVal], [0, 30])
  const { bandWidth: groupWidth, positions: groupPositions } = bandPositions(labels.length, [2, 46], 0.15)
  const seriesCount = series.length
  const barWidth = groupWidth / seriesCount

  const rects: string[] = []
  for (let li = 0; li < labels.length; li++) {
    for (let si = 0; si < seriesCount; si++) {
      const h = scale(series[si][li])
      const x = groupPositions[li] + si * barWidth
      const y = 34 - h
      rects.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${(barWidth * 0.9).toFixed(2)}" height="${h.toFixed(2)}" fill="${colors[si % colors.length]}" rx="0.5"/>`)
    }
  }

  return `<svg viewBox="${RECT_VB}" xmlns="http://www.w3.org/2000/svg">${rects.join('')}</svg>`
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

function renderColumnStacked(data: ChartData, colors: string[]): string {
  if (data.kind !== 'multi') {
    return ''
  }
  const { labels, series } = data
  const totals = labels.map((_, li) => series.reduce((sum, s) => sum + s[li], 0))
  const maxVal = Math.max(...totals)
  const scale = linearScale([0, maxVal], [0, 30])
  const { bandWidth, positions } = bandPositions(labels.length, [2, 46])

  const rects: string[] = []
  for (let li = 0; li < labels.length; li++) {
    let cumHeight = 0
    for (let si = 0; si < series.length; si++) {
      const h = scale(series[si][li])
      const y = 34 - cumHeight - h
      rects.push(`<rect x="${positions[li].toFixed(2)}" y="${y.toFixed(2)}" width="${bandWidth.toFixed(2)}" height="${h.toFixed(2)}" fill="${colors[si % colors.length]}" rx="0.5"/>`)
      cumHeight += h
    }
  }

  return `<svg viewBox="${RECT_VB}" xmlns="http://www.w3.org/2000/svg">${rects.join('')}</svg>`
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

export function renderToSvg(chartType: string, data: ChartData, colors: string[], opts: ThumbnailOptions = { edgePadding: false }): string {
  switch (chartType) {
    case 'bar-vertical': return renderBarVertical(data, colors)
    case 'bar-horizontal': return renderBarHorizontal(data, colors)
    case 'bar-multi': return renderBarMulti(data, colors)
    case 'line': return renderLine(data, colors, opts)
    case 'line-multi': return renderLineMulti(data, colors, opts)
    case 'pie': return renderPieOrDonut(data, colors, false)
    case 'donut': return renderPieOrDonut(data, colors, true)
    case 'area': return renderArea(data, colors, opts)
    case 'area-stacked': return renderAreaStacked(data, colors, opts)
    case 'column-stacked': return renderColumnStacked(data, colors)
    case 'bar-stacked': return renderBarStacked(data, colors)
    case 'bar-split': return renderBarSplit(data, colors)
    case 'bar-grouped': return renderBarGrouped(data, colors)
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

      // Escape backticks and backslashes for template literal
      const escaped = svg.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')

      return {
        code: `
import { h } from 'vue'
export default { render() { return h('div', { innerHTML: \`${escaped}\`, style: 'width:100%;height:100%' }) } }
`,
        map: null,
      }
    },
  }
}
