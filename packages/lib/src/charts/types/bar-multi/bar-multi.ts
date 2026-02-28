import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import type { ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas, labelPositionMargins, estimateVerticalLabelWidth } from '../../canvas/canvas'
import { renderVerticalAxis } from '../../axis/vertical-axis'
import { renderHorizontalAxis } from '../../axis/horizontal-axis'
import { renderLegend } from '../../legend/legend'
import { estimateLegendSize } from '../../legend/legend-size'
import { computeLinearDomain } from '../../scale-helpers'
import { createTooltipPlugin } from '../../plugins/tooltip'
import { createCrosshairPlugin } from '../../plugins/crosshair'
import { contrastTextColor, readableColor, resolveBackgroundColor } from '../../contrast'
import { resolveSeriesColor, isSeriesHidden, resolveSeriesValueLabels, resolveSeriesOpacity, resolveSeriesLabelMode } from '../../series-helpers'

const DEFAULT_COLORS = [
  '#4e79a7', '#f28e2b', '#e15759', '#76b7b2',
  '#59a14f', '#edc948', '#b07aa1', '#ff9da7',
]

interface MultiBarDatum {
  label: string
  series: string
  seriesName: string
  value: number
  seriesIndex: number
}

class BarMultiChart extends D3Blueprint<MultiBarDatum[]> {
  initialize() {
    this.configDefine('x0', { defaultValue: d3.scaleBand<string>() })
    this.configDefine('x1', { defaultValue: d3.scaleBand<string>() })
    this.configDefine('y', { defaultValue: d3.scaleLinear() })
    this.configDefine('height', { defaultValue: 0 })
    this.configDefine('colors', { defaultValue: DEFAULT_COLORS })

    const g = this.base.append('g')

    this.layer('bars', g, {
      dataBind: (sel, data) => sel.selectAll('.bc-bar-multi').data(data),
      insert: sel => sel.append('rect').attr('class', 'bc-bar bc-bar-multi'),
      events: {
        enter: this.enterBars.bind(this),
      },
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private enterBars(sel: any) {
    const x0 = this.config('x0') as d3.ScaleBand<string>
    const x1 = this.config('x1') as d3.ScaleBand<string>
    const y = this.config('y') as d3.ScaleLinear<number, number>
    const colors = this.config('colors') as string[]
    sel
      .attr('data-series', (d: MultiBarDatum) => d.seriesIndex)
      .attr('x', (d: MultiBarDatum) => (x0(d.label) ?? 0) + (x1(d.series) ?? 0))
      .attr('y', (d: MultiBarDatum) => Math.min(y(0), y(d.value)))
      .attr('width', x1.bandwidth())
      .attr('height', (d: MultiBarDatum) => Math.abs(y(d.value) - y(0)))
      .attr('fill', (d: MultiBarDatum) => colors[d.seriesIndex % colors.length])
  }
}

interface BarMultiLayout {
  chartArea: SVGGElement
  width: number
  height: number
  margin: { top: number }
  showLegend: boolean
  legendPos: string
  legendAnchor: string
  legendSize: { width: number, height: number }
}

interface BarMultiContext {
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
  const ctx = buildBarMultiContext(data, options)
  const layout = buildBarMultiLayout(body, ctx, options)
  const { x0, x1, y } = buildBarMultiScales(data, ctx, layout, options)
  const flatData = buildFlatData(data, ctx, options)

  drawBarMultiBars(layout, x0, x1, y, flatData, ctx, options)
  renderBarMultiValueLabels(container, layout.chartArea, flatData, x0, x1, y, ctx, options)
  renderBarMultiDirectLabels(container, layout.chartArea, flatData, x0, x1, y, ctx, options)
  renderBarMultiLegend(layout, ctx)
}

function buildBarMultiContext(data: ChartData, options: ChartOptions): BarMultiContext {
  const allSeries = data.series ?? []
  const series = allSeries.filter(s => !isSeriesHidden(s.name, options.seriesOverrides))
  const seriesNames = series.map(s => s.name)
  const colors = options.colors ?? DEFAULT_COLORS
  const overrides = options.seriesOverrides
  const globalLabelMode = options.directLabelling ? 'direct' : (options.legend !== false ? 'legend' : 'none')
  return { allSeries, series, seriesNames, colors, overrides, globalLabelMode }
}

function buildBarMultiLayout(
  body: HTMLElement,
  ctx: BarMultiContext,
  options: ChartOptions,
): BarMultiLayout {
  const showLegend = options.legend !== false && !options.directLabelling
  const containerWidth = body.getBoundingClientRect().width
  const NARROW_THRESHOLD = 350
  const requestedLegendPos = options.legendPosition ?? 'top'
  const legendPos = (containerWidth > 0 && containerWidth < NARROW_THRESHOLD && (requestedLegendPos === 'left' || requestedLegendPos === 'right'))
    ? 'top'
    : requestedLegendPos
  const legendAnchor = options.legendAnchor ?? 'start'
  const legendSize = showLegend ? estimateLegendSize(ctx.seriesNames, legendPos, containerWidth) : { width: 0, height: 0 }
  const marginOverrides = computeBarMultiMargins(ctx, showLegend, legendPos, legendSize, containerWidth, options)
  const { chartArea, width, height, margin } = createCanvas(body, marginOverrides)
  return { chartArea, width, height, margin, showLegend, legendPos, legendAnchor, legendSize }
}

function applyLegendMargins(m: Record<string, number>, showLegend: boolean, legendPos: string, legendSize: { width: number, height: number }): void {
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

function computeBarMultiMargins(
  ctx: BarMultiContext,
  showLegend: boolean,
  legendPos: string,
  legendSize: { width: number, height: number },
  containerWidth: number,
  options: ChartOptions,
): Record<string, number> {
  const allValues = ctx.series.flatMap(s => s.values)
  const vLabelW = estimateVerticalLabelWidth(allValues, options.verticalAxis?.range, options.verticalAxis?.numberFormat, options.verticalAxis?.scaleType)
  const lpMargins = labelPositionMargins(containerWidth, options.verticalAxis?.labelPosition, options.horizontalAxis?.labelPosition, options.verticalAxis?.direction, vLabelW)
  const m: Record<string, number> = { ...lpMargins }
  applyLegendMargins(m, showLegend, legendPos, legendSize)
  return m
}

function buildBarMultiScales(
  data: ChartData,
  ctx: BarMultiContext,
  layout: BarMultiLayout,
  options: ChartOptions,
) {
  const allValues = ctx.series.flatMap(s => s.values)
  const [domainMin, domainMax] = computeLinearDomain(allValues, options.verticalAxis?.range)

  const sortedLabels = sortBarMultiLabels(data, ctx.series, options)
  const x0 = d3.scaleBand<string>().domain(sortedLabels).range([0, layout.width]).padding(0.2)
  const x1 = d3.scaleBand<string>().domain(ctx.seriesNames).range([0, x0.bandwidth()]).padding(0.05)

  const useLog = options.verticalAxis?.scaleType === 'log'
  const y = useLog
    ? d3.scaleSymlog().domain([domainMin, domainMax]).nice().range([layout.height, 0])
    : d3.scaleLinear().domain([domainMin, domainMax]).nice().range([layout.height, 0])

  renderBarMultiAxes(layout, x0, y, useLog, domainMin, domainMax, options)
  return { x0, x1, y }
}

function sortBarMultiLabels(
  data: ChartData,
  series: { name: string, values: number[] }[],
  options: ChartOptions,
): string[] {
  if (options.sortMode !== 'total') {
    return data.labels
  }
  const totals = data.labels.map((label, i) => ({
    label,
    total: series.reduce((sum, s) => sum + (s.values[i] ?? 0), 0),
  }))
  totals.sort((a, b) => b.total - a.total)
  return totals.map(t => t.label)
}

function renderBarMultiAxes(
  layout: BarMultiLayout,
  x0: d3.ScaleBand<string>,
  y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  useLog: boolean,
  domainMin: number,
  domainMax: number,
  options: ChartOptions,
) {
  renderVerticalAxis(layout.chartArea, y, layout.height, { ...options.verticalAxis, gridWidth: layout.width, topPadding: layout.margin.top })
  renderHorizontalAxis(layout.chartArea, x0, layout.height, { ...options.horizontalAxis, width: layout.width })

  if (!useLog && domainMin < 0 && domainMax > 0) {
    d3.select(layout.chartArea).append('line')
      .attr('class', 'bc-zero-baseline')
      .attr('x1', 0).attr('x2', layout.width)
      .attr('y1', y(0)).attr('y2', y(0))
      .attr('stroke', '#666').attr('stroke-width', 1)
  }
}

function buildFlatData(
  data: ChartData,
  ctx: BarMultiContext,
  options: ChartOptions,
): MultiBarDatum[] {
  const withinGroupRank = buildWithinGroupRank(data, ctx, options)
  const flatData: MultiBarDatum[] = []
  data.labels.forEach((label, i) => {
    ctx.series.forEach((s) => {
      const originalIndex = ctx.allSeries.findIndex(a => a.name === s.name)
      const positionKey = options.sortMode === 'within-groups'
        ? (withinGroupRank.get(`${label}\0${s.name}`) ?? s.name)
        : s.name
      flatData.push({ label, series: positionKey, seriesName: s.name, value: s.values[i], seriesIndex: originalIndex })
    })
  })
  return flatData
}

function buildWithinGroupRank(
  data: ChartData,
  ctx: BarMultiContext,
  options: ChartOptions,
): Map<string, string> {
  const rank = new Map<string, string>()
  if (options.sortMode !== 'within-groups') {
    return rank
  }
  data.labels.forEach((label, i) => {
    const items = ctx.series.map(s => ({ name: s.name, value: s.values[i] }))
    items.sort((a, b) => b.value - a.value)
    items.forEach((item, r) => {
      rank.set(`${label}\0${item.name}`, ctx.seriesNames[r])
    })
  })
  return rank
}

function drawBarMultiBars(
  layout: BarMultiLayout,
  x0: d3.ScaleBand<string>,
  x1: d3.ScaleBand<string>,
  y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  flatData: MultiBarDatum[],
  ctx: BarMultiContext,
  options: ChartOptions,
) {
  const chart = new BarMultiChart(d3.select(layout.chartArea))
  chart.config({ x0, x1, y, height: layout.height, colors: ctx.colors })
  if (options.tooltips) {
    chart.use(createTooltipPlugin())
  }
  if (options.crosshair) {
    chart.use(createCrosshairPlugin({ width: layout.width, height: layout.height, direction: options.crosshairDirection, style: options.crosshairStyle, color: options.crosshairColor }))
  }
  chart.draw(flatData)

  applyBarMultiSeriesOverrides(layout.chartArea, ctx)
}

function applyBarMultiSeriesOverrides(chartArea: SVGGElement, ctx: BarMultiContext) {
  d3.select(chartArea).selectAll('.bc-bar-multi').each(function (this: SVGRectElement, d: unknown) {
    const datum = d as MultiBarDatum
    const seriesColor = resolveSeriesColor(datum.seriesName, datum.seriesIndex, ctx.colors, ctx.overrides)
    const seriesOpacity = resolveSeriesOpacity(datum.seriesName, ctx.overrides)
    const el = d3.select(this)
    el.attr('fill', seriesColor)
    if (seriesOpacity < 1) {
      el.attr('fill-opacity', seriesOpacity)
    }
  })
}

function resolveBarDlMode(dlMode: string, barHeight: number): 'inside' | 'outside' {
  if (dlMode === 'inside') {
    return 'inside'
  }
  if (dlMode === 'outside') {
    return 'outside'
  }
  return barHeight > 20 ? 'inside' : 'outside'
}

function insideLabelY(barTop: number, barHeight: number, anchor: string): number {
  if (anchor === 'start') {
    return barTop + 12
  }
  if (anchor === 'end') {
    return barTop + barHeight - 4
  }
  return barTop + barHeight / 2
}

function resolveVlMode(vlPos: string, barHeight: number): 'inside' | 'outside' {
  if (vlPos === 'inside') {
    return 'inside'
  }
  if (vlPos === 'outside') {
    return 'outside'
  }
  return barHeight > 20 ? 'inside' : 'outside'
}

function buildDirectLabelSet(
  series: { name: string }[],
  globalLabelMode: string,
  overrides: ChartOptions['seriesOverrides'],
): Set<string> {
  const set = new Set<string>()
  series.forEach((s) => {
    if (resolveSeriesLabelMode(s.name, globalLabelMode, overrides) === 'direct') {
      set.add(s.name)
    }
  })
  return set
}

function renderBarMultiValueLabels(
  container: HTMLElement,
  chartArea: SVGGElement,
  flatData: MultiBarDatum[],
  x0: d3.ScaleBand<string>,
  x1: d3.ScaleBand<string>,
  y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  ctx: BarMultiContext,
  options: ChartOptions,
) {
  const globalValueLabels = options.valueLabels ?? false
  const directLabelSet = buildDirectLabelSet(ctx.series, ctx.globalLabelMode, ctx.overrides)
  const hasAnyDirectLabels = directLabelSet.size > 0
  const dlMode = typeof options.directLabelling === 'string' ? options.directLabelling : (options.directLabelling ? 'auto' : '')
  const dlAnchor = options.directLabelAnchor ?? 'middle'
  const vlPos = options.valueLabelPosition ?? 'auto'

  const vlGroup = d3.select(chartArea).append('g').attr('class', 'bc-value-labels')
  flatData.forEach((datum) => {
    if (!resolveSeriesValueLabels(datum.seriesName, globalValueLabels, ctx.overrides)) {
      return
    }
    renderSingleValueLabel(vlGroup, datum, x0, x1, y, ctx, directLabelSet, hasAnyDirectLabels, dlMode, dlAnchor, vlPos)
  })
}

function renderSingleValueLabel(
  vlGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  datum: MultiBarDatum,
  x0: d3.ScaleBand<string>,
  x1: d3.ScaleBand<string>,
  y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  ctx: BarMultiContext,
  directLabelSet: Set<string>,
  hasAnyDirectLabels: boolean,
  dlMode: string,
  dlAnchor: string,
  vlPos: string,
) {
  const cx = (x0(datum.label) ?? 0) + (x1(datum.series) ?? 0) + x1.bandwidth() / 2
  const barTop = Math.min(y(0), y(datum.value))
  const barHeight = Math.abs(y(datum.value) - y(0))
  const vlMode = resolveVlMode(vlPos, barHeight)
  const hasDl = hasAnyDirectLabels && directLabelSet.has(datum.seriesName)
  const { cy, fill } = computeValueLabelPosition(vlMode, barTop, barHeight, datum, ctx, hasDl, dlMode, dlAnchor)
  appendValueLabelText(vlGroup, cx, cy, fill, String(datum.value), vlMode)
}

function appendValueLabelText(
  vlGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  cx: number, cy: number, fill: string, text: string, vlMode: string,
): void {
  const vlEl = vlGroup.append('text')
    .attr('class', 'bc-value-label')
    .attr('x', cx).attr('y', cy)
    .attr('text-anchor', 'middle')
    .attr('font-size', '11px')
    .attr('fill', fill)
    .text(text)
  if (vlMode === 'inside') {
    vlEl.attr('dominant-baseline', 'central')
  }
}

function computeValueLabelPosition(
  vlMode: 'inside' | 'outside',
  barTop: number,
  barHeight: number,
  datum: MultiBarDatum,
  ctx: BarMultiContext,
  hasDl: boolean,
  dlMode: string,
  dlAnchor: string,
): { cy: number, fill: string } {
  if (vlMode === 'inside') {
    const barColor = resolveSeriesColor(datum.seriesName, datum.seriesIndex, ctx.colors, ctx.overrides)
    const fill = contrastTextColor(barColor)
    const dlIsInside = hasDl && resolveBarDlMode(dlMode, barHeight) === 'inside'
    const cy = dlIsInside ? insideLabelY(barTop, barHeight, dlAnchor) + 14 : barTop + barHeight / 2
    return { cy, fill }
  }
  const dlIsOutside = hasDl && resolveBarDlMode(dlMode, barHeight) === 'outside'
  return { cy: dlIsOutside ? barTop - 16 : barTop - 4, fill: 'currentColor' }
}

function renderBarMultiDirectLabels(
  container: HTMLElement,
  chartArea: SVGGElement,
  flatData: MultiBarDatum[],
  x0: d3.ScaleBand<string>,
  x1: d3.ScaleBand<string>,
  y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  ctx: BarMultiContext,
  options: ChartOptions,
) {
  const directLabelSet = buildDirectLabelSet(ctx.series, ctx.globalLabelMode, ctx.overrides)
  const bgColor = resolveBackgroundColor(container)
  const dlMode = typeof options.directLabelling === 'string' ? options.directLabelling : (options.directLabelling ? 'auto' : '')
  const dlAnchor = options.directLabelAnchor ?? 'middle'

  flatData.forEach((datum) => {
    if (!directLabelSet.has(datum.seriesName)) {
      return
    }
    renderSingleDirectLabel(chartArea, datum, x0, x1, y, ctx, bgColor, dlMode, dlAnchor)
  })
}

function applyDirectLabelPosition(
  labelEl: d3.Selection<SVGTextElement, unknown, null, undefined>,
  mode: string, barTop: number, barHeight: number, barColor: string, bgColor: string, dlAnchor: string,
): void {
  if (mode === 'inside') {
    const ly = insideLabelY(barTop, barHeight, dlAnchor)
    labelEl.attr('y', ly).attr('fill', contrastTextColor(barColor))
    if (dlAnchor === 'middle') {
      labelEl.attr('dominant-baseline', 'central')
    }
  }
  else {
    labelEl.attr('y', barTop - 4).attr('fill', readableColor(barColor, bgColor))
  }
}

function renderSingleDirectLabel(
  chartArea: SVGGElement,
  datum: MultiBarDatum,
  x0: d3.ScaleBand<string>,
  x1: d3.ScaleBand<string>,
  y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  ctx: BarMultiContext,
  bgColor: string,
  dlMode: string,
  dlAnchor: string,
) {
  const cx = (x0(datum.label) ?? 0) + (x1(datum.series) ?? 0) + x1.bandwidth() / 2
  const barTop = Math.min(y(0), y(datum.value))
  const barHeight = Math.abs(y(datum.value) - y(0))
  const labelText = ctx.overrides?.find(o => o.name === datum.seriesName)?.labelText || datum.seriesName
  const mode = resolveBarDlMode(dlMode, barHeight)
  const barColor = resolveSeriesColor(datum.seriesName, datum.seriesIndex, ctx.colors, ctx.overrides)

  const labelEl = d3.select(chartArea)
    .append('text').attr('class', 'bc-direct-label')
    .attr('data-series', datum.seriesIndex)
    .attr('x', cx).attr('text-anchor', 'middle')
    .attr('font-size', '10px').text(labelText)
  applyDirectLabelPosition(labelEl as unknown as d3.Selection<SVGTextElement, unknown, null, undefined>, mode, barTop, barHeight, barColor, bgColor, dlAnchor)
}

function computeLegendPosition(layout: BarMultiLayout): { x: number, y: number } {
  let x = 0
  let y = 0
  if (layout.legendPos === 'top') {
    y = -(layout.legendSize.height + 5)
  }
  else if (layout.legendPos === 'bottom') {
    y = layout.height + 25
  }
  else if (layout.legendPos === 'left') {
    x = -(layout.legendSize.width + 10)
  }
  else if (layout.legendPos === 'right') {
    x = layout.width + 10
  }
  return { x, y }
}

function renderBarMultiLegend(layout: BarMultiLayout, ctx: BarMultiContext) {
  const legendSeriesNames = ctx.seriesNames.filter((name) => {
    return resolveSeriesLabelMode(name, ctx.globalLabelMode, ctx.overrides) === 'legend'
  })
  if (!layout.showLegend || legendSeriesNames.length === 0) {
    return
  }
  const legendColors = legendSeriesNames.map((name) => {
    const idx = ctx.allSeries.findIndex(s => s.name === name)
    return resolveSeriesColor(name, idx, ctx.colors, ctx.overrides)
  })
  const pos = computeLegendPosition(layout)
  renderLegend(layout.chartArea, legendSeriesNames, legendColors, pos.y, layout.legendPos, layout.legendAnchor, layout.width, layout.height, pos.x)
}
