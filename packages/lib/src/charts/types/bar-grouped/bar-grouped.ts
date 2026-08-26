import * as d3 from 'd3'
import 'd3-transition'
import type { ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas, contentSize, labelPositionMargins, estimateCategoryLabelWidth, computeMarginDelta } from '../../canvas/canvas'
import { AxisService } from '../../axis/axis-service'
import { renderLegend } from '../../legend/legend'
import { estimateLegendSize } from '../../legend/legend-size'
import { contrastTextColor } from '../../contrast'
import { expandColorsToSeries, seriesOrImplicit, resolveSeriesColor, isSeriesHidden, resolveSeriesValueLabels, resolveSeriesOpacity } from '../../series-helpers'
import { setRenderTransition, fadeIn, snapshotForFadeOut, commitFadeOut } from '../../motion'
import { setCachedChart, getCachedChart } from '../../transition-cache'
import { createTooltipPlugin } from '../../plugins/tooltip'
import { createCrosshairPlugin } from '../../plugins/crosshair'
import { highlightTargetSet, highlightOpacity } from '../../plugins/highlight'
import { buildColorOverrides } from '../../plugins/colorize'
import { computeLinearDomain, resolveBarGapPadding } from '../../scale-helpers'
import { ensureClipPath } from '../../clip-path-helper'
import { featureJoin, getSceneTransition, tweenPlotFrame, type PlotRect } from '../../../transitions'
import { createPluginHost } from '../../plugins/plugin-host'
import { Orientation, ValueLabelPosition, LabelPosition, ScaleType } from '../../../enums'
import { shouldRenderValueLabel } from '../../value-label-fit'
import { CATEGORY_LABEL_HEIGHT, categoryLabelLineHeight } from '../../category-label-line'

export const DEFAULT_COLORS = [
  '#4e79a7', '#f28e2b', '#e15759', '#76b7b2',
  '#59a14f', '#edc948', '#b07aa1', '#ff9da7',
]

interface GroupedBarDatum {
  label: string
  seriesName: string
  seriesIndex: number
  value: number
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
  let priorMargin: { top: number, left: number, right: number, bottom: number } | undefined
  let priorPlotRect: PlotRect | undefined
  const axes = AxisService.for(container)

  if (transition) {
    const cached = getCachedChart(container)
    priorMargin = cached?.margin
    priorPlotRect = cached?.plotRect
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

  const allSeries = seriesOrImplicit(data)
  const series = allSeries.filter(s => !isSeriesHidden(s.name, options.seriesOverrides))
  const seriesNames = series.map(s => s.name)
  // The implicit single series has no name, so it gets no legend entry.
  const legendNames = seriesNames.filter(Boolean)
  const colors = expandColorsToSeries(options.colors ?? DEFAULT_COLORS, allSeries.length)
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
  const effectiveVLabelPosition = useCategoryLabelLine ? LabelPosition.Off : options.verticalAxis?.labelPosition
  const lpMargins = labelPositionMargins(
    containerWidth,
    effectiveVLabelPosition,
    options.horizontalAxis?.labelPosition,
    options.verticalAxis?.direction,
    vLabelW,
    options.horizontalAxis?.showAxis,
  )

  const legendAvailableWidth = Math.max(0, containerWidth - (lpMargins.left ?? 50) - (lpMargins.right ?? 20))
  const legendSize = showLegend ? estimateLegendSize(legendNames, legendPos, legendAvailableWidth) : { width: 0, height: 0 }
  const legendH = showLegend ? legendSize.height + 15 : 0

  const marginOverrides: Record<string, number> = { ...lpMargins }
  if (showLegend && legendPos === 'top') {
    marginOverrides.top = legendH
  }
  if (showLegend && legendPos === 'bottom') {
    marginOverrides.bottom = (marginOverrides.bottom ?? 24) + legendH
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
    .paddingInner(resolveBarGapPadding(options.barGap))
    .paddingOuter(0.05)

  const categoryLabelOffset = useCategoryLabelLine ? categoryLabelLineHeight(y0.bandwidth()) : 0
  const barAreaHeight = Math.max(0, y0.bandwidth() - categoryLabelOffset)

  const y1 = d3.scaleBand<string>()
    .domain(seriesNames)
    .range([0, barAreaHeight])
    .padding(0.05)

  const [domainMin, domainMax] = computeLinearDomain(series.flatMap(s => s.values), options.horizontalAxis?.range, options.horizontalAxis?.scaleType)
  const x = (options.horizontalAxis?.scaleType === ScaleType.Log ? d3.scaleSymlog() : d3.scaleLinear())
    .domain([domainMin, domainMax])
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
        labelPosition: useCategoryLabelLine ? LabelPosition.Off : options.verticalAxis?.labelPosition,
        topPadding: margin.top,
      },
    },
    horizontal: { scale: x, height, options: { ...options.horizontalAxis, width } },
    order: 'horizontal-first',
  })

  // Clip group for bars — stable id per (container, key) so re-renders
  // re-use the same <clipPath> instead of accumulating new ones.
  const svg = chartArea.ownerSVGElement!
  const clipId = ensureClipPath(svg, container, 'bars', { x: 0, y: 0, width, height })
  const clippedGroup = d3.select(chartArea).append('g').attr('clip-path', `url(#${clipId})`)

  // Bar backgrounds — full-size rects behind each category group at low opacity
  if (options.barBackground) {
    const bgColor = (options.colors ?? DEFAULT_COLORS)[0]
    clippedGroup.selectAll<Element, string>('.bc-bar-bg')
      .data(sortedLabels, d => d)
      .enter()
      .append('rect')
      .attr('class', 'bc-bar-bg')
      .attr('x', 0)
      .attr('y', (d: string) => (y0(d) ?? 0) + categoryLabelOffset)
      .attr('width', width)
      .attr('height', y0.bandwidth() - categoryLabelOffset)
      .attr('fill', bgColor)
      .attr('opacity', 0.18)
  }

  // Bar separators — lines between adjacent category groups
  if (options.barSeparators && sortedLabels.length > 1) {
    const step = y0.step()
    for (let i = 1; i < sortedLabels.length; i++) {
      const yPos = (y0(sortedLabels[i - 1]) ?? 0) + y0.bandwidth() + (step - y0.bandwidth()) / 2
      clippedGroup.append('line')
        .attr('class', 'bc-bar-separator')
        .attr('x1', 0).attr('x2', width)
        .attr('y1', yPos).attr('y2', yPos)
        .attr('stroke', 'currentColor')
        .attr('opacity', 0.15)
    }
  }

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

  const highlightTargets = highlightTargetSet(options.highlights, flatData.map(d => d.seriesName))
  const colorOverrides = buildColorOverrides(options.colorizes)
  const orch = getSceneTransition(container)

  // Bars — one feature per (category, series) cell, keyed by label + seriesName.
  // Per-series color/opacity/highlight is folded into `attrs` so the orchestrator
  // tweens it on one clock. Captured prior bars are re-inserted into the layer so
  // the data-join matches them as updates and tweens x/y/width/height from the
  // prior scene's geometry.
  const barLayer = clippedGroup.append('g').node()!
  if (transition) {
    for (const el of priorBars) {
      // Clear transient styling so a highlight/opacity override that no longer
      // applies in the new scene doesn't persist on the re-used rect (the
      // featureJoin update path only sets attrs present in the new `attrs`).
      el.removeAttribute('opacity')
      el.removeAttribute('fill-opacity')
      barLayer.appendChild(el)
    }
  }
  featureJoin<GroupedBarDatum>(orch, {
    role: 'mark-per-cell',
    parent: barLayer,
    selector: '.bc-bar-grouped',
    data: flatData,
    key: d => d.label + '\0' + d.seriesName,
    insert: sel => sel.append('rect').attr('class', 'bc-bar bc-bar-grouped'),
    attrs: (d) => {
      const seriesColor = colorOverrides.get(d.seriesName) ?? resolveSeriesColor(d.seriesName, d.seriesIndex, colors, overrides)
      const seriesOpacity = resolveSeriesOpacity(d.seriesName, overrides)
      const base: Record<string, string | number> = {
        'data-series': d.seriesName,
        'x': x(0),
        'y': (y0(d.label) ?? 0) + categoryLabelOffset + (y1(d.seriesName) ?? 0),
        'width': Math.max(0, x(d.value) - x(0)),
        'height': y1.bandwidth(),
        'fill': seriesColor,
      }
      if (seriesOpacity < 1) {
        base['fill-opacity'] = seriesOpacity
      }
      if (highlightTargets.size > 0) {
        base.opacity = highlightOpacity(highlightTargets, d.seriesName)
      }
      return base
    },
  })

  // Frame-geometry tween: ease the plot origin (chart-area transform) + clip from
  // the prior scene's rect to the new one on the SAME orchestrator clock, so the
  // bars (above), axis and value labels move in lockstep. The bar rects resize via
  // their numeric x/y/width/height tweens (no `d`). Same-type only.
  const plotRect: PlotRect = { left: margin.left, top: margin.top, width, height }
  tweenPlotFrame(orch, {
    svg,
    clipId,
    group: chartArea,
    from: priorPlotRect,
    to: plotRect,
    active: transition && priorBars.length > 0,
  })

  // Plugins host — kept on the legacy D3Blueprint API. The draw is deferred into
  // the commit flush (when transitioning) so plugins bind after featureJoin has
  // created the `.bc-bar-grouped` marks, not before.
  const chart = createPluginHost(clippedGroup)
  if (options.tooltips) {
    chart.use(createTooltipPlugin({ numberFormat: options.verticalAxis?.numberFormat }))
  }
  if (options.crosshair) {
    chart.use(createCrosshairPlugin({
      width, height, direction: options.crosshairDirection, style: options.crosshairStyle, color: options.crosshairColor, orientation: Orientation.Horizontal,
    }))
  }

  const drawPlugins = () => chart.draw(flatData)
  if (orch.state === 'committing') {
    orch.register(drawPlugins)
  }
  else {
    drawPlugins()
  }
  setCachedChart(container, { chartType: 'bar-grouped', margin, plotRect })

  if (fadeOverlay) {
    fadeIn(clippedGroup.node()!)
    commitFadeOut(container, fadeOverlay)
  }

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

    if (!shouldRenderValueLabel({
      text: String(datum.value),
      placement: isInside ? 'inside' : 'outside',
      orientation: 'horizontal',
      barWidth,
      barHeight: y1.bandwidth(),
    })) {
      return
    }

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
      .attr('data-series', datum.seriesName)
      .attr('x', tx)
      .attr('y', cy)
      .attr('text-anchor', anchor)
      .attr('dominant-baseline', 'central')
      .attr('font-size', '11px')
      .attr('fill', fill)
      .text(String(datum.value))
  })

  // Legend
  if (showLegend && legendNames.length > 0) {
    const legendColors = legendNames.map((name) => {
      const idx = allSeries.findIndex(s => s.name === name)
      return resolveSeriesColor(name, idx, colors, overrides)
    })

    let xPos = 0
    let yPos = 0
    if (legendPos === 'top') {
      yPos = -(legendSize.height + 10)
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
    renderLegend(chartArea, legendNames, legendColors, yPos, legendPos, legendAnchor, width, height, xPos, [], { left: margin.left, right: margin.right })
  }
}
