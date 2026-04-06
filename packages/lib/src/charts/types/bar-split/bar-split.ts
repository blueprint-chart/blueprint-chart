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

const PANEL_GAP = 16
const PANEL_HEADER_HEIGHT = 20
const CATEGORY_LABEL_HEIGHT = 13

interface SplitBarDatum {
  label: string
  seriesName: string
  seriesIndex: number
  value: number
  /** Absolute x position of the bar's left edge within the chart area */
  xPos: number
  /** Pixel width of the bar */
  barWidth: number
}

class BarSplitChart extends D3Blueprint<SplitBarDatum[]> {
  initialize() {
    this.configDefine('y', { defaultValue: d3.scaleBand<string>() })
    this.configDefine('colors', { defaultValue: DEFAULT_COLORS })
    this.configDefine('categoryLabelOffset', { defaultValue: 0 })

    const g = this.base.append('g')

    this.layer('bars', g, {
      dataBind: (sel, data) => sel.selectAll('.bc-bar-split').data(data, (d: SplitBarDatum) => d.label + '\0' + d.seriesName),
      insert: sel => sel.append('rect').attr('class', 'bc-bar bc-bar-split'),
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'enter': (sel: any) => {
          const y = this.config('y') as d3.ScaleBand<string>
          const colors = this.config('colors') as string[]
          const labelOffset = this.config('categoryLabelOffset') as number
          sel
            .attr('data-series', (d: SplitBarDatum) => d.seriesIndex)
            .attr('x', (d: SplitBarDatum) => d.xPos)
            .attr('y', (d: SplitBarDatum) => (y(d.label) ?? 0) + labelOffset)
            .attr('width', (d: SplitBarDatum) => d.barWidth)
            .attr('height', Math.max(0, y.bandwidth() - labelOffset))
            .attr('fill', (d: SplitBarDatum) => colors[d.seriesIndex % colors.length])
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'merge:transition': (sel: any) => {
          const y = this.config('y') as d3.ScaleBand<string>
          const colors = this.config('colors') as string[]
          const labelOffset = this.config('categoryLabelOffset') as number
          sel.duration(getDefaultTransitionMs())
            .attr('data-series', (d: SplitBarDatum) => d.seriesIndex)
            .attr('x', (d: SplitBarDatum) => d.xPos)
            .attr('y', (d: SplitBarDatum) => (y(d.label) ?? 0) + labelOffset)
            .attr('width', (d: SplitBarDatum) => d.barWidth)
            .attr('height', Math.max(0, y.bandwidth() - labelOffset))
            .attr('fill', (d: SplitBarDatum) => colors[d.seriesIndex % colors.length])
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

interface PanelLayout {
  seriesName: string
  seriesIndex: number
  xOffset: number
  panelWidth: number
  xScale: d3.ScaleLinear<number, number>
}

function computePanels(
  series: { name: string, values: number[] }[],
  allSeries: { name: string, values: number[] }[],
  totalWidth: number,
  sharedScale: boolean,
): PanelLayout[] {
  const n = series.length
  if (n === 0) {
    return []
  }
  const panelWidth = Math.max(0, (totalWidth - (n - 1) * PANEL_GAP) / n)
  const globalMax = sharedScale ? (d3.max(series.flatMap(s => s.values)) ?? 0) : 0

  return series.map((s, i) => {
    const panelMax = sharedScale ? globalMax : (d3.max(s.values) ?? 0)
    const xScale = d3.scaleLinear()
      .domain([0, panelMax])
      .nice()
      .range([0, panelWidth])
    return {
      seriesName: s.name,
      seriesIndex: allSeries.findIndex(as => as.name === s.name),
      xOffset: i * (panelWidth + PANEL_GAP),
      panelWidth,
      xScale,
    }
  })
}

function buildFlatData(
  panels: PanelLayout[],
  sortedLabels: string[],
  originalLabels: string[],
  allSeries: { name: string, values: number[] }[],
): SplitBarDatum[] {
  const result: SplitBarDatum[] = []
  for (const panel of panels) {
    const s = allSeries.find(as => as.name === panel.seriesName)
    if (!s) {
      continue
    }
    for (const label of sortedLabels) {
      const li = originalLabels.indexOf(label)
      const value = li >= 0 ? (s.values[li] ?? 0) : 0
      const barWidth = Math.max(0, panel.xScale(value) - panel.xScale(0))
      result.push({
        label,
        seriesName: panel.seriesName,
        seriesIndex: panel.seriesIndex,
        value,
        xPos: panel.xOffset,
        barWidth,
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
  setRenderTransition(transition)

  let priorBars: Element[] = []
  let fadeOverlay: HTMLElement | null = null
  let priorMargin: { top: number, left: number } | undefined
  const axes = AxisService.for(container)

  if (transition) {
    const cached = getCachedChart(container)
    priorMargin = cached?.margin
    axes.detach()
    if (cached?.chartType === 'bar-split') {
      priorBars = Array.from(container.querySelectorAll('.bc-frame .bc-bar-split'))
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

  // Reserve space for panel headers above the chart area
  lpMargins.top = (lpMargins.top ?? 20) + PANEL_HEADER_HEIGHT

  const legendAvailableWidth = Math.max(0, containerWidth - (lpMargins.left ?? 50) - (lpMargins.right ?? 20))
  const legendSize = showLegend ? estimateLegendSize(seriesNames, legendPos, legendAvailableWidth) : { width: 0, height: 0 }
  const legendH = showLegend ? legendSize.height + 10 : 0

  const marginOverrides: Record<string, number> = { ...lpMargins }
  if (showLegend && legendPos === 'top') {
    marginOverrides.top = (marginOverrides.top ?? 20) + legendH
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

  const y = d3.scaleBand<string>()
    .domain(sortedLabels)
    .range([0, height])
    .padding(0.2)

  const categoryLabelOffset = useCategoryLabelLine ? CATEGORY_LABEL_HEIGHT : 0

  // Vertical axis only (category labels on the left)
  axes.attach(chartArea, marginDelta)
  axes.update({
    vertical: {
      scale: y,
      height,
      options: {
        ...options.verticalAxis,
        labelPosition: useCategoryLabelLine ? 'off' : options.verticalAxis?.labelPosition,
        topPadding: margin.top,
      },
    },
    order: 'horizontal-first',
  })

  const sharedScale = options.sharedScale === true
  const panels = computePanels(series, allSeries, width, sharedScale)

  // Clip group for bars
  const clipId = `bc-clip-${Math.random().toString(36).slice(2, 8)}`
  const svg = chartArea.ownerSVGElement!
  const defs = d3.select(svg).select('defs').empty()
    ? d3.select(svg).append('defs')
    : d3.select(svg).select('defs')
  defs.append('clipPath').attr('id', clipId)
    .append('rect').attr('width', width).attr('height', height)
  const clippedGroup = d3.select(chartArea).append('g').attr('clip-path', `url(#${clipId})`)

  // Panel headers — series names centered above each panel
  const headerGroup = d3.select(chartArea).append('g').attr('class', 'bc-split-headers')
  for (const panel of panels) {
    headerGroup.append('text')
      .attr('class', 'bc-split-header')
      .attr('x', panel.xOffset + panel.panelWidth / 2)
      .attr('y', -PANEL_HEADER_HEIGHT / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', 'currentColor')
      .text(panel.seriesName)
  }

  const flatData = buildFlatData(panels, sortedLabels, data.labels, allSeries)

  const chart = new BarSplitChart(clippedGroup)
  chart.config({ y, colors, categoryLabelOffset })

  if (priorBars.length > 0) {
    const layerG = clippedGroup.node()!.querySelector('g')!
    reinsertWithOffset(layerG, priorBars, marginDelta?.dx ?? 0, marginDelta?.dy ?? 0)
  }

  if (options.tooltips) {
    chart.use(createTooltipPlugin())
  }
  if (options.crosshair) {
    chart.use(createCrosshairPlugin({
      width, height, direction: options.crosshairDirection, style: options.crosshairStyle, color: options.crosshairColor, orientation: Orientation.Horizontal,
    }))
  }

  chart.draw(flatData)
  setCachedChart(container, { chartType: 'bar-split', margin })

  if (fadeOverlay) {
    fadeIn(clippedGroup.node()!)
    commitFadeOut(container, fadeOverlay)
  }

  // Apply per-series color and opacity overrides
  d3.select(chartArea).selectAll('.bc-bar-split').each(function (this: SVGRectElement, d: unknown) {
    const datum = d as SplitBarDatum
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
    const categoryLabelGroup = d3.select(chartArea).append('g').attr('class', 'bc-category-labels')
    for (const label of sortedLabels) {
      const groupTop = y(label) ?? 0
      categoryLabelGroup.append('text')
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

  // Value labels (default true — the primary way to read values in split bars)
  const globalValueLabels = options.valueLabels ?? true
  const valueLabelPos = options.valueLabelPosition ?? ValueLabelPosition.Auto
  const vlGroup = d3.select(chartArea).append('g').attr('class', 'bc-value-labels')

  flatData.forEach((datum) => {
    if (!resolveSeriesValueLabels(datum.seriesName, globalValueLabels, overrides)) {
      return
    }
    const panel = panels.find(p => p.seriesName === datum.seriesName)
    if (!panel) {
      return
    }

    const seriesColor = resolveSeriesColor(datum.seriesName, datum.seriesIndex, colors, overrides)
    const barRight = datum.xPos + datum.barWidth
    const barHeight = Math.max(0, y.bandwidth() - categoryLabelOffset)
    const cy = (y(datum.label) ?? 0) + categoryLabelOffset + barHeight / 2

    const isInside = valueLabelPos === ValueLabelPosition.Inside
      || (valueLabelPos === ValueLabelPosition.Auto && datum.barWidth > 30)

    let tx: number
    let anchor: string
    let fill: string
    if (isInside) {
      tx = barRight - 4
      anchor = 'end'
      fill = contrastTextColor(seriesColor)
    }
    else {
      const outsideX = barRight + 4
      const panelRight = panel.xOffset + panel.panelWidth
      if (outsideX + 20 > panelRight) {
        // Not enough room outside — render before bar start
        tx = datum.xPos - 4
        anchor = 'end'
      }
      else {
        tx = outsideX
        anchor = 'start'
      }
      fill = 'currentColor'
    }

    vlGroup.append('text')
      .attr('class', 'bc-value-label')
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
      yPos = -(legendSize.height + 5 + PANEL_HEADER_HEIGHT)
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
