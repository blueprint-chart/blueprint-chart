import * as d3 from 'd3'
import 'd3-transition'
import type { ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas, contentSize, labelPositionMargins, estimateScaleLabelWidth, computeMarginDelta } from '../../canvas/canvas'
import { AxisService } from '../../axis/axis-service'
import { resolveBackgroundColor } from '../../contrast'
import { ensureClipPath } from '../../clip-path-helper'
import { setRenderTransition } from '../../motion'
import { getCachedChart, setCachedChart } from '../../transition-cache'
import { featureJoin, getSceneTransition, tweenPlotFrame, type PlotRect } from '../../../transitions'
import { resolveScatterMapping } from './mapping'
import { buildScatterPoints, type ScatterPoint } from './points'
import { buildScatterScale } from './scales'
import { groupColors, type KeyConfig, renderScatterKey, scatterKeyWidth, sizeLegendValues } from './legend'
import { renderLegend } from '../../legend/legend'
import { estimateLegendSize } from '../../legend/legend-size'
import { DEFAULT_COLORS } from '../line-multi/line-multi'
import { AnnotationKind } from '../../../enums'
import { renderAnnotations } from '../../plugins/annotations'
import { buildColorOverrides } from '../../plugins/colorize'
import { highlightOpacity } from '../../plugins/highlight'
import { highlightedPointNames, resolvePointColor } from './emphasis'
import { placePointLabels } from './labels'

export const DEFAULT_COLOR = '#4e79a7'
export const DOT_RADIUS = 4.5
export const FILL_OPACITY = 0.7
const KEY_GAP = 10
const NARROW_THRESHOLD = 350
const TREND_MODES = ['overall', 'per-group']
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
    return { maxRadius: DOT_RADIUS, radiusOf: () => DOT_RADIUS }
  }
  const maxRadius = maxBubbleRadius(width, height)
  return { maxRadius, radiusOf: d3.scaleSqrt().domain([0, maxSize]).range([0, maxRadius]) }
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
  const axes = AxisService.for(container)
  const cached = transition ? getCachedChart(container) : undefined
  if (transition) {
    axes.detach()
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
  const legendAvailableWidth = Math.max(0, containerWidth - (margins.left ?? 50) - (margins.right ?? 20))
  const legendSize = showLegend ? estimateLegendSize(groupNames, legendPos, legendAvailableWidth) : { width: 0, height: 0 }
  const legendH = showLegend ? legendSize.height + 15 : 0
  const insideGap = margins.top != null ? 15 : 0
  const maxSize = d3.max(points, p => p.size)
  const keyContent: Omit<KeyConfig, 'radius'> = {
    sizeLabel: mapping.size,
    sizeValues: maxSize === undefined ? [] : sizeLegendValues(maxSize),
    trend: TREND_MODES.includes(options.trend ?? ''),
  }
  const keyBoundRadius = maxBubbleRadius(containerWidth, contentSize(body).height || containerWidth)
  const keyWidth = scatterKeyWidth({ ...keyContent, radius: d3.scaleSqrt().domain([0, maxSize ?? 1]).range([0, keyBoundRadius]) })
  const hasKey = keyContent.sizeValues.length > 0 || keyContent.trend
  const marginOverrides: Partial<Record<'top' | 'left' | 'right' | 'bottom', number>> = { ...margins }
  if (showLegend && legendPos === 'top') {
    marginOverrides.top = legendH + insideGap
  }
  if (showLegend && legendPos === 'left') {
    marginOverrides.left = (margins.left ?? 50) + legendSize.width + 10
  }
  const sideLegendWidth = showLegend && legendPos === 'right' ? legendSize.width + 10 : 0
  marginOverrides.right = (margins.right ?? 20) + sideLegendWidth + (hasKey ? keyWidth + KEY_GAP : 0)
  marginOverrides.bottom = Math.max(margins.bottom ?? 24, 24) + (showLegend && legendPos === 'bottom' ? legendH : 0)
  const { chartArea, width, height, margin } = createCanvas(body, marginOverrides)
  const marginDelta = computeMarginDelta(cached?.margin, margin)

  const { maxRadius, radiusOf } = radiusScale(points, width, height)
  const radius = (p: ScatterPoint) => radiusOf(p.size ?? 0)
  const inset = maxRadius + 1
  x.range([inset, width - inset])
  y.range([height - inset, inset])

  axes.attach(chartArea, marginDelta)
  axes.update({
    vertical: { scale: y, height, options: { ...options.verticalAxis, gridWidth: width, topPadding: margin.top } },
    horizontal: { scale: x, height, options: { ...options.horizontalAxis, width } },
  })

  const svg = chartArea.ownerSVGElement!
  const clipId = ensureClipPath(svg, container, 'plot', { x: 0, y: 0, width, height })
  const pointLayer = d3.select(chartArea).append('g').attr('clip-path', `url(#${clipId})`).node() as SVGGElement

  const overrides = buildColorOverrides(options.colorizes)
  const highlighted = highlightedPointNames(points, (options.highlights ?? []).map(h => h.target))
  const color = (p: ScatterPoint) => resolvePointColor(p, overrides, colors, DEFAULT_COLOR)
  const stroke = resolveBackgroundColor(container)
  const orch = getSceneTransition(container)
  featureJoin<ScatterPoint>(orch, {
    role: 'mark-per-category',
    parent: pointLayer,
    selector: '.bc-scatter-point',
    data: d3.sort(points, p => -radius(p)),
    key: p => p.name,
    insert: sel => sel.append('circle').attr('class', 'bc-scatter-point').attr('data-key', p => p.name),
    attrs: p => ({
      'cx': x(p.x),
      'cy': y(p.y),
      'r': radius(p),
      'fill': color(p),
      'fill-opacity': highlightOpacity(highlighted, p.name, FILL_OPACITY),
      'stroke': stroke,
      'stroke-width': 1,
    }),
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
    renderAnnotations(chartArea, options.annotations, { scaleX: x, scaleY: y, data: annotationData, width, height, backgroundColor: stroke, transition })
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
    renderLegend(chartArea, groupNames, groupNames.map(g => overrides.get(g) ?? colors.get(g)!), legendY(legendPos, legendSize.height + insideGap, legendH, height, margin.bottom), legendPos, legendAnchor, width, height, legendX(legendPos, legendSize.width, width), [], { left: margin.left, right: margin.right })
  }

  const key = renderScatterKey(chartArea, { ...keyContent, radius: radiusOf })
  key?.setAttribute('transform', `translate(${width + sideLegendWidth + KEY_GAP},${height})`)

  setCachedChart(container, { chartType: 'scatter', margin, plotRect })
}
