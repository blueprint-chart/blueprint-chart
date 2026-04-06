import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import type { ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas, contentSize, labelPositionMargins, estimateCategoryLabelWidth, computeMarginDelta } from '../../canvas/canvas'
import { AxisService } from '../../axis/axis-service'
import { renderLegend } from '../../legend/legend'
import { estimateLegendSize } from '../../legend/legend-size'
import { contrastTextColor } from '../../contrast'
import { resolveSeriesColor, isSeriesHidden, resolveSeriesValueLabels, resolveSeriesOpacity } from '../../series-helpers'
import { getDefaultTransitionMs, setRenderTransition, fadeIn, snapshotForFadeOut, commitFadeOut, reinsertWithOffset } from '../../motion'
import { setCachedChart, getCachedChart } from '../../transition-cache'
import { createTooltipPlugin } from '../../plugins/tooltip'
import { createCrosshairPlugin } from '../../plugins/crosshair'
import { Orientation, ValueLabelPosition } from '../../../enums'

const DEFAULT_COLORS = [
  '#4e79a7', '#f28e2b', '#e15759', '#76b7b2',
  '#59a14f', '#edc948', '#b07aa1', '#ff9da7',
]

const CATEGORY_LABEL_HEIGHT = 13

interface GroupedBarDatum {
  label: string
  seriesName: string
  seriesIndex: number
  value: number
}

class BarGroupedChart extends D3Blueprint<GroupedBarDatum[]> {
  initialize() {
    this.configDefine('x', { defaultValue: d3.scaleLinear() })
    this.configDefine('y0', { defaultValue: d3.scaleBand<string>() })
    this.configDefine('y1', { defaultValue: d3.scaleBand<string>() })
    this.configDefine('colors', { defaultValue: DEFAULT_COLORS })
    this.configDefine('categoryLabelOffset', { defaultValue: 0 })

    const g = this.base.append('g')

    this.layer('bars', g, {
      dataBind: (sel, data) => sel.selectAll('.bc-bar-grouped').data(data, (d: GroupedBarDatum) => d.label + '\0' + d.seriesName),
      insert: sel => sel.append('rect').attr('class', 'bc-bar bc-bar-grouped'),
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'enter': (sel: any) => {
          const x = this.config('x') as d3.ScaleLinear<number, number>
          const y0 = this.config('y0') as d3.ScaleBand<string>
          const y1 = this.config('y1') as d3.ScaleBand<string>
          const colors = this.config('colors') as string[]
          const labelOffset = this.config('categoryLabelOffset') as number
          sel
            .attr('data-series', (d: GroupedBarDatum) => d.seriesIndex)
            .attr('x', x(0))
            .attr('y', (d: GroupedBarDatum) => (y0(d.label) ?? 0) + labelOffset + (y1(d.seriesName) ?? 0))
            .attr('width', (d: GroupedBarDatum) => Math.max(0, x(d.value) - x(0)))
            .attr('height', y1.bandwidth())
            .attr('fill', (d: GroupedBarDatum) => colors[d.seriesIndex % colors.length])
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'merge:transition': (sel: any) => {
          const x = this.config('x') as d3.ScaleLinear<number, number>
          const y0 = this.config('y0') as d3.ScaleBand<string>
          const y1 = this.config('y1') as d3.ScaleBand<string>
          const colors = this.config('colors') as string[]
          const labelOffset = this.config('categoryLabelOffset') as number
          sel.duration(getDefaultTransitionMs())
            .attr('data-series', (d: GroupedBarDatum) => d.seriesIndex)
            .attr('x', x(0))
            .attr('y', (d: GroupedBarDatum) => (y0(d.label) ?? 0) + labelOffset + (y1(d.seriesName) ?? 0))
            .attr('width', (d: GroupedBarDatum) => Math.max(0, x(d.value) - x(0)))
            .attr('height', y1.bandwidth())
            .attr('fill', (d: GroupedBarDatum) => colors[d.seriesIndex % colors.length])
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

export function render(
  container: HTMLElement,
  data: ChartData,
  options: ChartOptions = {},
  transition = false,
): void {
  setRenderTransition(transition)

  let priorBars: Element[] = []
  let fadeOverlay: HTMLElement | null = null
  let priorMargin: { top: number, left: number } | undefined
  const axes = AxisService.for(container)

  if (transition) {
    const cached = getCachedChart(container)
    priorMargin = cached?.margin
    axes.detach()
    if (cached?.chartType === 'bar-grouped') {
      priorBars = Array.from(container.querySelectorAll('.bc-frame .bc-bar-grouped'))
    }
    else if (cached) {
      fadeOverlay = snapshotForFadeOut(container)
    }
    container.replaceChildren()
  }

  const { body } = createFrame(container, options.frame)

  const allSeries = data.series ?? []
  const series = allSeries.filter(s => !isSeriesHidden(s.name, options.seriesOverrides))
  const seriesNames = series.map(s => s.name)
  const colors = options.colors ?? DEFAULT_COLORS
  const overrides = options.seriesOverrides

  const showLegend = options.legend !== false
  const containerWidth = contentSize(body).width
  const NARROW_THRESHOLD = 350
  const requestedLegendPos = options.legendPosition ?? 'top'
  const legendPos = (containerWidth > 0 && containerWidth < NARROW_THRESHOLD && (requestedLegendPos === 'left' || requestedLegendPos === 'right'))
    ? 'top'
    : requestedLegendPos
  const legendAnchor = options.legendAnchor ?? 'start'

  const useCategoryLabelLine = options.categoryLabelLine === true
  const vLabelW = estimateCategoryLabelWidth(data.labels)
  const effectiveVLabelPosition = useCategoryLabelLine ? 'off' : options.verticalAxis?.labelPosition
  const lpMargins = labelPositionMargins(
    containerWidth,
    effectiveVLabelPosition,
    options.horizontalAxis?.labelPosition,
    options.verticalAxis?.direction,
    vLabelW,
    options.horizontalAxis?.showAxis,
  )

  const legendAvailableWidth = Math.max(0, containerWidth - (lpMargins.left ?? 50) - (lpMargins.right ?? 20))
  const legendSize = showLegend ? estimateLegendSize(seriesNames, legendPos, legendAvailableWidth) : { width: 0, height: 0 }
  const legendH = showLegend ? legendSize.height + 10 : 0

  const marginOverrides: Record<string, number> = { ...lpMargins }
  if (showLegend && legendPos === 'top') {
    marginOverrides.top = legendH
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
  const marginDelta = computeMarginDelta(priorMargin, margin)

  // Sort labels by total across all visible series
  let sortedLabels = data.labels
  if (options.sortMode === 'total') {
    const totals = data.labels.map((label, i) => ({
      label,
      total: series.reduce((sum, s) => sum + (s.values[i] ?? 0), 0),
    }))
    totals.sort((a, b) => b.total - a.total)
    sortedLabels = totals.map(t => t.label)
  }

  const y0 = d3.scaleBand<string>()
    .domain(sortedLabels)
    .range([0, height])
    .paddingInner(0.2)
    .paddingOuter(0.05)

  const categoryLabelOffset = useCategoryLabelLine ? CATEGORY_LABEL_HEIGHT : 0
  const barAreaHeight = Math.max(0, y0.bandwidth() - categoryLabelOffset)

  const y1 = d3.scaleBand<string>()
    .domain(seriesNames)
    .range([0, barAreaHeight])
    .padding(0.05)

  const maxValue = d3.max(series.flatMap(s => s.values)) ?? 0

  const x = d3.scaleLinear()
    .domain([0, maxValue])
    .nice()
    .range([0, width])

  // Vertical (category) axis
  axes.attach(chartArea, marginDelta)
  axes.update({
    vertical: {
      scale: y0,
      height,
      options: {
        ...options.verticalAxis,
        labelPosition: useCategoryLabelLine ? 'off' : options.verticalAxis?.labelPosition,
        topPadding: margin.top,
      },
    },
    horizontal: { scale: x, height, options: { ...options.horizontalAxis, width } },
    order: 'horizontal-first',
  })

  // Clip group for bars
  const clipId = `bc-clip-${Math.random().toString(36).slice(2, 8)}`
  const svg = chartArea.ownerSVGElement!
  const defs = d3.select(svg).select('defs').empty()
    ? d3.select(svg).append('defs')
    : d3.select(svg).select('defs')
  defs.append('clipPath').attr('id', clipId)
    .append('rect').attr('width', width).attr('height', height)
  const clippedGroup = d3.select(chartArea).append('g').attr('clip-path', `url(#${clipId})`)

  // Build flat data: one datum per (label, series) pair
  const flatData: GroupedBarDatum[] = []
  for (const label of sortedLabels) {
    const li = data.labels.indexOf(label)
    for (const s of series) {
      const si = allSeries.findIndex(as => as.name === s.name)
      flatData.push({
        label,
        seriesName: s.name,
        seriesIndex: si,
        value: li >= 0 ? (s.values[li] ?? 0) : 0,
      })
    }
  }

  const chart = new BarGroupedChart(clippedGroup)
  chart.config({ x, y0, y1, colors, categoryLabelOffset })

  if (priorBars.length > 0) {
    const layerG = clippedGroup.node()!.querySelector('g')!
    reinsertWithOffset(layerG, priorBars, marginDelta?.dx ?? 0, marginDelta?.dy ?? 0)
  }

  if (options.tooltips) {
    chart.use(createTooltipPlugin({ numberFormat: options.verticalAxis?.numberFormat }))
  }
  if (options.crosshair) {
    chart.use(createCrosshairPlugin({
      width, height, direction: options.crosshairDirection, style: options.crosshairStyle, color: options.crosshairColor, orientation: Orientation.Horizontal,
    }))
  }

  chart.draw(flatData)
  setCachedChart(container, { chartType: 'bar-grouped', margin })

  if (fadeOverlay) {
    fadeIn(clippedGroup.node()!)
    commitFadeOut(container, fadeOverlay)
  }

  // Apply per-series color and opacity overrides
  d3.select(chartArea).selectAll('.bc-bar-grouped').each(function (this: SVGRectElement, d: unknown) {
    const datum = d as GroupedBarDatum
    const seriesColor = resolveSeriesColor(datum.seriesName, datum.seriesIndex, colors, overrides)
    const seriesOpacity = resolveSeriesOpacity(datum.seriesName, overrides)
    const el = transition
      ? d3.select(this).transition().duration(getDefaultTransitionMs())
      : d3.select(this)
    el.attr('fill', seriesColor)
    if (seriesOpacity < 1) {
      el.attr('fill-opacity', seriesOpacity)
    }
  })

  // Category labels on separate line
  if (useCategoryLabelLine) {
    const labelGroup = d3.select(chartArea).append('g').attr('class', 'bc-category-labels')
    for (const label of sortedLabels) {
      const groupTop = y0(label) ?? 0
      labelGroup.append('text')
        .attr('class', 'bc-category-label')
        .attr('x', 2)
        .attr('y', groupTop + CATEGORY_LABEL_HEIGHT / 2)
        .attr('text-anchor', 'start')
        .attr('dominant-baseline', 'central')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .attr('fill', 'currentColor')
        .text(label)
    }
  }

  // Value labels (default true for grouped bars)
  const globalValueLabels = options.valueLabels ?? true
  const valueLabelPos = options.valueLabelPosition ?? ValueLabelPosition.Auto
  const vlGroup = d3.select(chartArea).append('g').attr('class', 'bc-value-labels')

  flatData.forEach((datum) => {
    if (!resolveSeriesValueLabels(datum.seriesName, globalValueLabels, overrides)) {
      return
    }

    const seriesColor = resolveSeriesColor(datum.seriesName, datum.seriesIndex, colors, overrides)
    const barWidth = Math.max(0, x(datum.value) - x(0))
    const barRight = x(0) + barWidth
    const cy = (y0(datum.label) ?? 0) + categoryLabelOffset + (y1(datum.seriesName) ?? 0) + y1.bandwidth() / 2

    const isInside = valueLabelPos === ValueLabelPosition.Inside
      || (valueLabelPos === ValueLabelPosition.Auto && barWidth > 30)

    let tx: number
    let anchor: string
    let fill: string
    if (isInside) {
      tx = barRight - 4
      anchor = 'end'
      fill = contrastTextColor(seriesColor)
    }
    else {
      tx = barRight + 4
      anchor = 'start'
      fill = 'currentColor'
    }

    vlGroup.append('text')
      .attr('class', 'bc-value-label')
      .attr('data-series', datum.seriesIndex)
      .attr('x', tx)
      .attr('y', cy)
      .attr('text-anchor', anchor)
      .attr('dominant-baseline', 'central')
      .attr('font-size', '11px')
      .attr('fill', fill)
      .text(String(datum.value))
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
      yPos = -(legendSize.height + 5)
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
