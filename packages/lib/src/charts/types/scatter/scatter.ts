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

export const DEFAULT_COLOR = '#4e79a7'
export const DOT_RADIUS = 4.5
export const FILL_OPACITY = 0.7

export function maxBubbleRadius(width: number, height: number): number {
  return Math.min(width, height) / 12
}

function radiusScale(points: ScatterPoint[], width: number, height: number) {
  const maxSize = d3.max(points, p => p.size)
  if (maxSize === undefined) {
    return { maxRadius: DOT_RADIUS, radius: () => DOT_RADIUS }
  }
  const maxRadius = maxBubbleRadius(width, height)
  const scale = d3.scaleSqrt().domain([0, maxSize]).range([0, maxRadius])
  return { maxRadius, radius: (p: ScatterPoint) => scale(p.size ?? 0) }
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
  const { chartArea, width, height, margin } = createCanvas(body, margins)
  const marginDelta = computeMarginDelta(cached?.margin, margin)

  const { maxRadius, radius } = radiusScale(points, width, height)
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

  const color = options.colors?.[0] ?? DEFAULT_COLOR
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
      'fill': color,
      'fill-opacity': FILL_OPACITY,
      'stroke': stroke,
      'stroke-width': 1,
    }),
  })

  const plotRect: PlotRect = { left: margin.left, top: margin.top, width, height }
  tweenPlotFrame(orch, {
    svg,
    clipId,
    group: chartArea,
    from: cached?.chartType === 'scatter' ? cached.plotRect : undefined,
    to: plotRect,
    active: transition,
  })

  setCachedChart(container, { chartType: 'scatter', margin, plotRect })
}
