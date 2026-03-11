import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import type { ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas, contentSize, labelPositionMargins, estimateCategoryLabelWidth } from '../../canvas/canvas'
import { renderVerticalAxis } from '../../axis/vertical-axis'
import { renderHorizontalAxis } from '../../axis/horizontal-axis'
import { renderLegend } from '../../legend/legend'
import { estimateLegendSize } from '../../legend/legend-size'
import { createAnnotationPlugin, snapshotAnnotations, type AnnotationSnapshot } from '../../plugins/annotations'
import { createTooltipPlugin } from '../../plugins/tooltip'
import { createCrosshairPlugin } from '../../plugins/crosshair'
import { resolveBackgroundColor } from '../../contrast'
import { resolveSeriesColor, isSeriesHidden, resolveSeriesValueLabels, resolveSeriesOpacity } from '../../series-helpers'
import { getDefaultTransitionMs, fadeIn, snapshotForFadeOut, commitFadeOut } from '../../motion'
import { setCachedChart, getCachedChart } from '../../transition-cache'
import { computeStack, computeStack100 } from '../../stack-helpers'

const DEFAULT_COLORS = [
  '#4e79a7', '#f28e2b', '#e15759', '#76b7b2',
  '#59a14f', '#edc948', '#b07aa1', '#ff9da7',
]

interface StackedBarDatum {
  label: string
  seriesName: string
  seriesIndex: number
  y0: number
  y1: number
  value: number
}

class BarStackedChart extends D3Blueprint<StackedBarDatum[]> {
  initialize() {
    this.configDefine('x', { defaultValue: d3.scaleLinear() })
    this.configDefine('y', { defaultValue: d3.scaleBand<string>() })
    this.configDefine('colors', { defaultValue: DEFAULT_COLORS })

    const g = this.base.append('g')

    this.layer('bars', g, {
      dataBind: (sel, data) => sel.selectAll('.bc-bar-stacked').data(data, (d: StackedBarDatum) => d.label + '\0' + d.seriesName),
      insert: sel => sel.append('rect').attr('class', 'bc-bar bc-bar-stacked'),
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'enter': (sel: any) => {
          const x = this.config('x') as d3.ScaleLinear<number, number>
          const y = this.config('y') as d3.ScaleBand<string>
          const colors = this.config('colors') as string[]
          sel
            .attr('data-series', (d: StackedBarDatum) => d.seriesIndex)
            .attr('x', (d: StackedBarDatum) => x(d.y0))
            .attr('y', (d: StackedBarDatum) => y(d.label) ?? 0)
            .attr('width', (d: StackedBarDatum) => x(d.y1) - x(d.y0))
            .attr('height', y.bandwidth())
            .attr('fill', (d: StackedBarDatum) => colors[d.seriesIndex % colors.length])
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'merge:transition': (sel: any) => {
          const x = this.config('x') as d3.ScaleLinear<number, number>
          const y = this.config('y') as d3.ScaleBand<string>
          const colors = this.config('colors') as string[]
          sel.duration(getDefaultTransitionMs())
            .attr('data-series', (d: StackedBarDatum) => d.seriesIndex)
            .attr('x', (d: StackedBarDatum) => x(d.y0))
            .attr('y', (d: StackedBarDatum) => y(d.label) ?? 0)
            .attr('width', (d: StackedBarDatum) => x(d.y1) - x(d.y0))
            .attr('height', y.bandwidth())
            .attr('fill', (d: StackedBarDatum) => colors[d.seriesIndex % colors.length])
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'exit:transition': (sel: any) => {
          sel.duration(getDefaultTransitionMs())
            .attr('opacity', 0)
            .remove()
        },
      },
    })
  }
}

function flattenStack(
  stacked: d3.Series<Record<string, number>, string>[],
  labels: string[],
  allSeries: { name: string, values: number[] }[],
): StackedBarDatum[] {
  const result: StackedBarDatum[] = []
  for (const layer of stacked) {
    const seriesName = layer.key
    const seriesIndex = allSeries.findIndex(s => s.name === seriesName)
    for (let i = 0; i < layer.length; i++) {
      const point = layer[i]
      result.push({
        label: labels[i],
        seriesName,
        seriesIndex,
        y0: point[0],
        y1: point[1],
        value: point[1] - point[0],
      })
    }
  }
  return result
}

export function render(
  container: HTMLElement,
  data: ChartData,
  options: ChartOptions = {},
  transition = false,
): void {
  // Preserve existing data elements for smooth D3 data-join transitions
  let priorBars: Element[] = []
  let priorVAxis: Element | null = null
  let priorHAxis: Element | null = null
  let fadeOverlay: HTMLElement | null = null
  let priorAnnotations: Map<string, AnnotationSnapshot> | undefined
  if (transition) {
    const cached = getCachedChart(container)
    if (cached) {
      priorVAxis = container.querySelector('.bc-axis-vertical')
      priorHAxis = container.querySelector('.bc-axis-horizontal')
    }
    if (cached?.chartType === 'bar-stacked') {
      priorBars = Array.from(container.querySelectorAll('.bc-bar-stacked'))
    }
    else if (cached) {
      fadeOverlay = snapshotForFadeOut(container)
    }
    priorAnnotations = new Map()
    for (const el of container.querySelectorAll('.bc-annotations, .bc-annotations-range')) {
      for (const [k, v] of snapshotAnnotations(el)) {
        priorAnnotations.set(k, v)
      }
    }
    container.replaceChildren()
  }

  const { body } = createFrame(container, options.frame)

  const allSeries = data.series ?? []
  const series = allSeries.filter(s => !isSeriesHidden(s.name, options.seriesOverrides))
  const seriesNames = series.map(s => s.name)
  const colors = options.colors ?? DEFAULT_COLORS
  const overrides = options.seriesOverrides

  // Compute margin adjustments for legend
  const showLegend = options.legend !== false
  const containerWidth = contentSize(body).width
  const NARROW_THRESHOLD = 350
  const requestedLegendPos = options.legendPosition ?? 'top'
  const legendPos = (containerWidth > 0 && containerWidth < NARROW_THRESHOLD && (requestedLegendPos === 'left' || requestedLegendPos === 'right'))
    ? 'top'
    : requestedLegendPos
  const legendAnchor = options.legendAnchor ?? 'start'
  const legendSize = showLegend ? estimateLegendSize(seriesNames, legendPos, containerWidth) : { width: 0, height: 0 }
  const legendH = showLegend ? legendSize.height + 10 : 0

  // Build filtered data for stacking
  const filteredData: ChartData = { labels: data.labels, values: data.values, series }

  const isPercent = options.stackMode === 'percent'
  const stacked = isPercent ? computeStack100(filteredData) : computeStack(filteredData)
  const flatData = flattenStack(stacked, data.labels, allSeries)

  const maxStackedValue = isPercent
    ? 100
    : d3.max(flatData, d => d.y1) ?? 0

  const vLabelW = estimateCategoryLabelWidth(data.labels)
  const lpMargins = labelPositionMargins(containerWidth, options.verticalAxis?.labelPosition, options.horizontalAxis?.labelPosition, options.verticalAxis?.direction, vLabelW, options.horizontalAxis?.showAxis)

  const vLabelsInside = lpMargins.top != null
  const marginOverrides: Record<string, number> = { ...lpMargins }
  if (showLegend && legendPos === 'top') {
    const insideGap = vLabelsInside ? 15 : 0
    marginOverrides.top = (marginOverrides.top ?? 20) + legendH + insideGap
  }
  if (showLegend && legendPos === 'bottom') {
    marginOverrides.bottom = (marginOverrides.bottom ?? 40) + legendH
  }
  if (showLegend && legendPos === 'left') {
    marginOverrides.left = (marginOverrides.left ?? 50) + legendSize.width + 10
  }
  if (showLegend && legendPos === 'right') {
    marginOverrides.right = (marginOverrides.right ?? 20) + legendSize.width + 10
  }
  const { chartArea, width, height, margin } = createCanvas(body, marginOverrides)

  // Sort labels by total when sortMode is 'total'
  let sortedLabels = data.labels
  if (options.sortMode === 'total') {
    const totals = data.labels.map((label, i) => ({
      label,
      index: i,
      total: series.reduce((sum, s) => sum + (s.values[i] ?? 0), 0),
    }))
    totals.sort((a, b) => b.total - a.total)
    sortedLabels = totals.map(t => t.label)
  }

  const x = d3.scaleLinear()
    .domain([0, maxStackedValue])
    .nice()
    .range([0, width])

  const y = d3.scaleBand<string>()
    .domain(sortedLabels)
    .range([0, height])
    .padding(0.2)

  renderHorizontalAxis(chartArea, x, height, { ...options.horizontalAxis, width }, priorHAxis)
  renderVerticalAxis(chartArea, y, height, { ...options.verticalAxis, topPadding: margin.top }, priorVAxis)

  // Clip bars to the chart area
  const clipId = `bc-clip-${Math.random().toString(36).slice(2, 8)}`
  const svg = chartArea.ownerSVGElement!
  const defs = d3.select(svg).select('defs').empty()
    ? d3.select(svg).append('defs')
    : d3.select(svg).select('defs')
  defs.append('clipPath').attr('id', clipId)
    .append('rect').attr('width', width).attr('height', height)
  const clippedGroup = d3.select(chartArea).append('g').attr('clip-path', `url(#${clipId})`)

  // Re-order flatData to match sorted labels
  const sortedFlatData = sortedLabels === data.labels
    ? flatData
    : sortedLabels.flatMap(label => flatData.filter(d => d.label === label))

  const chart = new BarStackedChart(clippedGroup)
  chart.config({ x, y, colors })

  // Re-insert prior elements so D3 data-join finds them and triggers merge:transition
  if (priorBars.length > 0) {
    const layerG = clippedGroup.node()!.querySelector('g')!
    priorBars.forEach(el => layerG.appendChild(el))
  }
  if (options.tooltips) {
    chart.use(createTooltipPlugin())
  }
  if (options.crosshair) {
    chart.use(createCrosshairPlugin({
      width, height, direction: options.crosshairDirection, style: options.crosshairStyle, color: options.crosshairColor, orientation: 'horizontal' }))
  }
  if (options.annotations?.length) {
    const annotationData = data.labels.map((l, i) => ({
      label: l,
      value: series.reduce((sum, s) => sum + (s.values[i] ?? 0), 0),
    }))
    chart.use(createAnnotationPlugin(options.annotations, { scaleX: y, scaleY: x, data: annotationData, width, height, backgroundColor: resolveBackgroundColor(container), orientation: 'horizontal', transition, priorAnnotations }))
  }
  chart.draw(sortedFlatData)
  setCachedChart(container, { chartType: 'bar-stacked' })

  if (fadeOverlay) {
    fadeIn(clippedGroup.node()!)
    commitFadeOut(container, fadeOverlay)
  }

  // Apply per-series color and opacity overrides to bars
  d3.select(chartArea).selectAll('.bc-bar-stacked').each(function (this: SVGRectElement, d: unknown) {
    const datum = d as StackedBarDatum
    const seriesColor = resolveSeriesColor(datum.seriesName, datum.seriesIndex, colors, overrides)
    const seriesOpacity = resolveSeriesOpacity(datum.seriesName, overrides)
    const el = d3.select(this)
    el.attr('fill', seriesColor)
    if (seriesOpacity < 1) {
      el.attr('fill-opacity', seriesOpacity)
    }
  })

  // Value labels
  const globalValueLabels = options.valueLabels ?? false
  const vlGroup = d3.select(chartArea).append('g').attr('class', 'bc-value-labels')
  sortedFlatData.forEach((datum) => {
    if (!resolveSeriesValueLabels(datum.seriesName, globalValueLabels, overrides)) {
      return
    }
    const cx = x(datum.y0) + (x(datum.y1) - x(datum.y0)) / 2
    const cy = (y(datum.label) ?? 0) + y.bandwidth() / 2
    vlGroup.append('text')
      .attr('class', 'bc-value-label')
      .attr('x', cx)
      .attr('y', cy)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '11px')
      .attr('fill', 'currentColor')
      .text(isPercent ? `${Math.round(datum.value)}%` : String(Math.round(datum.value * 100) / 100))
  })

  // Legend
  if (showLegend && seriesNames.length > 0) {
    const legendColors = seriesNames.map((name) => {
      const idx = allSeries.findIndex(s => s.name === name)
      return resolveSeriesColor(name, idx, colors, overrides)
    })

    let xPos = 0
    let yPos = 0
    if (legendPos === 'top') {
      const insideGap = vLabelsInside ? 15 : 0
      yPos = -(legendSize.height + 5 + insideGap)
    }
    else if (legendPos === 'bottom') {
      yPos = height + 25
    }
    else if (legendPos === 'left') {
      xPos = -(legendSize.width + 10)
    }
    else if (legendPos === 'right') {
      xPos = width + 10
    }
    renderLegend(chartArea, seriesNames, legendColors, yPos, legendPos, legendAnchor, width, height, xPos)
  }
}
