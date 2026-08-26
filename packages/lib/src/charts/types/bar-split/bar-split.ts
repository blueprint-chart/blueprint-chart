import * as d3 from 'd3'
import 'd3-transition'
import type { AxisOptions, ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas, contentSize, labelPositionMargins, estimateCategoryLabelWidth, computeMarginDelta } from '../../canvas/canvas'
import { AxisService } from '../../axis/axis-service'
import { renderHorizontalAxis } from '../../axis/horizontal-axis'
import { renderLegend } from '../../legend/legend'
import { estimateLegendSize } from '../../legend/legend-size'
import { contrastTextColor, resolveBackgroundColor } from '../../contrast'
import { createAnnotationPlugin, snapshotAnnotations, type AnnotationSnapshot } from '../../plugins/annotations'
import { expandColorsToSeries, seriesOrImplicit, resolveSeriesColor, isSeriesHidden, resolveSeriesValueLabels, resolveSeriesOpacity } from '../../series-helpers'
import { setRenderTransition, fadeIn, snapshotForFadeOut, commitFadeOut } from '../../motion'
import { setCachedChart, getCachedChart } from '../../transition-cache'
import { createTooltipPlugin } from '../../plugins/tooltip'
import { createCrosshairPlugin } from '../../plugins/crosshair'
import { computeLinearDomain, resolveBarGapPadding } from '../../scale-helpers'
import { ensureClipPath } from '../../clip-path-helper'
import { featureJoin, getSceneTransition, tweenPlotFrame, type PlotRect } from '../../../transitions'
import { createPluginHost } from '../../plugins/plugin-host'
import { Orientation, ValueLabelPosition, LabelPosition, ScaleType } from '../../../enums'
import { highlightTargetSet, highlightOpacity } from '../../plugins/highlight'
import { buildColorOverrides } from '../../plugins/colorize'
import { shouldRenderValueLabel } from '../../value-label-fit'
import { CATEGORY_LABEL_HEIGHT, categoryLabelLineHeight, categoryLabelsNeedTheirOwnLine } from '../../category-label-line'

export const DEFAULT_COLORS = [
  '#4e79a7', '#f28e2b', '#e15759', '#76b7b2',
  '#59a14f', '#edc948', '#b07aa1', '#ff9da7',
]

const PANEL_GAP = 16
const PANEL_HEADER_HEIGHT = 20

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

interface PanelLayout {
  seriesName: string
  seriesIndex: number
  xOffset: number
  panelWidth: number
  xScale: d3.ScaleContinuousNumeric<number, number>
}

function computePanels(
  series: { name: string, values: number[] }[],
  allSeries: { name: string, values: number[] }[],
  totalWidth: number,
  sharedScale: boolean,
  axis?: AxisOptions,
): PanelLayout[] {
  const n = series.length
  if (n === 0) {
    return []
  }
  const panelWidth = Math.max(0, (totalWidth - (n - 1) * PANEL_GAP) / n)
  const sharedValues = sharedScale ? series.flatMap(s => s.values) : []

  return series.map((s, i) => {
    const [domainMin, domainMax] = computeLinearDomain(sharedScale ? sharedValues : s.values, axis?.range, axis?.scaleType)
    const xScale = (axis?.scaleType === ScaleType.Log ? d3.scaleSymlog() : d3.scaleLinear())
      .domain([domainMin, domainMax])
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
  let priorMargin: { top: number, left: number, right: number, bottom: number } | undefined
  let priorPlotRect: PlotRect | undefined
  let priorAnnotations: Map<string, AnnotationSnapshot> | undefined
  const axes = AxisService.for(container)

  if (transition) {
    const cached = getCachedChart(container)
    priorMargin = cached?.margin
    priorPlotRect = cached?.plotRect
    axes.detach()
    if (cached?.chartType === 'bar-split') {
      priorBars = Array.from(container.querySelectorAll('.bc-frame .bc-bar-split'))
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

  // Below a phone width the left gutter cannot hold the category labels, so
  // they move above their bars the way bar-horizontal already does.
  const autoNarrow = categoryLabelsNeedTheirOwnLine(containerWidth, options.verticalAxis?.labelPosition)
  const useCategoryLabelLine = options.categoryLabelLine === true || autoNarrow
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

  // Reserve space for panel headers above the chart area
  lpMargins.top = (lpMargins.top ?? 12) + PANEL_HEADER_HEIGHT

  const legendAvailableWidth = Math.max(0, containerWidth - (lpMargins.left ?? 50) - (lpMargins.right ?? 20))
  const legendSize = showLegend ? estimateLegendSize(legendNames, legendPos, legendAvailableWidth) : { width: 0, height: 0 }
  const legendH = showLegend ? legendSize.height + 15 : 0

  const marginOverrides: Record<string, number> = { ...lpMargins }
  if (showLegend && legendPos === 'top') {
    marginOverrides.top = legendH + PANEL_HEADER_HEIGHT
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

  const y = d3.scaleBand<string>()
    .domain(sortedLabels)
    .range([0, height])
    .padding(resolveBarGapPadding(options.barGap))

  const categoryLabelOffset = useCategoryLabelLine ? categoryLabelLineHeight(y.bandwidth()) : 0

  // Vertical axis only (category labels on the left)
  axes.attach(chartArea, marginDelta)
  axes.update({
    vertical: {
      scale: y,
      height,
      options: {
        ...options.verticalAxis,
        labelPosition: useCategoryLabelLine ? LabelPosition.Off : options.verticalAxis?.labelPosition,
        topPadding: margin.top,
        // Inline labels replace the gutter, so the gutter's axis line goes too.
        ...(autoNarrow ? { showAxis: false } : {}),
      },
    },
    order: 'horizontal-first',
  })

  const sharedScale = options.sharedScale === true
  const panels = computePanels(series, allSeries, width, sharedScale, options.horizontalAxis)

  // Value axis — one per panel, since each panel has its own value scale. The
  // per-type registry defaults (axis off, grid none, labels off) come through
  // `options.horizontalAxis`, so a chart that asks for none of them gets an
  // empty axis group, as it did before there was an axis at all.
  const axisGroup = d3.select(chartArea).append('g').attr('class', 'bc-split-axes')
  for (const panel of panels) {
    const panelArea = axisGroup.append('g')
      .attr('transform', `translate(${panel.xOffset},0)`)
      .node()!
    renderHorizontalAxis(panelArea, panel.xScale, height, { ...options.horizontalAxis, width: panel.panelWidth })
  }

  // Clip group for bars — stable id per (container, key) so re-renders
  // re-use the same <clipPath> instead of accumulating new ones.
  const svg = chartArea.ownerSVGElement!
  const clipId = ensureClipPath(svg, container, 'bars', { x: 0, y: 0, width, height })
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
  featureJoin<SplitBarDatum>(orch, {
    role: 'mark-per-cell',
    parent: barLayer,
    selector: '.bc-bar-split',
    data: flatData,
    key: d => d.label + '\0' + d.seriesName,
    insert: sel => sel.append('rect').attr('class', 'bc-bar bc-bar-split'),
    attrs: (d) => {
      const seriesColor = colorOverrides.get(d.seriesName) ?? resolveSeriesColor(d.seriesName, d.seriesIndex, colors, overrides)
      const seriesOpacity = resolveSeriesOpacity(d.seriesName, overrides)
      const base: Record<string, string | number> = {
        'data-series': d.seriesName,
        'x': d.xPos,
        'y': (y(d.label) ?? 0) + categoryLabelOffset,
        'width': d.barWidth,
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
  // created the `.bc-bar-split` marks, not before.
  const chart = createPluginHost(clippedGroup)
  if (options.tooltips) {
    chart.use(createTooltipPlugin({ numberFormat: options.verticalAxis?.numberFormat }))
  }
  if (options.crosshair) {
    chart.use(createCrosshairPlugin({
      width, height, direction: options.crosshairDirection, style: options.crosshairStyle, color: options.crosshairColor, orientation: Orientation.Horizontal,
    }))
  }

  if (options.annotations?.length && panels.length > 0) {
    // Every panel repeats the same categories, so an annotation targets the
    // leftmost panel: the one a reader starts from, and the only one whose
    // value scale is known before the annotation names a series.
    const firstPanel = panels[0]
    const firstSeries = series.find(s => s.name === firstPanel.seriesName)
    const annotationData = data.labels.map((l, i) => ({ label: l, value: firstSeries?.values[i] ?? 0 }))
    chart.use(createAnnotationPlugin(options.annotations, { scaleX: y, scaleY: firstPanel.xScale, data: annotationData, width, height, backgroundColor: resolveBackgroundColor(container), orientation: Orientation.Horizontal, transition, priorAnnotations }))
  }

  const drawPlugins = () => chart.draw(flatData)
  if (orch.state === 'committing') {
    orch.register(drawPlugins)
  }
  else {
    drawPlugins()
  }
  setCachedChart(container, { chartType: 'bar-split', margin, plotRect })

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

    if (!shouldRenderValueLabel({
      text: String(datum.value),
      placement: isInside ? 'inside' : 'outside',
      orientation: 'horizontal',
      barWidth: datum.barWidth,
      barHeight,
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
      yPos = -(legendSize.height + 10 + PANEL_HEADER_HEIGHT)
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
