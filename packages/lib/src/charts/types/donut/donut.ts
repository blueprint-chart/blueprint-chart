import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import type { ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas } from '../../canvas/canvas'
import { renderLegend } from '../../legend/legend'
import { estimateLegendSize } from '../../legend/legend-size'
import { createTooltipPlugin } from '../../plugins/tooltip'
import { resolveBackgroundColor } from '../../contrast'
import { renderArcLabels, renderInsideArcLabels, renderAutoArcLabels, estimateArcLabelMargins } from '../../plugins/arc-labels'
import type { ArcLabelDatum } from '../../plugins/arc-labels'

const DEFAULT_COLORS = [
  '#4e79a7', '#f28e2b', '#e15759', '#76b7b2',
  '#59a14f', '#edc948', '#b07aa1', '#ff9da7',
]

class ArcChart extends D3Blueprint<d3.PieArcDatum<number>[]> {
  initialize() {
    this.configDefine('arc', { defaultValue: d3.arc<d3.PieArcDatum<number>>() })
    this.configDefine('colorScale', { defaultValue: d3.scaleOrdinal<string>() })
    this.configDefine('labels', { defaultValue: [] as string[] })

    const g = this.base.append('g')

    this.layer('arcs', g, {
      dataBind: (sel, data) => sel.selectAll('.bc-arc').data(data),
      insert: sel => sel.append('path').attr('class', 'bc-arc'),
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        enter: (sel: any) => {
          const arcGen = this.config('arc') as d3.Arc<unknown, d3.PieArcDatum<number>>
          const colorScale = this.config('colorScale') as d3.ScaleOrdinal<string, string>
          const labels = this.config('labels') as string[]
          sel
            .attr('d', arcGen)
            .attr('fill', (_d: d3.PieArcDatum<number>, i: number) => colorScale(labels[i]))
        },
      },
    })
  }
}

export function render(
  container: HTMLElement,
  data: ChartData,
  options: ChartOptions = {},
): void {
  renderArc(container, data, options, 0.6)
}

interface ArcPreparedData {
  labels: string[]
  values: number[]
  percentages: number[]
  total: number
}

interface ArcLayout {
  chartArea: SVGGElement
  width: number
  height: number
  showLegend: boolean
  legendPos: string
  legendAnchor: string
  legendSize: { width: number, height: number }
  legendSuffixes: string[]
}

export function renderArc(
  container: HTMLElement,
  data: ChartData,
  options: ChartOptions,
  innerRadiusRatio: number,
): void {
  const { body } = createFrame(container, options.frame)
  const prepared = prepareArcData(data, options)
  const colors = options.colors ?? DEFAULT_COLORS
  const dlMode = typeof options.directLabelling === 'string' ? options.directLabelling : (options.directLabelling ? 'auto' : '')
  const useDirectLabels = !!dlMode
  const layout = buildArcLayout(body, prepared, colors, useDirectLabels, options)

  drawArcChart(container, layout, prepared, colors, innerRadiusRatio, dlMode, useDirectLabels, options)
}

function prepareArcData(data: ChartData, options: ChartOptions): ArcPreparedData {
  let labels = [...data.labels]
  let values = [...data.values]
  if (options.sort === 'ascending' || options.sort === 'descending') {
    const pairs = labels.map((l, i) => ({ label: l, value: values[i] }))
    pairs.sort((a, b) => options.sort === 'ascending' ? a.value - b.value : b.value - a.value)
    labels = pairs.map(p => p.label)
    values = pairs.map(p => p.value)
  }

  if (options.sliceMax && options.sliceMax > 0 && labels.length > options.sliceMax) {
    const keep = options.sliceMax - 1
    const keptLabels = labels.slice(0, keep)
    const keptValues = values.slice(0, keep)
    const restSum = values.slice(keep).reduce((a, b) => a + b, 0)
    keptLabels.push(options.sliceGroupLabel ?? 'Others')
    keptValues.push(restSum)
    labels = keptLabels
    values = keptValues
  }

  const total = values.reduce((a, b) => a + b, 0)
  const percentages = values.map(v => total > 0 ? (v / total) * 100 : 0)
  return { labels, values, percentages, total }
}

function buildArcLegendSuffixes(prepared: ArcPreparedData, useDirectLabels: boolean, options: ChartOptions): string[] {
  const showValuesInLegend = (options.showValues ?? true) && !useDirectLabels
  if (!showValuesInLegend) {
    return []
  }
  return prepared.values.map((v, i) => {
    const formatted = options.displayAsPercentage
      ? `${Math.round(prepared.percentages[i])}%`
      : String(v)
    return `(${formatted})`
  })
}

function buildArcLayout(
  body: HTMLElement,
  prepared: ArcPreparedData,
  colors: string[],
  useDirectLabels: boolean,
  options: ChartOptions,
): ArcLayout {
  const legendSuffixes = buildArcLegendSuffixes(prepared, useDirectLabels, options)
  const showLegend = options.legend !== false && !useDirectLabels
  const containerWidth = body.getBoundingClientRect().width
  const NARROW_THRESHOLD = 350
  const requestedLegendPos = options.legendPosition ?? 'top'
  const legendPos = (containerWidth > 0 && containerWidth < NARROW_THRESHOLD && (requestedLegendPos === 'left' || requestedLegendPos === 'right'))
    ? 'top'
    : requestedLegendPos
  const legendAnchor = options.legendAnchor ?? 'start'
  const legendSizeLabels = legendSuffixes.length > 0 ? prepared.labels.map((l, i) => `${l} ${legendSuffixes[i]}`) : prepared.labels
  const legendSize = showLegend ? estimateLegendSize(legendSizeLabels, legendPos, containerWidth) : { width: 0, height: 0 }

  const marginOverrides = computeArcMargins(body, prepared.labels, showLegend, legendPos, legendSize, useDirectLabels)
  const { chartArea, width, height } = createCanvas(body, marginOverrides)
  return { chartArea, width, height, showLegend, legendPos, legendAnchor, legendSize, legendSuffixes }
}

function applyArcLegendMargins(m: Record<string, number>, showLegend: boolean, legendPos: string, legendSize: { width: number, height: number }): void {
  if (!showLegend) {
    return
  }
  const legendH = legendSize.height + 10
  if (legendPos === 'top') {
    m.top = 20 + legendH
  }
  if (legendPos === 'bottom') {
    m.bottom = 40 + legendH
  }
  if (legendPos === 'left') {
    m.left = 50 + legendSize.width + 10
  }
  if (legendPos === 'right') {
    m.right = 20 + legendSize.width + 10
  }
}

function computeArcMargins(
  body: HTMLElement,
  labels: string[],
  showLegend: boolean,
  legendPos: string,
  legendSize: { width: number, height: number },
  useDirectLabels: boolean,
): Record<string, number> {
  const m: Record<string, number> = {}
  applyArcLegendMargins(m, showLegend, legendPos, legendSize)
  if (useDirectLabels) {
    applyDirectLabelMargins(body, labels, m)
  }
  return m
}

function applyDirectLabelMargins(body: HTMLElement, labels: string[], m: Record<string, number>) {
  const containerRect = body.getBoundingClientRect()
  const defaultMargin = 20
  const roughW = containerRect.width - 2 * defaultMargin
  const roughH = (containerRect.height > 0 ? containerRect.height : 400) - 2 * defaultMargin
  const roughRadius = Math.min(roughW, roughH) / 2
  const arcLabelMargins = estimateArcLabelMargins(labels, roughRadius)
  m.left = (m.left ?? defaultMargin) + arcLabelMargins.left
  m.right = (m.right ?? defaultMargin) + arcLabelMargins.right
  m.top = (m.top ?? defaultMargin) + arcLabelMargins.top
  m.bottom = (m.bottom ?? defaultMargin) + arcLabelMargins.bottom
}

function createArcChartElements(layout: ArcLayout, prepared: ArcPreparedData, colors: string[], innerRadiusRatio: number, options: ChartOptions) {
  const radius = Math.min(layout.width, layout.height) / 2
  const innerRadius = radius * innerRadiusRatio
  const colorScale = d3.scaleOrdinal<string>().domain(prepared.labels).range(colors)
  const pie = d3.pie<number>().sort(null)
  const arcGen = d3.arc<d3.PieArcDatum<number>>().innerRadius(innerRadius).outerRadius(radius)
  const centerGroup = d3.select(layout.chartArea).append('g').attr('transform', `translate(${layout.width / 2},${layout.height / 2})`)
  const pieData = pie(prepared.values)
  const chart = new ArcChart(centerGroup)
  chart.config({ arc: arcGen, colorScale, labels: prepared.labels })
  if (options.tooltips) {
    chart.use(createTooltipPlugin())
  }
  chart.draw(pieData)
  return { centerGroup, pieData, colorScale, radius, innerRadius }
}

function drawArcChart(
  container: HTMLElement,
  layout: ArcLayout,
  prepared: ArcPreparedData,
  colors: string[],
  innerRadiusRatio: number,
  dlMode: string,
  useDirectLabels: boolean,
  options: ChartOptions,
) {
  const { centerGroup, pieData, colorScale, radius, innerRadius } = createArcChartElements(layout, prepared, colors, innerRadiusRatio, options)
  if (useDirectLabels) {
    renderArcDirectLabels(container, centerGroup, pieData, prepared, colorScale, radius, innerRadius, layout, dlMode, options)
  }
  renderArcCenterTotal(centerGroup, prepared, innerRadiusRatio, options)
  renderArcLegend(layout, prepared.labels, colors)
}

function buildArcLabelData(pieData: d3.PieArcDatum<number>[], prepared: ArcPreparedData, colorScale: d3.ScaleOrdinal<string, string>, options: ChartOptions): ArcLabelDatum[] {
  return pieData.map((d, i) => ({
    label: prepared.labels[i],
    value: d.data,
    startAngle: d.startAngle,
    endAngle: d.endAngle,
    color: colorScale(prepared.labels[i]),
    percentage: prepared.percentages[i],
    displayAsPercentage: options.displayAsPercentage,
    showLabel: options.showLabels ?? true,
    showValue: options.showValues ?? true,
  }))
}

function dispatchArcLabelRenderer(
  labelParent: d3.Selection<SVGGElement, unknown, null, undefined>,
  arcLabelData: ArcLabelDatum[],
  labelOpts: { outerRadius: number, innerRadius: number, chartWidth: number, chartHeight: number, bgColor: string },
  dlMode: string,
): void {
  if (dlMode === 'inside') {
    renderInsideArcLabels(labelParent, arcLabelData, labelOpts)
  }
  else if (dlMode === 'auto') {
    renderAutoArcLabels(labelParent, arcLabelData, labelOpts)
  }
  else {
    renderArcLabels(labelParent, arcLabelData, labelOpts)
  }
}

function renderArcDirectLabels(
  container: HTMLElement,
  centerGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  pieData: d3.PieArcDatum<number>[],
  prepared: ArcPreparedData,
  colorScale: d3.ScaleOrdinal<string, string>,
  radius: number,
  innerRadius: number,
  layout: ArcLayout,
  dlMode: string,
  options: ChartOptions,
) {
  const arcLabelData = buildArcLabelData(pieData, prepared, colorScale, options)
  const labelParent = centerGroup as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
  const bgColor = resolveBackgroundColor(container)
  const labelOpts = { outerRadius: radius, innerRadius, chartWidth: layout.width, chartHeight: layout.height, bgColor }
  dispatchArcLabelRenderer(labelParent, arcLabelData, labelOpts, dlMode)
}

function appendCenterTotalLabel(centerGroup: d3.Selection<SVGGElement, unknown, null, undefined>): void {
  centerGroup.append('text')
    .attr('class', 'bc-arc-total-label')
    .attr('text-anchor', 'middle')
    .attr('dy', '-0.3em')
    .attr('font-size', '11px')
    .attr('fill', 'var(--bc-text-color, #555)')
    .attr('opacity', 0.7)
    .text('Total')
}

function appendCenterTotalValue(centerGroup: d3.Selection<SVGGElement, unknown, null, undefined>, totalText: string): void {
  centerGroup.append('text')
    .attr('class', 'bc-arc-total-value')
    .attr('text-anchor', 'middle')
    .attr('dy', '1em')
    .attr('font-size', '18px')
    .attr('font-weight', 'bold')
    .attr('fill', 'var(--bc-text-color, #555)')
    .text(totalText)
}

function renderArcCenterTotal(
  centerGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  prepared: ArcPreparedData,
  innerRadiusRatio: number,
  options: ChartOptions,
) {
  if (!options.showTotal || innerRadiusRatio <= 0) {
    return
  }
  const totalText = options.displayAsPercentage ? '100%' : String(prepared.total)
  appendCenterTotalLabel(centerGroup)
  appendCenterTotalValue(centerGroup, totalText)
}

function renderArcLegend(layout: ArcLayout, labels: string[], colors: string[]) {
  if (!layout.showLegend) {
    return
  }
  let xPos = 0
  let yPos = 0
  if (layout.legendPos === 'top') {
    yPos = -(layout.legendSize.height + 5)
  }
  else if (layout.legendPos === 'bottom') {
    yPos = layout.height + 25
  }
  else if (layout.legendPos === 'left') {
    xPos = -(layout.legendSize.width + 10)
  }
  else if (layout.legendPos === 'right') {
    xPos = layout.width + 10
  }
  renderLegend(layout.chartArea, labels, colors, yPos, layout.legendPos, layout.legendAnchor, layout.width, layout.height, xPos, layout.legendSuffixes)
}
