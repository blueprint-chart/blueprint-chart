import * as d3 from 'd3'
import 'd3-transition'
import type { ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas, contentSize, labelPositionMargins, estimateCategoryLabelWidth, computeMarginDelta } from '../../canvas/canvas'
import { AxisService } from '../../axis/axis-service'
import { renderLegend } from '../../legend/legend'
import { estimateLegendSize } from '../../legend/legend-size'
import { createAnnotationPlugin, snapshotAnnotations, type AnnotationSnapshot } from '../../plugins/annotations'
import { createTooltipPlugin } from '../../plugins/tooltip'
import { createCrosshairPlugin } from '../../plugins/crosshair'
import { resolveBackgroundColor } from '../../contrast'
import { percentValueLabel } from '../../format-helpers'
import { resolveSeriesColor, isSeriesHidden, resolveSeriesValueLabels, resolveSeriesOpacity } from '../../series-helpers'
import { contrastTextColor } from '../../contrast'
import { setRenderTransition, fadeIn, snapshotForFadeOut, commitFadeOut } from '../../motion'
import { setCachedChart, getCachedChart } from '../../transition-cache'
import { computeStack, computeStack100 } from '../../stack-helpers'
import { resolveBarGapPadding } from '../../scale-helpers'
import { ensureClipPath } from '../../clip-path-helper'
import { featureJoin, getSceneTransition, tweenPlotFrame, type PlotRect } from '../../../transitions'
import { createPluginHost } from '../../plugins/plugin-host'
import { StackMode, Orientation, ValueLabelPosition, LabelPosition } from '../../../enums'
import { highlightTargetSet, highlightOpacity } from '../../plugins/highlight'
import { buildColorOverrides } from '../../plugins/colorize'
import { shouldRenderValueLabel } from '../../value-label-fit'
import { CATEGORY_LABEL_HEIGHT, categoryLabelLineHeight } from '../../category-label-line'

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
    if (cached?.chartType === 'bar-stacked') {
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

  const useCategoryLabelLine = options.categoryLabelLine === true
  const vLabelW = estimateCategoryLabelWidth(data.labels)
  const effectiveVLabelPosition = useCategoryLabelLine ? LabelPosition.Off : options.verticalAxis?.labelPosition
  const lpMargins = labelPositionMargins(containerWidth, effectiveVLabelPosition, options.horizontalAxis?.labelPosition, options.verticalAxis?.direction, vLabelW, options.horizontalAxis?.showAxis)

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

  const x = d3.scaleLinear()
    .domain([0, maxStackedValue])
    .nice()
    .range([0, width])

  const y = d3.scaleBand<string>()
    .domain(sortedLabels)
    .range([0, height])
    .padding(resolveBarGapPadding(options.barGap))

  axes.attach(chartArea, marginDelta)
  axes.update({
    horizontal: { scale: x, height, options: { ...options.horizontalAxis, width } },
    vertical: {
      scale: y,
      height,
      options: {
        ...options.verticalAxis,
        labelPosition: useCategoryLabelLine ? LabelPosition.Off : options.verticalAxis?.labelPosition,
        topPadding: margin.top,
      },
    },
    order: 'horizontal-first',
  })

  // Clip bars to the chart area — deterministic per container so re-renders
  // re-use the same <clipPath> instead of accumulating new ones in <defs>.
  const svg = chartArea.ownerSVGElement!
  const clipId = ensureClipPath(svg, container, 'bars', { x: 0, y: 0, width, height })
  const clippedGroup = d3.select(chartArea).append('g').attr('clip-path', `url(#${clipId})`)

  // Re-order flatData to match sorted labels
  const sortedFlatData = sortedLabels === data.labels
    ? flatData
    : sortedLabels.flatMap(label => flatData.filter(d => d.label === label))

  const categoryLabelOffset = useCategoryLabelLine ? categoryLabelLineHeight(y.bandwidth()) : 0
  const colorOverrides = buildColorOverrides(options.colorizes)
  const highlightTargets = highlightTargetSet(options.highlights)
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
        'x': x(d.y0),
        'y': (y(d.label) ?? 0) + categoryLabelOffset,
        'width': x(d.y1) - x(d.y0),
        'height': Math.max(0, y.bandwidth() - categoryLabelOffset),
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
  // created the `.bc-bar-stacked` marks, not before.
  const chart = createPluginHost(clippedGroup)
  if (options.tooltips) {
    chart.use(createTooltipPlugin({ numberFormat: options.verticalAxis?.numberFormat }))
  }
  if (options.crosshair) {
    chart.use(createCrosshairPlugin({
      width, height, direction: options.crosshairDirection, style: options.crosshairStyle, color: options.crosshairColor, orientation: Orientation.Horizontal }))
  }
  if (options.annotations?.length) {
    const annotationData = data.labels.map((l, i) => ({
      label: l,
      value: series.reduce((sum, s) => sum + (s.values[i] ?? 0), 0),
    }))
    chart.use(createAnnotationPlugin(options.annotations, { scaleX: y, scaleY: x, data: annotationData, width, height, backgroundColor: resolveBackgroundColor(container), orientation: Orientation.Horizontal, transition, priorAnnotations }))
  }
  const drawPlugins = () => chart.draw(sortedFlatData)
  if (orch.state === 'committing') {
    orch.register(drawPlugins)
  }
  else {
    drawPlugins()
  }
  setCachedChart(container, { chartType: 'bar-stacked', margin, plotRect })

  if (fadeOverlay) {
    fadeIn(clippedGroup.node()!)
    commitFadeOut(container, fadeOverlay)
  }

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

  // Value labels
  const globalValueLabels = options.valueLabels ?? false
  const valueLabelPos = options.valueLabelPosition ?? ValueLabelPosition.Auto

  // Pre-compute per-row segment info for label placement decisions.
  const lastSegmentKeys = new Set<string>()
  const nextSegWidthPx = new Map<string, number>()
  for (const label of sortedLabels) {
    const rowData = sortedFlatData
      .filter(d => d.label === label)
      .sort((a, b) => a.y1 - b.y1)
    if (rowData.length > 0) {
      const last = rowData[rowData.length - 1]
      lastSegmentKeys.add(last.label + '\0' + last.seriesName)
      for (let i = 0; i < rowData.length - 1; i++) {
        const key = rowData[i].label + '\0' + rowData[i].seriesName
        nextSegWidthPx.set(key, x(rowData[i + 1].y1) - x(rowData[i].y1))
      }
    }
  }

  // Track the rightmost label extent per row to prevent outside-label overlap
  const labelEndByRow = new Map<string, number>()

  const columnTotals = d3.rollup(sortedFlatData, vs => d3.max(vs, d => d.y1) ?? 0, d => d.label)

  const vlGroup = d3.select(chartArea).append('g').attr('class', 'bc-value-labels')
  sortedFlatData.forEach((datum) => {
    if (!resolveSeriesValueLabels(datum.seriesName, globalValueLabels, overrides)) {
      return
    }

    const labelText = isPercent
      ? `${Math.round(datum.value)}%`
      : options.valueLabels === 'percent'
        ? percentValueLabel(datum.value, columnTotals.get(datum.label) ?? 0)
        : String(Math.round(datum.value * 100) / 100)
    const segmentWidth = x(datum.y1) - x(datum.y0)
    const estimatedLabelWidth = labelText.length * 6.5 + 8
    const fitsInside = segmentWidth >= estimatedLabelWidth
    const cy = (y(datum.label) ?? 0) + categoryLabelOffset + (y.bandwidth() - categoryLabelOffset) / 2
    const seriesColor = resolveSeriesColor(datum.seriesName, datum.seriesIndex, colors, overrides)
    const isLastInRow = lastSegmentKeys.has(datum.label + '\0' + datum.seriesName)

    const placeOutside = valueLabelPos === ValueLabelPosition.Outside
      || (valueLabelPos === ValueLabelPosition.Auto && !fitsInside && isLastInRow)

    const fitsGeometry = shouldRenderValueLabel({
      text: labelText,
      placement: placeOutside ? 'outside' : 'inside',
      orientation: 'horizontal',
      barWidth: segmentWidth,
      barHeight: y.bandwidth(),
    })

    // Helper: create a hidden label inside the segment (revealed on legend highlight)
    const appendHiddenLabel = () => {
      const cx = x(datum.y0) + segmentWidth / 2
      vlGroup.append('text')
        .attr('class', 'bc-value-label')
        .attr('data-series', datum.seriesName)
        .attr('opacity', 0)
        .attr('x', cx)
        .attr('y', cy)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-size', '11px')
        .attr('fill', contrastTextColor(seriesColor))
        .text(labelText)
    }

    if (placeOutside) {
      // `placeOutside` already excludes Inside; this branch is defensive for future logic changes.
      if ((valueLabelPos as ValueLabelPosition) === ValueLabelPosition.Inside) {
        appendHiddenLabel()
      }
      else {
        const labelStartX = x(datum.y1) + 4
        const prevEnd = labelEndByRow.get(datum.label) ?? 0
        const nextWidth = nextSegWidthPx.get(datum.label + '\0' + datum.seriesName)
        const overlaps = labelStartX < prevEnd
        const overflows = nextWidth !== undefined && estimatedLabelWidth + 4 > nextWidth
        // Symmetric guard for the last segment: outside labels there have no
        // following segment, so `nextWidth` is undefined; instead verify the
        // label end stays inside the chart's right edge (incl. right margin).
        const rightLimit = width + margin.right - 2
        const exceedsRight = labelStartX + estimatedLabelWidth > rightLimit
        if (overlaps || overflows || exceedsRight || !fitsGeometry) {
          appendHiddenLabel()
        }
        else {
          labelEndByRow.set(datum.label, labelStartX + estimatedLabelWidth)
          vlGroup.append('text')
            .attr('class', 'bc-value-label')
            .attr('data-series', datum.seriesName)
            .attr('x', labelStartX)
            .attr('y', cy)
            .attr('text-anchor', 'start')
            .attr('dominant-baseline', 'central')
            .attr('font-size', '11px')
            .attr('fill', 'currentColor')
            .text(labelText)
        }
      }
    }
    else {
      if (!fitsInside || !fitsGeometry) {
        appendHiddenLabel()
      }
      else {
        const cx = x(datum.y0) + segmentWidth / 2
        vlGroup.append('text')
          .attr('class', 'bc-value-label')
          .attr('data-series', datum.seriesName)
          .attr('x', cx)
          .attr('y', cy)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('font-size', '11px')
          .attr('fill', contrastTextColor(seriesColor))
          .text(labelText)
      }
    }
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
