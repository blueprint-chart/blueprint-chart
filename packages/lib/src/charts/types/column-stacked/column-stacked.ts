import * as d3 from 'd3'
import 'd3-transition'
import type { ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas, contentSize, labelPositionMargins, estimateVerticalLabelWidth, computeMarginDelta } from '../../canvas/canvas'
import { resolveHorizontalAxisBottom } from '../../axis/horizontal-axis'
import { AxisService } from '../../axis/axis-service'
import { renderLegend } from '../../legend/legend'
import { estimateLegendSize } from '../../legend/legend-size'
import { createAnnotationPlugin, snapshotAnnotations, type AnnotationSnapshot } from '../../plugins/annotations'
import { createTooltipPlugin } from '../../plugins/tooltip'
import { createCrosshairPlugin } from '../../plugins/crosshair'
import { resolveBackgroundColor } from '../../contrast'
import { resolveSeriesColor, isSeriesHidden, resolveSeriesValueLabels, resolveSeriesOpacity } from '../../series-helpers'
import { setRenderTransition, fadeIn, snapshotForFadeOut, commitFadeOut } from '../../motion'
import { setCachedChart, getCachedChart } from '../../transition-cache'
import { computeStack, computeStack100 } from '../../stack-helpers'
import { resolveBarGapPadding } from '../../scale-helpers'
import { highlightTargetSet, highlightOpacity } from '../../plugins/highlight'
import { buildColorOverrides } from '../../plugins/colorize'
import { ensureClipPath } from '../../clip-path-helper'
import { featureJoin, getSceneTransition, tweenPlotFrame, type PlotRect } from '../../../transitions'
import { createPluginHost } from '../../plugins/plugin-host'
import { StackMode } from '../../../enums'
import { percentValueLabel } from '../../format-helpers'
import { shouldRenderValueLabel } from '../../value-label-fit'

export const DEFAULT_COLORS = [
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
  setRenderTransition(transition)
  // Preserve existing data elements for smooth D3 data-join transitions
  let priorBars: Element[] = []
  let fadeOverlay: HTMLElement | null = null
  let priorAnnotations: Map<string, AnnotationSnapshot> | undefined
  let priorMargin: { top: number, left: number, right: number, bottom: number } | undefined
  let priorPlotRect: PlotRect | undefined
  const axes = AxisService.for(container)
  if (transition) {
    const cached = getCachedChart(container)
    priorMargin = cached?.margin
    priorPlotRect = cached?.plotRect
    axes.detach()
    if (cached?.chartType === 'column-stacked') {
      priorBars = Array.from(container.querySelectorAll('.bc-frame .bc-bar-stacked'))
    }
    else if (cached) {
      fadeOverlay = snapshotForFadeOut(container)
    }
    priorAnnotations = new Map()
    for (const el of container.querySelectorAll('.bc-frame .bc-annotations, .bc-frame .bc-annotations-range')) {
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
  // Build filtered data for stacking
  const filteredData: ChartData = { labels: data.labels, values: data.values, series }

  const isPercent = options.stackMode === StackMode.Percent
  const stacked = isPercent ? computeStack100(filteredData) : computeStack(filteredData)
  const flatData = flattenStack(stacked, data.labels, allSeries)

  const maxStackedValue = isPercent
    ? 100
    : d3.max(flatData, d => d.y1) ?? 0
  // Percent stacking puts a negative share below the baseline, so the value
  // axis has to reach down to it or the segment renders outside the plot.
  const minStackedValue = isPercent ? Math.min(0, d3.min(flatData, d => d.y0) ?? 0) : 0

  const allValues = [minStackedValue, maxStackedValue]
  const vLabelW = estimateVerticalLabelWidth(allValues, options.verticalAxis?.range, options.verticalAxis?.numberFormat, options.verticalAxis?.scaleType)
  const lpMargins = labelPositionMargins(containerWidth, options.verticalAxis?.labelPosition, options.horizontalAxis?.labelPosition, options.verticalAxis?.direction, vLabelW)

  // Extend bottom margin when x-axis labels will be rotated.
  const availableX = Math.max(0, containerWidth - (lpMargins.left ?? 50) - (lpMargins.right ?? 20))
  const rotatedBottom = resolveHorizontalAxisBottom(data.labels, availableX, options.horizontalAxis)
  if (rotatedBottom !== undefined) {
    lpMargins.bottom = rotatedBottom
  }

  const vLabelsInside = lpMargins.top != null
  const legendAvailableWidth = Math.max(0, containerWidth - (lpMargins.left ?? 50) - (lpMargins.right ?? 20))
  const legendSize = showLegend ? estimateLegendSize(seriesNames, legendPos, legendAvailableWidth) : { width: 0, height: 0 }
  const legendH = showLegend ? legendSize.height + 15 : 0
  const marginOverrides: Record<string, number> = { ...lpMargins }
  if (showLegend && legendPos === 'top') {
    const insideGap = vLabelsInside ? 15 : 0
    marginOverrides.top = legendH + insideGap
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

  const x = d3.scaleBand<string>()
    .domain(sortedLabels)
    .range([0, width])
    .padding(resolveBarGapPadding(options.barGap))

  const y = d3.scaleLinear()
    .domain([minStackedValue, maxStackedValue])
    .nice()
    .range([height, 0])

  axes.attach(chartArea, marginDelta)
  axes.update({
    vertical: { scale: y, height, options: { ...options.verticalAxis, gridWidth: width, topPadding: margin.top } },
    horizontal: { scale: x, height, options: { ...options.horizontalAxis, width } },
  })

  // Clip bars to the chart area — deterministic per (container, key) so
  // re-renders re-use the same <clipPath> instead of accumulating new ones.
  const svg = chartArea.ownerSVGElement!
  const clipId = ensureClipPath(svg, container, 'bars', { x: 0, y: 0, width, height })
  const clippedGroup = d3.select(chartArea).append('g').attr('clip-path', `url(#${clipId})`)

  // Re-order flatData to match sorted labels
  const sortedFlatData = sortedLabels === data.labels
    ? flatData
    : sortedLabels.flatMap(label => flatData.filter(d => d.label === label))

  const colorOverrides = buildColorOverrides(options.colorizes)
  const highlightTargets = highlightTargetSet(options.highlights, flatData.map(d => d.seriesName))
  const orch = getSceneTransition(container)

  // Bars — one feature per (category, series) segment, keyed by label + seriesName.
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
  featureJoin<StackedBarDatum>(orch, {
    role: 'mark-per-cell',
    parent: barLayer,
    selector: '.bc-bar-stacked',
    data: sortedFlatData,
    key: d => d.label + '\0' + d.seriesName,
    insert: sel => sel.append('rect').attr('class', 'bc-bar bc-bar-stacked'),
    attrs: (d) => {
      const seriesColor = colorOverrides.get(d.seriesName) ?? resolveSeriesColor(d.seriesName, d.seriesIndex, colors, overrides)
      const seriesOpacity = resolveSeriesOpacity(d.seriesName, overrides)
      const base: Record<string, string | number> = {
        'data-series': d.seriesName,
        'x': x(d.label) ?? 0,
        'y': y(d.y1),
        'width': x.bandwidth(),
        'height': y(d.y0) - y(d.y1),
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
  // their numeric x/y/width/height tweens (no `d`); combined with the origin ease
  // this keeps the x-axis baseline pinned. Same-type only.
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
  // created the `.bc-bar-stacked` marks, not before.
  const chart = createPluginHost(clippedGroup)
  if (options.tooltips) {
    chart.use(createTooltipPlugin({ numberFormat: options.verticalAxis?.numberFormat }))
  }
  if (options.crosshair) {
    chart.use(createCrosshairPlugin({
      width, height, direction: options.crosshairDirection, style: options.crosshairStyle, color: options.crosshairColor }))
  }
  if (options.annotations?.length) {
    const annotationData = data.labels.map((l, i) => ({
      label: l,
      value: series.reduce((sum, s) => sum + (s.values[i] ?? 0), 0),
    }))
    chart.use(createAnnotationPlugin(options.annotations, { scaleX: x, scaleY: y, data: annotationData, width, height, backgroundColor: resolveBackgroundColor(container), transition, priorAnnotations }))
  }
  const drawPlugins = () => chart.draw(sortedFlatData)
  if (orch.state === 'committing') {
    orch.register(drawPlugins)
  }
  else {
    drawPlugins()
  }
  setCachedChart(container, { chartType: 'column-stacked', margin, plotRect })

  if (fadeOverlay) {
    fadeIn(clippedGroup.node()!)
    commitFadeOut(container, fadeOverlay)
  }

  // Value labels
  const globalValueLabels = options.valueLabels ?? false
  const columnTotals = d3.rollup(sortedFlatData, vs => d3.max(vs, d => d.y1) ?? 0, d => d.label)
  const vlGroup = d3.select(chartArea).append('g').attr('class', 'bc-value-labels')
  sortedFlatData.forEach((datum) => {
    if (!resolveSeriesValueLabels(datum.seriesName, globalValueLabels, overrides)) {
      return
    }
    const cx = (x(datum.label) ?? 0) + x.bandwidth() / 2
    const segmentHeight = Math.abs(y(datum.y0) - y(datum.y1))
    const cy = y(datum.y0) - segmentHeight / 2
    const labelText = isPercent
      ? `${Math.round(datum.y0 < 0 ? -datum.value : datum.value)}%`
      : options.valueLabels === 'percent'
        ? percentValueLabel(datum.value, columnTotals.get(datum.label) ?? 0)
        : String(Math.round(datum.value * 100) / 100)
    if (!shouldRenderValueLabel({
      text: labelText,
      placement: 'inside',
      orientation: 'vertical',
      barWidth: x.bandwidth(),
      barHeight: segmentHeight,
    })) {
      return
    }
    vlGroup.append('text')
      .attr('class', 'bc-value-label')
      .attr('data-series', datum.seriesName)
      .attr('x', cx)
      .attr('y', cy)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '11px')
      .attr('fill', 'currentColor')
      .text(labelText)
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
      yPos = -(legendSize.height + 10 + insideGap)
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
    renderLegend(chartArea, seriesNames, legendColors, yPos, legendPos, legendAnchor, width, height, xPos, [], { left: margin.left, right: margin.right })
  }
}
