import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import type { ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas, contentSize, labelPositionMargins, estimateVerticalLabelWidth, computeMarginDelta } from '../../canvas/canvas'
import { resolveHorizontalAxisBottom } from '../../axis/horizontal-axis'
import { AxisService } from '../../axis/axis-service'
import { renderLegend } from '../../legend/legend'
import { estimateLegendSize } from '../../legend/legend-size'
import { computeLinearDomain, resolveBarGapPadding } from '../../scale-helpers'
import { createAnnotationPlugin, snapshotAnnotations, type AnnotationSnapshot } from '../../plugins/annotations'
import { createTooltipPlugin } from '../../plugins/tooltip'
import { createCrosshairPlugin } from '../../plugins/crosshair'
import { contrastTextColor, readableColor, resolveBackgroundColor } from '../../contrast'
import { resolveSeriesColor, isSeriesHidden, resolveSeriesValueLabels, resolveSeriesOpacity, resolveSeriesLabelMode } from '../../series-helpers'
import { setRenderTransition, fadeIn, snapshotForFadeOut, commitFadeOut } from '../../motion'
import { setCachedChart, getCachedChart } from '../../transition-cache'
import { ensureClipPath } from '../../clip-path-helper'
import { ValueLabelPosition, DirectLabelMode } from '../../../enums'
import { featureJoin, getSceneTransition, tweenFrameGeometry, type PlotRect } from '../../../transitions'
import { highlightTargetSet, highlightOpacity } from '../../plugins/highlight'
import { buildColorOverrides } from '../../plugins/colorize'

export const DEFAULT_COLORS = [
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
  initialize(): void {
    // Bars are rendered via featureJoin against the SceneTransition orchestrator
    // (see render()). This class is retained only as a host for legacy
    // plugins (tooltips, crosshair, annotations) that consume the D3Blueprint
    // API. Plugins will migrate to the orchestrator in Stages 3-4.
  }
}

export function render(
  container: HTMLElement,
  data: ChartData,
  options: ChartOptions = {},
  transition = false,
): void {
  setRenderTransition(transition)
  let fadeOverlay: HTMLElement | null = null
  let priorAnnotations: Map<string, AnnotationSnapshot> | undefined
  let priorMargin: { top: number, left: number, right: number, bottom: number } | undefined
  // Prior bar rects, re-inserted into the featureJoin layer so the data-join
  // matches them as updates: that gives the resize tween its "from" shape.
  let priorBars: Element[] = []
  const axes = AxisService.for(container)
  if (transition) {
    const cached = getCachedChart(container)
    priorMargin = cached?.margin
    axes.detach()
    if (cached?.chartType === 'bar-multi') {
      priorBars = Array.from(container.querySelectorAll('.bc-frame .bc-bar-multi'))
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

  // Determine global label mode early so margin calculations account for direct labels
  // 'auto' defers to legend when legend is explicitly true; explicit true/truthy forces direct
  const wantsDirect = options.directLabelling === true || (options.directLabelling === 'auto' && options.legend !== true) || (!!options.directLabelling && options.directLabelling !== 'auto')
  const globalLabelMode = wantsDirect ? 'direct' : (options.legend !== false ? 'legend' : 'none')

  // Compute margin adjustments for legend
  const showLegend = options.legend !== false && !wantsDirect
  const containerWidth = contentSize(body).width
  const NARROW_THRESHOLD = 350
  const requestedLegendPos = options.legendPosition ?? 'top'
  const legendPos = (containerWidth > 0 && containerWidth < NARROW_THRESHOLD && (requestedLegendPos === 'left' || requestedLegendPos === 'right'))
    ? 'top'
    : requestedLegendPos
  const legendAnchor = options.legendAnchor ?? 'start'
  const allValues = series.flatMap(s => s.values)
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
  // eslint-disable-next-line prefer-const
  let [domainMin, domainMax] = computeLinearDomain(allValues, options.verticalAxis?.range, options.verticalAxis?.scaleType)
  // Extend domain to leave room for value labels below negative bars
  if (options.valueLabels && domainMin < 0 && options.verticalAxis?.range?.min == null) {
    const span = domainMax - domainMin
    domainMin -= span * 0.1
  }

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
    .padding(resolveBarGapPadding(options.barGap))

  const x1 = d3.scaleBand<string>()
    .domain(seriesNames)
    .range([0, x0.bandwidth()])
    .padding(0.05)

  const useLog = options.verticalAxis?.scaleType === 'log'
  const y = useLog
    ? d3.scaleSymlog().domain([domainMin, domainMax]).nice().range([height, 0])
    : d3.scaleLinear().domain([domainMin, domainMax]).nice().range([height, 0])

  axes.attach(chartArea, marginDelta)
  axes.update({
    vertical: { scale: y, height, options: { ...options.verticalAxis, gridWidth: width, topPadding: margin.top } },
    horizontal: { scale: x0, height, options: { ...options.horizontalAxis, width } },
  })

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

  // Clip bars to the chart area so they truncate at axis boundaries.
  // Stable id per (container, key) keeps <defs> from growing on re-renders.
  const svg = chartArea.ownerSVGElement!
  const clipId = ensureClipPath(svg, container, 'bars', { x: 0, y: 0, width, height })
  const clippedGroup = d3.select(chartArea).append('g').attr('clip-path', `url(#${clipId})`)

  const orch = getSceneTransition(container)
  const highlightTargets = highlightTargetSet(options.highlights)
  const colorOverrides = buildColorOverrides(options.colorizes)

  // Bars — one feature per (category, series) cell, keyed by label + seriesName.
  const barLayer = clippedGroup.append('g').node()!
  // Re-insert prior bars (with their bound data) so the data-join matches them
  // as updates and tweens x/y/width/height from the prior scene's geometry.
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
  featureJoin<MultiBarDatum>(orch, {
    role: 'mark-per-cell',
    parent: barLayer,
    selector: '.bc-bar-multi',
    data: flatData,
    key: d => `${d.label}\0${d.seriesName}`,
    insert: sel => sel.append('rect').attr('class', 'bc-bar bc-bar-multi'),
    attrs: (d) => {
      const seriesColor = resolveSeriesColor(d.seriesName, d.seriesIndex, colors, overrides)
      const seriesOpacity = resolveSeriesOpacity(d.seriesName, overrides)
      const base: Record<string, string | number> = {
        'data-series': d.seriesName,
        'x': (x0(d.label) ?? 0) + (x1(d.series) ?? 0),
        'y': Math.min(y(0), y(d.value)),
        'width': x1.bandwidth(),
        'height': Math.abs(y(d.value) - y(0)),
        'fill': colorOverrides.get(d.seriesName) ?? seriesColor,
      }
      if (seriesOpacity < 1) {
        base['fill-opacity'] = seriesOpacity
      }
      return highlightTargets.size > 0
        ? { ...base, opacity: highlightOpacity(highlightTargets, d.seriesName) }
        : base
    },
  })

  // Frame-geometry tween: ease the plot origin (chart-area transform) + clip from
  // the prior scene's rect to the new one on the SAME orchestrator clock, so the
  // bars (above), axis and value labels move in lockstep. The bar rects resize via
  // their numeric x/y/width/height tweens (no `d`); combined with the origin ease
  // this keeps the x-axis baseline pinned. Same-type only.
  if (transition && priorMargin && priorBars.length > 0) {
    const pm = priorMargin
    const totalW = width + margin.left + margin.right
    const totalH = height + margin.top + margin.bottom
    const priorRect: PlotRect = {
      left: pm.left,
      top: pm.top,
      width: totalW - pm.left - pm.right,
      height: totalH - pm.top - pm.bottom,
    }
    const newRect: PlotRect = { left: margin.left, top: margin.top, width, height }
    const clipRect = svg.querySelector(`#${clipId} rect`) as SVGRectElement | null
    tweenFrameGeometry(orch, { group: chartArea, clipRect, from: priorRect, to: newRect })
  }

  // Plugins host — kept on the legacy D3Blueprint path. Mounting on
  // clippedGroup so plugins find the `.bc-bar-multi` elements that featureJoin
  // just inserted under barLayer.
  const chart = new BarMultiChart(clippedGroup)
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
      value: Math.max(...series.map(s => s.values[i] ?? 0)),
    }))
    chart.use(createAnnotationPlugin(options.annotations, { scaleX: x0, scaleY: y, data: annotationData, width, height, backgroundColor: resolveBackgroundColor(container), transition, priorAnnotations }))
  }
  chart.draw(flatData)
  setCachedChart(container, { chartType: 'bar-multi', margin })

  if (fadeOverlay) {
    fadeIn(clippedGroup.node()!)
    commitFadeOut(container, fadeOverlay)
  }

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
    : (options.directLabelling ? DirectLabelMode.Auto : DirectLabelMode.Off)
  const dlAnchor = options.directLabelAnchor ?? 'middle'

  // Resolve value label position
  const vlPos = options.valueLabelPosition ?? ValueLabelPosition.Auto
  function resolveVlMode(): ValueLabelPosition.Inside | ValueLabelPosition.Outside {
    if (vlPos === ValueLabelPosition.Inside) {
      return ValueLabelPosition.Inside
    }
    if (vlPos === ValueLabelPosition.Outside) {
      return ValueLabelPosition.Outside
    }
    // auto: outside by default
    return ValueLabelPosition.Outside
  }

  function resolveBarDlMode(_barHeight: number): ValueLabelPosition.Inside | ValueLabelPosition.Outside {
    if (dlMode === DirectLabelMode.Inside) {
      return ValueLabelPosition.Inside
    }
    if (dlMode === DirectLabelMode.Outside) {
      return ValueLabelPosition.Outside
    }
    // auto: match value label position when value labels are enabled
    if (globalValueLabels) {
      return resolveVlMode()
    }
    // auto: outside by default
    return ValueLabelPosition.Outside
  }

  function insideLabelY(barTop: number, barHeight: number, anchor: string): number {
    if (anchor === 'start') {
      return barTop + 12
    }
    if (anchor === 'end') {
      return barTop + barHeight - 4
    }
    return barTop + barHeight / 2 // middle
  }

  // Per-series value labels
  const vlGroup = d3.select(chartArea).append('g').attr('class', 'bc-value-labels')
  flatData.forEach((datum) => {
    if (!resolveSeriesValueLabels(datum.seriesName, globalValueLabels, overrides)) {
      return
    }
    const cx = (x0(datum.label) ?? 0) + (x1(datum.series) ?? 0) + x1.bandwidth() / 2
    const barTop = Math.min(y(0), y(datum.value))
    const barHeight = Math.abs(y(datum.value) - y(0))
    const vlMode = resolveVlMode()
    const hasDl = hasAnyDirectLabels && directLabelSet.has(datum.seriesName)

    const isNegative = datum.value < 0
    const barBottom = barTop + barHeight
    let cy: number
    let fill: string
    let baseline: string
    if (vlMode === ValueLabelPosition.Inside) {
      const barColor = resolveSeriesColor(datum.seriesName, datum.seriesIndex, colors, overrides)
      fill = contrastTextColor(barColor)
      baseline = 'central'
      // When direct labels are also inside, offset below the direct label
      const dlIsInside = hasDl && resolveBarDlMode(barHeight) === ValueLabelPosition.Inside
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
      if (isNegative) {
        // Place below the bar for negative values
        const dlIsOutside = hasDl && resolveBarDlMode(barHeight) === ValueLabelPosition.Outside
        cy = dlIsOutside ? barBottom + 16 : barBottom + 4
        baseline = 'hanging'
      }
      else {
        // Place above the bar for positive values
        const dlIsOutside = hasDl && resolveBarDlMode(barHeight) === ValueLabelPosition.Outside
        cy = dlIsOutside ? barTop - 16 : barTop - 4
        baseline = 'auto'
      }
    }

    vlGroup.append('text')
      .attr('class', 'bc-value-label')
      .attr('data-series', datum.seriesName)
      .attr('x', cx)
      .attr('y', cy)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', baseline)
      .attr('font-size', '11px')
      .attr('fill', fill)
      .text(String(datum.value))
  })

  // Direct labels — mode-aware positioning
  flatData.forEach((datum) => {
    if (!directLabelSet.has(datum.seriesName)) {
      return
    }
    const cx = (x0(datum.label) ?? 0) + (x1(datum.series) ?? 0) + x1.bandwidth() / 2
    const barTop = Math.min(y(0), y(datum.value))
    const barHeight = Math.abs(y(datum.value) - y(0))
    const labelText = overrides?.find(o => o.name === datum.seriesName)?.labelText || datum.seriesName
    const mode = resolveBarDlMode(barHeight)
    const barColor = resolveSeriesColor(datum.seriesName, datum.seriesIndex, colors, overrides)

    const labelEl = d3.select(chartArea)
      .append('text')
      .attr('class', 'bc-direct-label')
      .attr('data-series', datum.seriesName)
      .attr('x', cx)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .text(labelText)

    if (mode === ValueLabelPosition.Inside) {
      const ly = insideLabelY(barTop, barHeight, dlAnchor)
      labelEl
        .attr('y', ly)
        .attr('fill', contrastTextColor(barColor))
      if (dlAnchor === 'middle') {
        labelEl.attr('dominant-baseline', 'central')
      }
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
    renderLegend(chartArea, legendSeriesNames, legendColors, yPos, legendPos, legendAnchor, width, height, xPos, [], { left: margin.left, right: margin.right })
  }
}
