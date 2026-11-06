import * as d3 from 'd3'
import 'd3-transition'
import type { ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas, contentSize, labelPositionMargins, estimateScaleLabelWidth, computeMarginDelta, DEFAULT_MARGIN, DEFAULT_WIDTH, DEFAULT_HEIGHT } from '../../canvas/canvas'
import { AxisService } from '../../axis/axis-service'
import { resolveBackgroundColor } from '../../contrast'
import { ensureClipPath } from '../../clip-path-helper'
import { setRenderTransition, fadeIn, snapshotForFadeOut, commitFadeOut } from '../../motion'
import { getCachedChart, setCachedChart } from '../../transition-cache'
import { featureJoin, getSceneTransition, tweenPlotFrame, type PlotRect } from '../../../transitions'
import { resolveScatterMapping } from './mapping'
import { buildScatterPoints, type ScatterPoint } from './points'
import { buildScatterScale, fitRange } from './scales'
import { groupColors, type KeyConfig, renderScatterKey, scatterKeyWidth, sizeLegendValues } from './legend'
import { renderLegend } from '../../legend/legend'
import { estimateLegendSize } from '../../legend/legend-size'
import { DEFAULT_COLORS } from '../line-multi/line-multi'
import { AnnotationKind } from '../../../enums'
import { renderAnnotations, snapshotAnnotations, type AnnotationSnapshot } from '../../plugins/annotations'
import { buildColorOverrides } from '../../plugins/colorize'
import { highlightOpacity } from '../../plugins/highlight'
import { disposeProximityFor, setupProximityInteraction } from '../../plugins/proximity'
import { highlightedPointNames, resolvePointColor, splitColorOverrides } from './emphasis'
import { placePointLabels } from './labels'
import { formatScatterTooltip } from './tooltip'
import { isTrendMode, trendSegments } from './trend'

export const DEFAULT_COLOR = '#4e79a7'
export const DOT_RADIUS = 4.5
export const FILL_OPACITY = 0.7
const KEY_GAP = 16
const NARROW_THRESHOLD = 350
// Room for half a tick label, so the end gridlines' labels clear the legend.
const Y_EDGE_PAD = 8
const TREND_DASH = '6 4'
const TREND_WIDTH = 1.5
const OVERALL_TREND_OPACITY = 0.6
const LABEL_FONT_PX = 11

export function maxBubbleRadius(width: number, height: number): number {
  return Math.min(width, height) / 12
}

function legendX(position: string, legendWidth: number, plotWidth: number): number {
  if (position === 'left') {
    return -(legendWidth + 10)
  }
  return position === 'right' ? plotWidth + 10 : 0
}

function legendY(position: string, topHeight: number, legendH: number, plotHeight: number, marginBottom: number): number {
  if (position === 'top') {
    return -(topHeight + 10)
  }
  return position === 'bottom' ? plotHeight + Math.max(marginBottom - legendH, 0) : 0
}

function radiusScale(points: ScatterPoint[], width: number, height: number) {
  const maxSize = d3.max(points, p => p.size)
  if (maxSize === undefined) {
    return () => DOT_RADIUS
  }
  return d3.scaleSqrt().domain([0, maxSize]).range([0, maxBubbleRadius(width, height)])
}

function labelledPoints(points: ScatterPoint[], highlighted: Set<string>, options: ChartOptions): ScatterPoint[] {
  const annotated = new Set((options.annotations ?? []).flatMap(a => a.kind === AnnotationKind.Point ? [a.target] : []))
  const chosen = options.showLabels ? points : points.filter(p => highlighted.has(p.name) || annotated.has(p.name))
  const rank = (p: ScatterPoint) => (highlighted.has(p.name) ? 0 : 1)
  return d3.sort(chosen, (a, b) => rank(a) - rank(b) || (b.size ?? 0) - (a.size ?? 0))
}

export function render(
  container: HTMLElement,
  data: ChartData,
  options: ChartOptions = {},
  transition = false,
): void {
  setRenderTransition(transition)
  disposeProximityFor(container)
  const axes = AxisService.for(container)
  const cached = transition ? getCachedChart(container) : undefined
  let priorTrends: Element[] = []
  let priorPoints: Element[] = []
  let fadeOverlay: HTMLElement | null = null
  let priorAnnotations: Map<string, AnnotationSnapshot> | undefined
  if (transition) {
    axes.detach()
    if (cached?.chartType === 'scatter') {
      priorTrends = Array.from(container.querySelectorAll('.bc-frame .bc-trend-line'))
      priorPoints = Array.from(container.querySelectorAll('.bc-frame .bc-scatter-point'))
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

  const mapping = resolveScatterMapping(data, options)
  const scaleTypes = { x: options.horizontalAxis?.scaleType, y: options.verticalAxis?.scaleType }
  const { points } = buildScatterPoints(data, mapping, scaleTypes)
  const x = buildScatterScale(scaleTypes.x, points.map(p => p.x), options.horizontalAxis?.range)
  const y = buildScatterScale(scaleTypes.y, points.map(p => p.y), options.verticalAxis?.range)

  const { body } = createFrame(container, options.frame)
  const containerWidth = contentSize(body).width
  const yLabelWidth = estimateScaleLabelWidth(y, options.verticalAxis?.numberFormat)
  const margins = labelPositionMargins(containerWidth, options.verticalAxis?.labelPosition, options.horizontalAxis?.labelPosition, options.verticalAxis?.direction, yLabelWidth)
  const palette = options.colors ?? DEFAULT_COLORS
  const colors = groupColors(points, palette)
  const groupNames = [...colors.keys()]
  const showLegend = options.legend !== false && groupNames.length > 0
  const requestedPosition = options.legendPosition ?? 'top'
  const isSide = requestedPosition === 'left' || requestedPosition === 'right'
  const legendPos = containerWidth > 0 && containerWidth < NARROW_THRESHOLD && isSide ? 'top' : requestedPosition
  const legendAnchor = options.legendAnchor ?? 'start'
  const maxSize = d3.max(points, p => p.size)
  const keyContent: Omit<KeyConfig, 'radius'> = {
    sizeLabel: mapping.size,
    sizeValues: maxSize === undefined ? [] : sizeLegendValues(maxSize),
    trend: isTrendMode(options.trend),
  }
  const hasKey = keyContent.sizeValues.length > 0 || keyContent.trend
  const keyRadius = (plotWidth: number, plotHeight: number) => d3.scaleSqrt().domain([0, maxSize ?? 1]).range([0, maxBubbleRadius(plotWidth, plotHeight)])
  const frameWidth = containerWidth > 0 ? containerWidth : DEFAULT_WIDTH
  const frameHeight = contentSize(body).height || DEFAULT_HEIGHT
  const insideGap = margins.top != null ? 15 : 0
  const baseRight = margins.right ?? DEFAULT_MARGIN.right
  const marginOverrides: Partial<Record<'top' | 'left' | 'right' | 'bottom', number>> = { ...margins, right: baseRight }
  let legendSize = { width: 0, height: 0 }
  let legendH = 0
  let sideLegendWidth = 0
  // Legend rows, key width and plot size depend on each other: the legend wraps
  // at the plot width, the key's circles scale with the plot. A few passes settle them.
  for (let pass = 0; pass < 3; pass++) {
    const left = marginOverrides.left ?? DEFAULT_MARGIN.left
    const plotWidth = Math.max(0, frameWidth - left - marginOverrides.right!)
    legendSize = showLegend ? estimateLegendSize(groupNames, legendPos, plotWidth) : { width: 0, height: 0 }
    legendH = showLegend ? legendSize.height + 15 : 0
    if (showLegend && legendPos === 'top') {
      marginOverrides.top = legendH + insideGap
    }
    if (showLegend && legendPos === 'left') {
      marginOverrides.left = (margins.left ?? 50) + legendSize.width + 10
    }
    sideLegendWidth = showLegend && legendPos === 'right' ? legendSize.width + 10 : 0
    marginOverrides.bottom = Math.max(margins.bottom ?? 24, 24) + (showLegend && legendPos === 'bottom' ? legendH : 0)
    const plotHeight = frameHeight - (marginOverrides.top ?? DEFAULT_MARGIN.top) - marginOverrides.bottom
    const keyWidth = hasKey ? scatterKeyWidth({ ...keyContent, radius: keyRadius(plotWidth, plotHeight) }) : 0
    marginOverrides.right = sideLegendWidth + (hasKey ? KEY_GAP + keyWidth : baseRight)
  }
  const { chartArea, width, height, margin } = createCanvas(body, marginOverrides)
  const marginDelta = computeMarginDelta(cached?.margin, margin)

  const radiusOf = radiusScale(points, width, height)
  const radius = (p: ScatterPoint) => radiusOf(p.size ?? 0)
  x.range(fitRange(x, points.map(p => ({ value: p.x, r: radius(p) + 1 })), width))
  const [bottom, top] = fitRange(y, points.map(p => ({ value: p.y, r: radius(p) + 1 })), height, Y_EDGE_PAD)
  y.range([height - bottom, height - top])

  axes.attach(chartArea, marginDelta)
  axes.update({
    vertical: { scale: y, height, options: { ...options.verticalAxis, gridWidth: width, topPadding: margin.top } },
    horizontal: { scale: x, height, options: { ...options.horizontalAxis, width } },
  })

  const svg = chartArea.ownerSVGElement!
  const clipId = ensureClipPath(svg, container, 'plot', { x: 0, y: 0, width, height })
  const trendLayer = d3.select(chartArea).append('g').attr('clip-path', `url(#${clipId})`).node() as SVGGElement
  const pointLayer = d3.select(chartArea).append('g').attr('clip-path', `url(#${clipId})`).node() as SVGGElement
  trendLayer.append(...priorTrends)
  const drawOrder = d3.sort(points, p => -radius(p))
  const drawRank = new Map(drawOrder.map((p, i) => [p.name, i]))
  // featureJoin never reorders matched nodes, so they must already sit in the new largest-first order.
  pointLayer.append(...d3.sort(priorPoints, el => drawRank.get(el.getAttribute('data-key')!) ?? Infinity))

  const overrides = splitColorOverrides(points, buildColorOverrides(options.colorizes))
  const shownGroupColors = new Map(groupNames.map(g => [g, overrides.groups.get(g) ?? colors.get(g)!]))
  const highlighted = highlightedPointNames(points, (options.highlights ?? []).map(h => h.target))
  const color = (p: ScatterPoint) => resolvePointColor(p, overrides.points, shownGroupColors, DEFAULT_COLOR)
  const stroke = resolveBackgroundColor(container)
  const orch = getSceneTransition(container)
  const trend = isTrendMode(options.trend) ? trendSegments(points, options.trend, scaleTypes).segments : []
  featureJoin(orch, {
    role: 'series-line',
    parent: trendLayer,
    selector: '.bc-trend-line',
    data: trend,
    key: s => s.key,
    insert: sel => sel.append('path').attr('class', 'bc-trend-line').attr('data-key', s => s.key),
    attrs: s => ({
      'd': `M${x(s.x1)},${y(s.y1)}L${x(s.x2)},${y(s.y2)}`,
      'fill': 'none',
      'stroke': s.group === undefined ? 'currentColor' : shownGroupColors.get(s.group)!,
      'stroke-opacity': s.group === undefined ? OVERALL_TREND_OPACITY : 1,
      'stroke-width': TREND_WIDTH,
      'stroke-dasharray': TREND_DASH,
    }),
  })
  const pointAttrs = (p: ScatterPoint) => ({
    'cx': x(p.x),
    'cy': y(p.y),
    'r': radius(p),
    'fill': color(p),
    'fill-opacity': highlightOpacity(highlighted, p.name, FILL_OPACITY),
    'stroke': stroke,
    'stroke-width': 1,
    'opacity': 1,
  })
  featureJoin<ScatterPoint>(orch, {
    role: 'mark-per-category',
    parent: pointLayer,
    selector: '.bc-scatter-point',
    data: drawOrder,
    key: p => p.name,
    insert: sel => sel.append('circle').attr('class', 'bc-scatter-point').attr('data-key', p => p.name),
    attrs: pointAttrs,
    enterFrom: p => ({ ...pointAttrs(p), opacity: 0 }),
    exitTo: () => ({ opacity: 0 }),
  })

  const labelled = labelledPoints(points, highlighted, options)
  const labels = placePointLabels(labelled.map(p => ({ key: p.name, text: p.name, cx: x(p.x), cy: y(p.y), r: radius(p) })), { width, height }, LABEL_FONT_PX)
  // Outside the plot clip so a label near the edge is not sliced.
  d3.select(chartArea).append('g')
    .selectAll('text')
    .data(labels)
    .join('text')
    .attr('class', 'bc-point-label')
    .attr('data-key', l => l.key)
    .attr('x', l => l.x)
    .attr('y', l => l.y)
    .attr('text-anchor', l => l.anchor)
    .attr('dominant-baseline', 'central')
    .attr('font-size', LABEL_FONT_PX)
    .attr('fill', 'currentColor')
    .text(l => l.key)

  if (options.annotations?.length) {
    const annotationData = points.map(p => ({ label: p.name, value: p.y, x: p.x }))
    renderAnnotations(chartArea, options.annotations, { scaleX: x, scaleY: y, data: annotationData, width, height, backgroundColor: stroke, transition, priorAnnotations })
  }

  const plotRect: PlotRect = { left: margin.left, top: margin.top, width, height }
  tweenPlotFrame(orch, {
    svg,
    clipId,
    group: chartArea,
    from: cached?.chartType === 'scatter' ? cached.plotRect : undefined,
    to: plotRect,
    active: transition,
  })

  if (showLegend) {
    renderLegend(chartArea, groupNames, [...shownGroupColors.values()], legendY(legendPos, legendSize.height + insideGap, legendH, height, margin.bottom), legendPos, legendAnchor, width, height, legendX(legendPos, legendSize.width, width), [], { left: margin.left, right: margin.right })
  }

  const key = renderScatterKey(chartArea, { ...keyContent, radius: radiusOf })
  const drawnKeyWidth = scatterKeyWidth({ ...keyContent, radius: radiusOf })
  key?.setAttribute('transform', `translate(${Math.max(width + sideLegendWidth + KEY_GAP, width + margin.right - drawnKeyWidth)},${height})`)

  if (options.tooltips) {
    const formats = { x: options.horizontalAxis?.numberFormat, y: options.verticalAxis?.numberFormat }
    const proximityPoints = points.map(p => ({ cx: x(p.x), cy: y(p.y), label: formatScatterTooltip(p, mapping, formats), value: p.y, color: color(p) }))
    setupProximityInteraction(chartArea, {
      width,
      height,
      points: proximityPoints,
      nearest: 'xy',
      format: p => p.label,
      container,
    })
  }

  setCachedChart(container, { chartType: 'scatter', margin, plotRect })

  if (fadeOverlay) {
    fadeIn(trendLayer)
    fadeIn(pointLayer)
    commitFadeOut(container, fadeOverlay)
  }
}
