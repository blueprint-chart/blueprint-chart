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
import { groupColors, renderScatterKey, sizeLegendValues } from './legend'
import { renderLegend } from '../../legend/legend'
import { estimateLegendSize } from '../../legend/legend-size'
import { DEFAULT_COLORS } from '../line-multi/line-multi'

export const DEFAULT_COLOR = '#4e79a7'
export const DOT_RADIUS = 4.5
export const FILL_OPACITY = 0.7
const KEY_INSET = 8
const TREND_MODES = ['overall', 'per-group']

export function maxBubbleRadius(width: number, height: number): number {
  return Math.min(width, height) / 12
}

function radiusScale(points: ScatterPoint[], width: number, height: number) {
  const maxSize = d3.max(points, p => p.size)
  if (maxSize === undefined) {
    return { maxSize, maxRadius: DOT_RADIUS, radiusOf: () => DOT_RADIUS }
  }
  const maxRadius = maxBubbleRadius(width, height)
  return { maxSize, maxRadius, radiusOf: d3.scaleSqrt().domain([0, maxSize]).range([0, maxRadius]) }
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
  const legendWidth = Math.max(0, containerWidth - (margins.left ?? 50) - (margins.right ?? 20))
  const legendSize = showLegend ? estimateLegendSize(groupNames, 'top', legendWidth) : { width: 0, height: 0 }
  const insideGap = margins.top != null ? 15 : 0
  const marginOverrides = showLegend ? { ...margins, top: legendSize.height + 15 + insideGap } : margins
  const { chartArea, width, height, margin } = createCanvas(body, marginOverrides)
  const marginDelta = computeMarginDelta(cached?.margin, margin)

  const { maxSize, maxRadius, radiusOf } = radiusScale(points, width, height)
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

  const color = (p: ScatterPoint) => (p.group && colors.get(p.group)) || DEFAULT_COLOR
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

  if (showLegend) {
    renderLegend(chartArea, groupNames, groupNames.map(g => colors.get(g)!), -(legendSize.height + 10 + insideGap), 'top', 'start', width, height, 0, [], { left: margin.left, right: margin.right })
  }

  const key = renderScatterKey(chartArea, {
    sizeLabel: mapping.size,
    sizeValues: maxSize === undefined ? [] : sizeLegendValues(maxSize),
    radius: radiusOf,
    trend: TREND_MODES.includes(options.trend ?? ''),
  })
  key?.setAttribute('transform', `translate(${width - KEY_INSET - Math.max(maxRadius * 2 + 36, 90)},${height - KEY_INSET})`)

  setCachedChart(container, { chartType: 'scatter', margin, plotRect })
}
