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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        enter: (sel: any) => {
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
  const { body } = createFrame(container, options.frame)

  const allSeries = data.series ?? []
  const series = allSeries.filter(s => !isSeriesHidden(s.name, options.seriesOverrides))
  const seriesNames = series.map(s => s.name)
  const colors = options.colors ?? DEFAULT_COLORS
  const overrides = options.seriesOverrides

  // Determine global label mode early so margin calculations account for direct labels
  const globalLabelMode = options.directLabelling ? 'direct' : (options.legend !== false ? 'legend' : 'none')

  // Compute margin adjustments for legend
  const showLegend = options.legend !== false && !options.directLabelling
  const containerWidth = body.getBoundingClientRect().width
  const NARROW_THRESHOLD = 350
  const requestedLegendPos = options.legendPosition ?? 'top'
  const legendPos = (containerWidth > 0 && containerWidth < NARROW_THRESHOLD && (requestedLegendPos === 'left' || requestedLegendPos === 'right'))
    ? 'top'
    : requestedLegendPos
  const legendAnchor = options.legendAnchor ?? 'start'
  const legendSize = showLegend ? estimateLegendSize(seriesNames, legendPos, containerWidth) : { width: 0, height: 0 }
  const legendH = showLegend ? legendSize.height + 10 : 0
  const allValues = series.flatMap(s => s.values)
  const vLabelW = estimateVerticalLabelWidth(allValues, options.verticalAxis?.range, options.verticalAxis?.numberFormat, options.verticalAxis?.scaleType)
  const lpMargins = labelPositionMargins(containerWidth, options.verticalAxis?.labelPosition, options.horizontalAxis?.labelPosition, options.verticalAxis?.direction, vLabelW)

  const marginOverrides: Record<string, number> = { ...lpMargins }
  if (showLegend && legendPos === 'top') marginOverrides.top = (marginOverrides.top ?? 20) + legendH
  if (showLegend && legendPos === 'bottom') marginOverrides.bottom = (marginOverrides.bottom ?? 40) + legendH
  if (showLegend && legendPos === 'left') marginOverrides.left = (marginOverrides.left ?? 50) + legendSize.width + 10
  if (showLegend && legendPos === 'right') marginOverrides.right = (marginOverrides.right ?? 20) + legendSize.width + 10

  const { chartArea, width, height, margin } = createCanvas(body, marginOverrides)
  const [domainMin, domainMax] = computeLinearDomain(allValues, options.verticalAxis?.range)

  // Sort labels by total (sum across series) when sortMode is 'total'
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

  const x0 = d3.scaleBand<string>()
    .domain(sortedLabels)
    .range([0, width])
    .padding(0.2)

  const x1 = d3.scaleBand<string>()
    .domain(seriesNames)
    .range([0, x0.bandwidth()])
    .padding(0.05)

  const useLog = options.verticalAxis?.scaleType === 'log'
  const y = useLog
    ? d3.scaleSymlog().domain([domainMin, domainMax]).nice().range([height, 0])
    : d3.scaleLinear().domain([domainMin, domainMax]).nice().range([height, 0])

  renderVerticalAxis(chartArea, y, height, { ...options.verticalAxis, gridWidth: width, topPadding: margin.top })
  renderHorizontalAxis(chartArea, x0, height, { ...options.horizontalAxis, width })

  // Zero baseline when domain spans zero
  if (!useLog && domainMin < 0 && domainMax > 0) {
    d3.select(chartArea).append('line')
      .attr('class', 'bc-zero-baseline')
      .attr('x1', 0).attr('x2', width)
      .attr('y1', y(0)).attr('y2', y(0))
      .attr('stroke', '#666').attr('stroke-width', 1)
  }

  // Build per-group rank map for within-groups sorting
  const withinGroupRank = new Map<string, string>()
  if (options.sortMode === 'within-groups') {
    data.labels.forEach((label, i) => {
      const items = series.map(s => ({ name: s.name, value: s.values[i] }))
      items.sort((a, b) => b.value - a.value)
      items.forEach((item, rank) => {
        withinGroupRank.set(`${label}\0${item.name}`, seriesNames[rank])
      })
    })
  }

  const flatData: MultiBarDatum[] = []
  data.labels.forEach((label, i) => {
    series.forEach((s) => {
      const originalIndex = allSeries.findIndex(a => a.name === s.name)
      const positionKey = options.sortMode === 'within-groups'
        ? (withinGroupRank.get(`${label}\0${s.name}`) ?? s.name)
        : s.name
      flatData.push({ label, series: positionKey, seriesName: s.name, value: s.values[i], seriesIndex: originalIndex })
    })
  })

  const globalValueLabels = options.valueLabels ?? false

  const chart = new BarMultiChart(d3.select(chartArea))
  chart.config({ x0, x1, y, height, colors })
  if (options.tooltips) chart.use(createTooltipPlugin())
  if (options.crosshair) chart.use(createCrosshairPlugin({ width, height, direction: options.crosshairDirection, style: options.crosshairStyle, color: options.crosshairColor }))
  chart.draw(flatData)

  // Apply per-series color and opacity overrides to bars
  d3.select(chartArea).selectAll('.bc-bar-multi').each(function (this: SVGRectElement, d: unknown) {
    const datum = d as MultiBarDatum
    const seriesColor = resolveSeriesColor(datum.seriesName, datum.seriesIndex, colors, overrides)
    const seriesOpacity = resolveSeriesOpacity(datum.seriesName, overrides)
    const el = d3.select(this)
    el.attr('fill', seriesColor)
    if (seriesOpacity < 1) el.attr('fill-opacity', seriesOpacity)
  })

  // Build set of series that get direct labels so value labels can shift up
  const directLabelSet = new Set<string>()
  series.forEach((s) => {
    if (resolveSeriesLabelMode(s.name, globalLabelMode, overrides) === 'direct') {
      directLabelSet.add(s.name)
    }
  })
  const hasAnyDirectLabels = directLabelSet.size > 0

  const bgColor = resolveBackgroundColor(container)

  // Parse direct label sub-mode
  const dlMode = typeof options.directLabelling === 'string'
    ? options.directLabelling
    : (options.directLabelling ? 'auto' : '')
  const dlAnchor = options.directLabelAnchor ?? 'middle'

  function resolveBarDlMode(barHeight: number): 'inside' | 'outside' {
    if (dlMode === 'inside') return 'inside'
    if (dlMode === 'outside') return 'outside'
    // auto: inside if tall enough
    return barHeight > 20 ? 'inside' : 'outside'
  }

  function insideLabelY(barTop: number, barHeight: number, anchor: string): number {
    if (anchor === 'start') return barTop + 12
    if (anchor === 'end') return barTop + barHeight - 4
    return barTop + barHeight / 2 // middle
  }

  // Resolve value label position independently from direct label mode
  const vlPos = options.valueLabelPosition ?? 'auto'
  function resolveVlMode(barHeight: number): 'inside' | 'outside' {
    if (vlPos === 'inside') return 'inside'
    if (vlPos === 'outside') return 'outside'
    // auto: inside if tall enough
    return barHeight > 20 ? 'inside' : 'outside'
  }

  // Per-series value labels
  const vlGroup = d3.select(chartArea).append('g').attr('class', 'bc-value-labels')
  flatData.forEach((datum) => {
    if (!resolveSeriesValueLabels(datum.seriesName, globalValueLabels, overrides)) return
    const cx = (x0(datum.label) ?? 0) + (x1(datum.series) ?? 0) + x1.bandwidth() / 2
    const barTop = Math.min(y(0), y(datum.value))
    const barHeight = Math.abs(y(datum.value) - y(0))
    const vlMode = resolveVlMode(barHeight)
    const hasDl = hasAnyDirectLabels && directLabelSet.has(datum.seriesName)

    let cy: number
    let fill: string
    if (vlMode === 'inside') {
      const barColor = resolveSeriesColor(datum.seriesName, datum.seriesIndex, colors, overrides)
      fill = contrastTextColor(barColor)
      // When direct labels are also inside, offset below the direct label
      const dlIsInside = hasDl && resolveBarDlMode(barHeight) === 'inside'
      if (dlIsInside) {
        const dlY = insideLabelY(barTop, barHeight, dlAnchor)
        cy = dlY + 14
      }
      else {
        cy = barTop + barHeight / 2
      }
    }
    else {
      fill = 'currentColor'
      // Shift up when direct labels are outside above the bar
      const dlIsOutside = hasDl && resolveBarDlMode(barHeight) === 'outside'
      cy = dlIsOutside ? barTop - 16 : barTop - 4
    }

    const vlEl = vlGroup.append('text')
      .attr('class', 'bc-value-label')
      .attr('x', cx)
      .attr('y', cy)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', fill)
      .text(String(datum.value))
    if (vlMode === 'inside') vlEl.attr('dominant-baseline', 'central')
  })

  // Direct labels — mode-aware positioning
  flatData.forEach((datum) => {
    if (!directLabelSet.has(datum.seriesName)) return
    const cx = (x0(datum.label) ?? 0) + (x1(datum.series) ?? 0) + x1.bandwidth() / 2
    const barTop = Math.min(y(0), y(datum.value))
    const barHeight = Math.abs(y(datum.value) - y(0))
    const labelText = overrides?.find(o => o.name === datum.seriesName)?.labelText || datum.seriesName
    const mode = resolveBarDlMode(barHeight)
    const barColor = resolveSeriesColor(datum.seriesName, datum.seriesIndex, colors, overrides)

    const labelEl = d3.select(chartArea)
      .append('text')
      .attr('class', 'bc-direct-label')
      .attr('data-series', datum.seriesIndex)
      .attr('x', cx)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .text(labelText)

    if (mode === 'inside') {
      const ly = insideLabelY(barTop, barHeight, dlAnchor)
      labelEl
        .attr('y', ly)
        .attr('fill', contrastTextColor(barColor))
      if (dlAnchor === 'middle') labelEl.attr('dominant-baseline', 'central')
    }
    else {
      labelEl
        .attr('y', barTop - 4)
        .attr('fill', readableColor(barColor, bgColor))
    }
  })

  // Legend: filter to series whose label mode resolves to 'legend'
  const legendSeriesNames = seriesNames.filter((name) => {
    return resolveSeriesLabelMode(name, globalLabelMode, overrides) === 'legend'
  })

  if (showLegend && legendSeriesNames.length > 0) {
    const legendColors = legendSeriesNames.map((name) => {
      const idx = allSeries.findIndex(s => s.name === name)
      return resolveSeriesColor(name, idx, colors, overrides)
    })

    let xPos = 0
    let yPos = 0
    if (legendPos === 'top') yPos = -(legendSize.height + 5)
    else if (legendPos === 'bottom') yPos = height + 25
    else if (legendPos === 'left') xPos = -(legendSize.width + 10)
    else if (legendPos === 'right') xPos = width + 10
    renderLegend(chartArea, legendSeriesNames, legendColors, yPos, legendPos, legendAnchor, width, height, xPos)
  }
}
