import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import type { AreaFillConfig, ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas, labelPositionMargins, estimateVerticalLabelWidth } from '../../canvas/canvas'
import { renderVerticalAxis } from '../../axis/vertical-axis'
import { renderHorizontalAxis, type AnyXScale } from '../../axis/horizontal-axis'
import { detectDates } from '../../date-parse'
import { renderLegend } from '../../legend/legend'
import { estimateLegendSize, estimateDirectLabelWidth } from '../../legend/legend-size'
import { computeLinearDomain } from '../../scale-helpers'
import { resolveCurve } from '../../curves'
import { setupProximityInteraction } from '../../plugins/proximity'
import { renderLineSymbols } from '../../line-symbols'
import { resolveSeriesColor, resolveSeriesDash, resolveSeriesWidth, resolveSeriesInterpolation, isSeriesHidden, resolveSeriesLabelMode, resolveSeriesValueLabels, resolveSeriesLineSymbols } from '../../series-helpers'
import type { LineSymbolConfig } from '../../types'
import { spreadLabels } from '../../plugins/arc-labels'

const DEFAULT_COLORS = [
  '#4e79a7', '#f28e2b', '#e15759', '#76b7b2',
  '#59a14f', '#edc948', '#b07aa1', '#ff9da7',
]

interface SeriesDatum {
  name: string
  values: number[]
  colorIndex: number
}

interface DotDatum {
  label: string
  value: number
  series: string
  colorIndex: number
}

class LineMultiChart extends D3Blueprint<SeriesDatum[]> {
  initialize() {
    this.defineMultiLineConfigs()
    const areaGroup = this.base.append('g')
    const g = this.base.append('g')
    const dotsGroup = this.base.append('g')

    this.layer('areas', areaGroup, {
      dataBind: (sel, data) => sel.selectAll('.bc-area').data(this.config('areaFill') ? data : []),
      insert: sel => sel.append('path').attr('class', 'bc-area'),
      events: { enter: this.enterAreas.bind(this) },
    })

    this.layer('lines', g, {
      dataBind: (sel, data) => sel.selectAll('.bc-line').data(data),
      insert: sel => sel.append('path').attr('class', 'bc-line'),
      events: { enter: this.enterLines.bind(this) },
    })

    this.layer('dots', dotsGroup, {
      dataBind: sel => sel.selectAll('.bc-dot').data(this.config('dots') as DotDatum[]),
      insert: sel => sel.append('circle').attr('class', 'bc-dot'),
      events: { enter: this.enterDots.bind(this) },
    })
  }

  private defineMultiLineConfigs() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.configDefine('xPos', { defaultValue: (i: number) => 0 })
    this.configDefine('y', { defaultValue: d3.scaleLinear() })
    this.configDefine('colors', { defaultValue: DEFAULT_COLORS })
    this.configDefine('labels', { defaultValue: [] as string[] })
    this.configDefine('curve', { defaultValue: d3.curveLinear })
    this.configDefine('areaFill', { defaultValue: false })
    this.configDefine('areaFillOpacity', { defaultValue: 0.2 })
    this.configDefine('height', { defaultValue: 0 })
    this.configDefine('dots', { defaultValue: [] as DotDatum[] })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private enterAreas(sel: any) {
    const xPos = this.config('xPos') as (i: number) => number
    const y = this.config('y') as d3.ScaleLinear<number, number>
    const colors = this.config('colors') as string[]
    const curve = this.config('curve') as d3.CurveFactory
    const h = this.config('height') as number
    const opacity = this.config('areaFillOpacity') as number
    sel
      .attr('data-series', (d: SeriesDatum) => d.colorIndex)
      .attr('fill', (d: SeriesDatum) => colors[d.colorIndex % colors.length])
      .attr('opacity', opacity)
      .attr('d', (d: SeriesDatum) => {
        const areaGen = d3.area<number>()
          .curve(curve).x((_v, i) => xPos(i)).y0(h).y1(v => y(v))
        return areaGen(d.values)
      })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private enterLines(sel: any) {
    const xPos = this.config('xPos') as (i: number) => number
    const y = this.config('y') as d3.ScaleLinear<number, number>
    const colors = this.config('colors') as string[]
    sel
      .attr('data-series', (d: SeriesDatum) => d.colorIndex)
      .attr('fill', 'none')
      .attr('stroke', (d: SeriesDatum) => colors[d.colorIndex % colors.length])
      .attr('stroke-width', 2)
      .attr('d', (d: SeriesDatum) => {
        const curve = this.config('curve') as d3.CurveFactory
        const lineGen = d3.line<number>().curve(curve).x((_v, i) => xPos(i)).y(v => y(v))
        return lineGen(d.values)
      })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private enterDots(sel: any) {
    const xPos = this.config('xPos') as (i: number) => number
    const y = this.config('y') as d3.ScaleLinear<number, number>
    const colors = this.config('colors') as string[]
    const labels = this.config('labels') as string[]
    sel
      .attr('data-series', (d: DotDatum) => d.colorIndex)
      .attr('cx', (d: DotDatum) => xPos(labels.indexOf(d.label)))
      .attr('cy', (d: DotDatum) => y(d.value))
      .attr('r', 3)
      .attr('fill', (d: DotDatum) => colors[d.colorIndex % colors.length])
  }
}

interface LineMultiLayout {
  chartArea: SVGGElement
  width: number
  height: number
  margin: { top: number }
  showLegend: boolean
  legendPos: string
  legendAnchor: string
  legendSize: { width: number, height: number }
}

interface LineMultiCtx {
  allSeries: { name: string, values: number[] }[]
  series: { name: string, values: number[] }[]
  seriesNames: string[]
  colors: string[]
  overrides: ChartOptions['seriesOverrides']
  globalLabelMode: string
}

export function render(
  container: HTMLElement,
  data: ChartData,
  options: ChartOptions = {},
): void {
  const { body } = createFrame(container, options.frame)
  const ctx = buildLineMultiCtx(data, options)
  const layout = buildLineMultiLayout(body, ctx, options)
  const { xScale, xPos } = buildLineMultiXScale(data, layout.width, options)
  const y = buildLineMultiYScale(ctx, layout.height, options)

  renderLineMultiAxes(layout, xScale, y, options)
  const clippedArea = createLineMultiClipGroup(layout.chartArea, layout.width, layout.height)

  drawLineMultiContent(clippedArea, layout, data, ctx, xPos, y, options)
  renderLineMultiSymbols(layout.chartArea, data, ctx, xPos, y, options)
  renderLineMultiDirectLabels(layout.chartArea, data, ctx, xPos, y, layout.height)
  renderLineMultiLegend(layout, ctx)
}

function buildLineMultiCtx(data: ChartData, options: ChartOptions): LineMultiCtx {
  const allSeries = data.series ?? []
  let series = allSeries.filter(s => !isSeriesHidden(s.name, options.seriesOverrides))
  if (options.sortMode === 'total' || options.sortMode === 'within-groups') {
    series = [...series].sort((a, b) => {
      return b.values.reduce((sum, v) => sum + v, 0) - a.values.reduce((sum, v) => sum + v, 0)
    })
  }
  const colors = options.colors ?? DEFAULT_COLORS
  const seriesNames = series.map(s => s.name)
  const overrides = options.seriesOverrides
  const globalLabelMode = options.directLabelling ? 'direct' : (options.legend !== false ? 'legend' : 'none')
  return { allSeries, series, seriesNames, colors, overrides, globalLabelMode }
}

function buildLineMultiLayout(body: HTMLElement, ctx: LineMultiCtx, options: ChartOptions): LineMultiLayout {
  const showLegend = options.legend !== false && !options.directLabelling
  const containerWidth = body.getBoundingClientRect().width
  const NARROW_THRESHOLD = 350
  const requestedLegendPos = options.legendPosition ?? 'top'
  const legendPos = (containerWidth > 0 && containerWidth < NARROW_THRESHOLD && (requestedLegendPos === 'left' || requestedLegendPos === 'right'))
    ? 'top'
    : requestedLegendPos
  const legendAnchor = options.legendAnchor ?? 'start'
  const legendSize = showLegend ? estimateLegendSize(ctx.seriesNames, legendPos, containerWidth) : { width: 0, height: 0 }
  const marginOverrides = computeLineMultiMargins(ctx, showLegend, legendPos, legendSize, containerWidth, options)
  const { chartArea, width, height, margin } = createCanvas(body, marginOverrides)
  return { chartArea, width, height, margin, showLegend, legendPos, legendAnchor, legendSize }
}

function applyLineMultiLegendMargins(m: Record<string, number>, showLegend: boolean, legendPos: string, legendSize: { width: number, height: number }): void {
  if (!showLegend) {
    return
  }
  const legendH = legendSize.height + 10
  if (legendPos === 'top') {
    m.top = (m.top ?? 20) + legendH
  }
  if (legendPos === 'bottom') {
    m.bottom = (m.bottom ?? 40) + legendH
  }
  if (legendPos === 'left') {
    m.left = (m.left ?? 50) + legendSize.width + 10
  }
  if (legendPos === 'right') {
    m.right = (m.right ?? 20) + legendSize.width + 10
  }
}

function computeLineMultiMargins(
  ctx: LineMultiCtx,
  showLegend: boolean,
  legendPos: string,
  legendSize: { width: number, height: number },
  containerWidth: number,
  options: ChartOptions,
): Record<string, number> {
  const directLabelNames = ctx.seriesNames.filter(n => resolveSeriesLabelMode(n, ctx.globalLabelMode, ctx.overrides) === 'direct')
  const directLabelW = directLabelNames.length > 0 ? estimateDirectLabelWidth(directLabelNames) : 0
  const allValues = ctx.series.flatMap(s => s.values)
  const vLabelW = estimateVerticalLabelWidth(allValues, options.verticalAxis?.range, options.verticalAxis?.numberFormat, options.verticalAxis?.scaleType)
  const lpMargins = labelPositionMargins(containerWidth, options.verticalAxis?.labelPosition, options.horizontalAxis?.labelPosition, options.verticalAxis?.direction, vLabelW)
  const m: Record<string, number> = { ...lpMargins }
  applyLineMultiLegendMargins(m, showLegend, legendPos, legendSize)
  if (directLabelW > 0) {
    m.right = (m.right ?? 20) + directLabelW
  }
  return m
}

function buildLineMultiXScale(data: ChartData, width: number, options: ChartOptions) {
  const dateInfo = detectDates(data.labels)
  const numericLabels = !dateInfo && data.labels.every(l => !isNaN(Number(l)) && l.trim() !== '')

  if (dateInfo) {
    const dates = dateInfo.dates
    const hRange = options.horizontalAxis?.range
    const minDate = hRange?.min != null ? new Date(hRange.min) : d3.min(dates)!
    const maxDate = hRange?.max != null ? new Date(hRange.max) : d3.max(dates)!
    const timeScale = d3.scaleTime().domain([minDate, maxDate]).range([0, width])
    return { xScale: timeScale as AnyXScale, xPos: (i: number) => timeScale(dates[i]) }
  }
  if (numericLabels) {
    const nums = data.labels.map(Number)
    const hRange = options.horizontalAxis?.range
    const minVal = hRange?.min ?? d3.min(nums)!
    const maxVal = hRange?.max ?? d3.max(nums)!
    const linearScale = d3.scaleLinear().domain([minVal, maxVal]).range([0, width])
    return { xScale: linearScale as AnyXScale, xPos: (i: number) => linearScale(nums[i]) }
  }
  const bandScale = d3.scaleBand<string>().domain(data.labels).range([0, width]).padding(0.5)
  return { xScale: bandScale as AnyXScale, xPos: (i: number) => (bandScale(data.labels[i]) ?? 0) + bandScale.bandwidth() / 2 }
}

function buildLineMultiYScale(ctx: LineMultiCtx, height: number, options: ChartOptions) {
  const allValues = ctx.series.flatMap(s => s.values)
  const [domainMin, domainMax] = computeLinearDomain(allValues, options.verticalAxis?.range)
  const useLog = options.verticalAxis?.scaleType === 'log'
  return useLog
    ? d3.scaleSymlog().domain([domainMin, domainMax]).nice().range([height, 0])
    : d3.scaleLinear().domain([domainMin, domainMax]).nice().range([height, 0])
}

function renderLineMultiAxes(
  layout: LineMultiLayout,
  xScale: AnyXScale,
  y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  options: ChartOptions,
) {
  renderVerticalAxis(layout.chartArea, y, layout.height, { ...options.verticalAxis, gridWidth: layout.width, topPadding: layout.margin.top })
  const yDomain = y.domain() as number[]
  const zeroY = yDomain[0] < 0 && yDomain[1] > 0 ? (y(0) as number) : undefined
  renderHorizontalAxis(layout.chartArea, xScale, layout.height, { ...options.horizontalAxis, width: layout.width, zeroY })
}

function createLineMultiClipGroup(chartArea: SVGGElement, width: number, height: number): SVGGElement {
  const clipId = `bc-clip-${Math.random().toString(36).slice(2, 8)}`
  const svg = chartArea.ownerSVGElement!
  const clipDefs = d3.select(svg).select('defs').empty()
    ? d3.select(svg).append('defs')
    : d3.select(svg).select('defs')
  clipDefs.append('clipPath').attr('id', clipId)
    .append('rect').attr('width', width).attr('height', height)
  return (d3.select(chartArea).append('g').attr('clip-path', `url(#${clipId})`).node() as SVGGElement)
}

function drawLineMultiContent(
  clippedArea: SVGGElement,
  layout: LineMultiLayout,
  data: ChartData,
  ctx: LineMultiCtx,
  xPos: (i: number) => number,
  y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  options: ChartOptions,
) {
  const curve = resolveCurve(options.interpolation)
  if (options.areaFills?.length) {
    renderAreaFills(clippedArea, options.areaFills, ctx.series, xPos, y, curve)
  }

  const dotData = buildDotData(data, ctx)
  const seriesData: SeriesDatum[] = ctx.series.map(s => ({
    name: s.name, values: s.values, colorIndex: ctx.allSeries.findIndex(a => a.name === s.name),
  }))

  const chart = new LineMultiChart(d3.select(clippedArea))
  chart.config({ xPos, y, colors: ctx.colors, labels: data.labels, curve, areaFill: options.areaFill ?? false, areaFillOpacity: options.areaFillOpacity ?? 0.2, height: layout.height, dots: dotData })
  chart.draw(seriesData)

  renderLineMultiValueLabels(clippedArea, dotData, data, ctx, xPos, y, options)
  applyLineMultiOverrides(clippedArea, ctx, xPos, y, options)
  setupLineMultiInteraction(clippedArea, layout, dotData, data, ctx, xPos, y, options)
}

function buildDotData(data: ChartData, ctx: LineMultiCtx): DotDatum[] {
  const dotData: DotDatum[] = []
  ctx.series.forEach((s, si) => {
    data.labels.forEach((label, li) => {
      dotData.push({ label, value: s.values[li], series: s.name, colorIndex: si })
    })
  })
  return dotData
}

function renderLineMultiValueLabels(
  clippedArea: SVGGElement,
  dotData: DotDatum[],
  data: ChartData,
  ctx: LineMultiCtx,
  xPos: (i: number) => number,
  y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  options: ChartOptions,
) {
  const globalValueLabels = options.valueLabels ?? false
  const vlGroup = d3.select(clippedArea).append('g').attr('class', 'bc-value-labels')
  dotData.forEach((dot) => {
    if (!resolveSeriesValueLabels(dot.series, globalValueLabels, ctx.overrides)) {
      return
    }
    const cx = xPos(data.labels.indexOf(dot.label))
    const cy = y(dot.value) as number
    vlGroup.append('text')
      .attr('class', 'bc-value-label')
      .attr('x', cx).attr('y', cy - 8)
      .attr('text-anchor', 'middle').attr('font-size', '11px')
      .attr('fill', 'currentColor').text(String(dot.value))
  })
}

const DASH_MAP: Record<string, string> = {
  'solid': '',
  'dotted': '2,4',
  'dashed': '8,4',
  'dash-dot': '8,4,2,4',
}

function applyLineMultiOverrides(
  clippedArea: SVGGElement,
  ctx: LineMultiCtx,
  xPos: (i: number) => number,
  y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  options: ChartOptions,
) {
  if (!ctx.overrides?.length) {
    return
  }
  d3.select(clippedArea).selectAll('.bc-line').each(function (this: SVGPathElement, d: unknown) {
    applyLineOverride(this, d as SeriesDatum, ctx, xPos, y, options)
  })
  d3.select(clippedArea).selectAll('.bc-area').each(function (this: SVGPathElement, d: unknown) {
    const datum = d as SeriesDatum
    d3.select(this).attr('fill', resolveSeriesColor(datum.name, datum.colorIndex, ctx.colors, ctx.overrides))
  })
}

function applyLineOverride(
  el: SVGPathElement,
  datum: SeriesDatum,
  ctx: LineMultiCtx,
  xPos: (i: number) => number,
  y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  options: ChartOptions,
) {
  const seriesColor = resolveSeriesColor(datum.name, datum.colorIndex, ctx.colors, ctx.overrides)
  const seriesW = resolveSeriesWidth(datum.name, ctx.overrides)
  const seriesDash = resolveSeriesDash(datum.name, ctx.overrides)
  const seriesInterp = resolveSeriesInterpolation(datum.name, options.interpolation ?? 'linear', ctx.overrides)
  const sel = d3.select(el)
  sel.attr('stroke', seriesColor).attr('stroke-width', seriesW)
  if (seriesDash !== 'solid') {
    sel.attr('stroke-dasharray', DASH_MAP[seriesDash] ?? '')
  }
  if (seriesInterp !== (options.interpolation ?? 'linear')) {
    const perCurve = resolveCurve(seriesInterp)
    const lineGen = d3.line<number>().curve(perCurve).x((_v, i) => xPos(i)).y(v => y(v))
    sel.attr('d', lineGen(datum.values))
  }
}

function buildProximityPoints(dotData: DotDatum[], data: ChartData, ctx: LineMultiCtx, xPos: (i: number) => number, y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>) {
  return dotData.map(d => ({
    cx: xPos(data.labels.indexOf(d.label)),
    cy: y(d.value) as number,
    label: d.label, value: d.value, series: d.series,
    color: resolveSeriesColor(d.series, d.colorIndex, ctx.colors, ctx.overrides),
  }))
}

function setupLineMultiInteraction(
  clippedArea: SVGGElement,
  layout: LineMultiLayout,
  dotData: DotDatum[],
  data: ChartData,
  ctx: LineMultiCtx,
  xPos: (i: number) => number,
  y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  options: ChartOptions,
) {
  d3.select(clippedArea).selectAll('.bc-dot')
    .attr('fill-opacity', 0).attr('stroke-opacity', 0).attr('pointer-events', 'none')
  if (!options.tooltips && !options.crosshair) {
    return
  }
  setupProximityInteraction(layout.chartArea, {
    width: layout.width, height: layout.height,
    points: buildProximityPoints(dotData, data, ctx, xPos, y),
    tooltip: options.tooltips, crosshair: options.crosshair,
    crosshairDirection: options.crosshairDirection,
    crosshairStyle: options.crosshairStyle, crosshairColor: options.crosshairColor,
  })
}

function buildGlobalSymbolOverride(symbolConfig: LineSymbolConfig | undefined): import('../../types').SeriesOverride | undefined {
  if (!symbolConfig) {
    return undefined
  }
  return {
    name: '',
    lineSymbols: true,
    symbolShape: symbolConfig.symbol,
    symbolShowOn: symbolConfig.showOn,
    symbolStyle: symbolConfig.style,
    symbolSize: symbolConfig.size,
    symbolOpacity: symbolConfig.opacity,
  }
}

function renderLineMultiSymbols(
  chartArea: SVGGElement,
  data: ChartData,
  ctx: LineMultiCtx,
  xPos: (i: number) => number,
  y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  options: ChartOptions,
) {
  const symbolConfig = options.lineSymbols
  const globalSymbolOverride = buildGlobalSymbolOverride(symbolConfig)
  const labelCount = data.labels.length
  ctx.series.forEach((s, si) => {
    const resolved = resolveSeriesLineSymbols(s.name, globalSymbolOverride, ctx.overrides)
    if (!resolved) {
      return
    }
    renderSeriesSymbols(chartArea, data, s, si, resolved, symbolConfig, labelCount, ctx, xPos, y)
  })
}

function buildPerSeriesSymbolConfig(resolved: import('../../types').SeriesOverride, symbolConfig: LineSymbolConfig | undefined): LineSymbolConfig {
  return {
    symbol: (resolved.symbolShape as LineSymbolConfig['symbol']) ?? symbolConfig?.symbol ?? 'circle',
    showOn: (resolved.symbolShowOn as LineSymbolConfig['showOn']) ?? symbolConfig?.showOn ?? 'firstLast',
    style: (resolved.symbolStyle as LineSymbolConfig['style']) ?? symbolConfig?.style ?? 'filled',
    size: resolved.symbolSize ?? symbolConfig?.size ?? 3.5,
    opacity: resolved.symbolOpacity ?? symbolConfig?.opacity ?? 1,
  }
}

function renderSeriesSymbols(
  chartArea: SVGGElement,
  data: ChartData,
  s: { name: string, values: number[] },
  si: number,
  resolved: import('../../types').SeriesOverride,
  symbolConfig: LineSymbolConfig | undefined,
  labelCount: number,
  ctx: LineMultiCtx,
  xPos: (i: number) => number,
  y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
) {
  const perSeriesSymbolConfig = buildPerSeriesSymbolConfig(resolved, symbolConfig)
  const symbolPoints = data.labels.map((_, li) => ({
    cx: xPos(li), cy: y(s.values[li]) as number,
    color: resolveSeriesColor(s.name, si, ctx.colors, ctx.overrides), index: li,
  }))
  const symbolsGroup = d3.select(chartArea).append('g').attr('class', 'bc-symbols').attr('data-series', si)
  renderLineSymbols(symbolsGroup as unknown as d3.Selection<SVGGElement, unknown, null, undefined>, symbolPoints, labelCount, perSeriesSymbolConfig)
}

function collectDirectLabelEntries(
  data: ChartData, ctx: LineMultiCtx, y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
): { name: string, index: number, naturalY: number, text: string }[] {
  const lastLabelIdx = data.labels.length - 1
  const entries: { name: string, index: number, naturalY: number, text: string }[] = []
  ctx.series.forEach((s, i) => {
    if (resolveSeriesLabelMode(s.name, ctx.globalLabelMode, ctx.overrides) !== 'direct') {
      return
    }
    const labelText = ctx.overrides?.find(o => o.name === s.name)?.labelText || s.name
    entries.push({ name: s.name, index: i, naturalY: y(s.values[lastLabelIdx]) as number, text: labelText })
  })
  return entries
}

function renderLineMultiDirectLabels(
  chartArea: SVGGElement,
  data: ChartData,
  ctx: LineMultiCtx,
  xPos: (i: number) => number,
  y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  height: number,
) {
  const entries = collectDirectLabelEntries(data, ctx, y)
  if (entries.length === 0) {
    return
  }
  const labelX = xPos(data.labels.length - 1) + 6
  entries.sort((a, b) => a.naturalY - b.naturalY)
  const resolvedYs = spreadLabels(entries.map(e => e.naturalY), 0, height)
  entries.forEach((entry, i) => {
    d3.select(chartArea).append('text')
      .attr('class', 'bc-direct-label').attr('data-series', entry.index)
      .attr('x', labelX).attr('y', resolvedYs[i])
      .attr('dy', '0.35em').attr('font-size', '11px')
      .attr('fill', resolveSeriesColor(entry.name, entry.index, ctx.colors, ctx.overrides))
      .text(entry.text)
  })
}

function renderLineMultiLegend(layout: LineMultiLayout, ctx: LineMultiCtx) {
  const legendSeriesNames = ctx.seriesNames.filter(name => resolveSeriesLabelMode(name, ctx.globalLabelMode, ctx.overrides) === 'legend')
  if (!layout.showLegend || legendSeriesNames.length === 0) {
    return
  }
  const legendColors = legendSeriesNames.map((name) => {
    const idx = ctx.allSeries.findIndex(s => s.name === name)
    return resolveSeriesColor(name, idx, ctx.colors, ctx.overrides)
  })
  let xLegendPos = 0
  let yPos = 0
  if (layout.legendPos === 'top') {
    yPos = -(layout.legendSize.height + 5)
  }
  else if (layout.legendPos === 'bottom') {
    yPos = layout.height + 25
  }
  else if (layout.legendPos === 'left') {
    xLegendPos = -(layout.legendSize.width + 10)
  }
  else if (layout.legendPos === 'right') {
    xLegendPos = layout.width + 10
  }
  renderLegend(layout.chartArea, legendSeriesNames, legendColors, yPos, layout.legendPos, layout.legendAnchor, layout.width, layout.height, xLegendPos)
}

function renderSingleAreaFill(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  chartArea: SVGGElement,
  fill: AreaFillConfig,
  series: { name: string, values: number[] }[],
  xPos: (i: number) => number,
  y: d3.ScaleLinear<number, number>,
  curve: d3.CurveFactory,
): void {
  const fromSeries = series.find(s => s.name === fill.from)
  const toSeries = series.find(s => s.name === fill.to)
  if (!fromSeries || !toSeries) {
    return
  }
  const fillCurve = fill.interpolation ? resolveCurve(fill.interpolation) : curve
  const opacity = (fill.opacity ?? 30) / 100
  const color = fill.color ?? '#ccc'
  if (fill.negativeColor) {
    renderSplitAreaFill(g, chartArea, fromSeries, toSeries, fill, fillCurve, xPos, y, color, opacity)
  }
  else {
    renderSimpleAreaFill(g, fromSeries, toSeries, fillCurve, xPos, y, color, opacity)
  }
}

function renderAreaFills(
  chartArea: SVGGElement,
  fills: AreaFillConfig[],
  series: { name: string, values: number[] }[],
  xPos: (i: number) => number,
  y: d3.ScaleLinear<number, number>,
  curve: d3.CurveFactory,
): void {
  const g = d3.select(chartArea).append('g').attr('class', 'bc-area-fills')
  for (const fill of fills) {
    renderSingleAreaFill(g, chartArea, fill, series, xPos, y, curve)
  }
}

function renderSimpleAreaFill(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  fromSeries: { values: number[] },
  toSeries: { values: number[] },
  fillCurve: d3.CurveFactory,
  xPos: (i: number) => number,
  y: d3.ScaleLinear<number, number>,
  color: string,
  opacity: number,
) {
  const areaGen = d3.area<number>()
    .curve(fillCurve).x((_v, i) => xPos(i))
    .y0((_v, i) => y(toSeries.values[i])).y1(v => y(v))
  g.append('path').attr('class', 'bc-area-fill')
    .attr('d', areaGen(fromSeries.values) ?? '')
    .attr('fill', color).attr('opacity', opacity)
}

function renderSplitAreaFill(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  chartArea: SVGGElement,
  fromSeries: { values: number[] },
  toSeries: { values: number[] },
  fill: AreaFillConfig,
  fillCurve: d3.CurveFactory,
  xPos: (i: number) => number,
  y: d3.ScaleLinear<number, number>,
  color: string,
  opacity: number,
) {
  const id = `af-${fill.from}-${fill.to}-${Math.random().toString(36).slice(2, 8)}`
  const defs = d3.select(chartArea.ownerSVGElement!).select('defs').empty()
    ? d3.select(chartArea.ownerSVGElement!).append('defs')
    : d3.select(chartArea.ownerSVGElement!).select('defs')
  appendAreaFillClipPaths(defs, id, fromSeries, toSeries, fillCurve, xPos, y)
  const areaGen = d3.area<number>().curve(fillCurve).x((_v, i) => xPos(i))
  const fullArea = areaGen.y0((_v, i) => y(toSeries.values[i])).y1(v => y(v))(fromSeries.values) ?? ''
  g.append('path').attr('class', 'bc-area-fill').attr('d', fullArea)
    .attr('fill', color).attr('opacity', opacity).attr('clip-path', `url(#${id}-pos)`)
  g.append('path').attr('class', 'bc-area-fill bc-area-fill-negative').attr('d', fullArea)
    .attr('fill', fill.negativeColor!).attr('opacity', opacity).attr('clip-path', `url(#${id}-neg)`)
}

function appendAreaFillClipPaths(
  defs: d3.Selection<d3.BaseType, unknown, null, undefined>,
  id: string,
  fromSeries: { values: number[] },
  toSeries: { values: number[] },
  fillCurve: d3.CurveFactory,
  xPos: (i: number) => number,
  y: d3.ScaleLinear<number, number>,
) {
  defs.append('clipPath').attr('id', `${id}-pos`)
    .append('path')
    .attr('d', d3.area<number>().curve(fillCurve).x((_v, i) => xPos(i))
      .y0(-9999).y1((_v, i) => y(toSeries.values[i]))(fromSeries.values) ?? '')
  defs.append('clipPath').attr('id', `${id}-neg`)
    .append('path')
    .attr('d', d3.area<number>().curve(fillCurve).x((_v, i) => xPos(i))
      .y0(9999).y1((_v, i) => y(toSeries.values[i]))(fromSeries.values) ?? '')
}
