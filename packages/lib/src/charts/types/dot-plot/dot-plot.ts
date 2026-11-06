import * as d3 from 'd3'
import 'd3-transition'
import type { ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas, contentSize, labelPositionMargins, estimateCategoryLabelWidth, computeMarginDelta } from '../../canvas/canvas'
import { AxisService } from '../../axis/axis-service'
import { renderLegend } from '../../legend/legend'
import { estimateLegendSize } from '../../legend/legend-size'
import { resolveBackgroundColor } from '../../contrast'
import { ensureClipPath } from '../../clip-path-helper'
import { expandColorsToSeries } from '../../series-helpers'
import { setRenderTransition, snapshotForFadeOut, commitFadeOut, fadeIn } from '../../motion'
import { setCachedChart, getCachedChart } from '../../transition-cache'
import { featureJoin, getSceneTransition, tweenPlotFrame, type PlotRect } from '../../../transitions'
import { LabelPosition } from '../../../enums'
import { CATEGORY_LABEL_HEIGHT, categoryLabelLineHeight, categoryLabelsNeedTheirOwnLine } from '../../category-label-line'
import { buildScatterScale } from '../scatter/scales'
import { DEFAULT_COLORS } from '../line-multi/line-multi'
import { resolveDotPlotMapping } from './mapping'
import { buildDotPlotRows, sortDotPlotRows, type DotPlotRow } from './rows'

export const DEFAULT_COLOR = '#4e79a7'
export const DOT_RADIUS = 5
const RANGE_FILL_OPACITY = 0.25
const LINE_STROKE_OPACITY = 0.4
const LINE_WIDTH = 2
const NARROW_THRESHOLD = 350

interface DotDatum { row: string, column: string, value: number, color: string }

export function render(
  container: HTMLElement,
  data: ChartData,
  options: ChartOptions = {},
  transition = false,
): void {
  setRenderTransition(transition)
  const axes = AxisService.for(container)
  const cached = transition ? getCachedChart(container) : undefined
  let fadeOverlay: HTMLElement | null = null
  if (transition) {
    axes.detach()
    if (cached) {
      fadeOverlay = snapshotForFadeOut(container)
    }
    container.replaceChildren()
  }

  const resolved = resolveDotPlotMapping(data, { low: options.low, high: options.high })
  const scaleType = options.horizontalAxis?.scaleType
  const built = buildDotPlotRows(data, resolved, scaleType)
  const rows = sortDotPlotRows(built.rows, options.sortMode, resolved.mode)
  const columns = resolved.values
  const isDumbbell = resolved.mode === 'dumbbell'
  const palette = expandColorsToSeries(options.colors ?? DEFAULT_COLORS, columns.length)
  const columnColor = (i: number) => isDumbbell ? palette[i] : options.colors?.[0] ?? DEFAULT_COLOR

  const { body } = createFrame(container, options.frame)
  const containerWidth = contentSize(body).width
  const showLegend = options.legend !== false && isDumbbell
  const requestedPosition = options.legendPosition ?? 'top'
  const isSide = requestedPosition === 'left' || requestedPosition === 'right'
  const legendPos = containerWidth > 0 && containerWidth < NARROW_THRESHOLD && isSide ? 'top' : requestedPosition
  const legendAnchor = options.legendAnchor ?? 'start'

  const autoNarrow = categoryLabelsNeedTheirOwnLine(containerWidth, options.verticalAxis?.labelPosition)
  const useCategoryLabelLine = options.categoryLabelLine === true || autoNarrow
  const lpMargins = labelPositionMargins(
    containerWidth,
    useCategoryLabelLine ? LabelPosition.Off : options.verticalAxis?.labelPosition,
    options.horizontalAxis?.labelPosition,
    options.verticalAxis?.direction,
    estimateCategoryLabelWidth(data.labels),
    options.horizontalAxis?.showAxis,
  )
  const legendAvailableWidth = Math.max(0, containerWidth - (lpMargins.left ?? 50) - (lpMargins.right ?? 20))
  const legendSize = showLegend ? estimateLegendSize(columns, legendPos, legendAvailableWidth) : { width: 0, height: 0 }
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
  const marginDelta = computeMarginDelta(cached?.margin, margin)

  const y = d3.scaleBand<string>().domain(rows.map(r => r.name)).range([0, height]).paddingInner(0.3).paddingOuter(0.05)
  const categoryLabelOffset = useCategoryLabelLine ? categoryLabelLineHeight(y.bandwidth()) : 0
  const rowY = (name: string) => (y(name) ?? 0) + categoryLabelOffset + (y.bandwidth() - categoryLabelOffset) / 2
  const allNumbers = rows.flatMap(r => [...r.values, ...(r.low === undefined ? [] : [r.low, r.high!])])
  const x = buildScatterScale(scaleType, allNumbers, options.horizontalAxis?.range).range([0, width])

  axes.attach(chartArea, marginDelta)
  axes.update({
    vertical: {
      scale: y,
      height,
      options: {
        ...options.verticalAxis,
        labelPosition: useCategoryLabelLine ? LabelPosition.Off : options.verticalAxis?.labelPosition,
        topPadding: margin.top,
        ...(autoNarrow ? { showAxis: false } : {}),
      },
    },
    horizontal: { scale: x, height, options: { ...options.horizontalAxis, width } },
    order: 'horizontal-first',
  })

  const svg = chartArea.ownerSVGElement!
  const clipId = ensureClipPath(svg, container, 'plot', { x: 0, y: 0, width, height })
  const plotLayer = d3.select(chartArea).append('g').attr('clip-path', `url(#${clipId})`)
  const layer = () => plotLayer.append('g').node()!
  const rangeLayer = layer()
  const lineLayer = layer()
  const dotLayer = layer()
  const stroke = resolveBackgroundColor(container)
  const orch = getSceneTransition(container)

  const rangeRows = rows.filter(r => r.low !== undefined)
  featureJoin<DotPlotRow>(orch, {
    role: 'mark-per-category',
    parent: rangeLayer,
    selector: '.bc-dot-range',
    data: rangeRows,
    key: r => r.name,
    insert: sel => sel.append('rect').attr('class', 'bc-dot-range').attr('data-key', r => r.name),
    attrs: r => ({
      'x': x(r.low!),
      'y': rowY(r.name) - DOT_RADIUS,
      'width': Math.max(0, x(r.high!) - x(r.low!)),
      'height': DOT_RADIUS * 2,
      'rx': DOT_RADIUS,
      'fill': columnColor(0),
      'fill-opacity': RANGE_FILL_OPACITY,
      'opacity': 1,
    }),
  })

  const lineRows = isDumbbell ? rows : []
  featureJoin<DotPlotRow>(orch, {
    role: 'series-line',
    parent: lineLayer,
    selector: '.bc-dot-line',
    data: lineRows,
    key: r => r.name,
    insert: sel => sel.append('path').attr('class', 'bc-dot-line').attr('data-key', r => r.name),
    attrs: (r) => {
      const [start, tip] = d3.extent(r.values).map(v => x(v!))
      const cy = rowY(r.name)
      return {
        'd': `M${start},${cy}L${tip},${cy}M${tip},${cy}L${tip},${cy}L${tip},${cy}`,
        'fill': 'none',
        'stroke': 'currentColor',
        'stroke-opacity': LINE_STROKE_OPACITY,
        'stroke-width': LINE_WIDTH,
        'opacity': 1,
      }
    },
  })

  const dots: DotDatum[] = rows.flatMap(r => columns.map((column, i) => ({ row: r.name, column, value: r.values[i], color: columnColor(i) })))
  featureJoin<DotDatum>(orch, {
    role: 'mark-per-cell',
    parent: dotLayer,
    selector: '.bc-dot',
    data: dots,
    key: d => `${d.row}|${d.column}`,
    insert: sel => sel.append('circle').attr('class', 'bc-dot').attr('data-key', d => `${d.row}|${d.column}`),
    attrs: d => ({
      'data-series': d.column,
      'cx': x(d.value),
      'cy': rowY(d.row),
      'r': DOT_RADIUS,
      'fill': d.color,
      'stroke': stroke,
      'stroke-width': 1,
      'opacity': 1,
    }),
  })

  if (useCategoryLabelLine) {
    const labelGroup = d3.select(chartArea).append('g').attr('class', 'bc-category-labels')
    for (const r of rows) {
      labelGroup.append('text')
        .attr('class', 'bc-category-label')
        .attr('x', 2)
        .attr('y', (y(r.name) ?? 0) + CATEGORY_LABEL_HEIGHT / 2)
        .attr('text-anchor', 'start')
        .attr('dominant-baseline', 'central')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .attr('fill', 'currentColor')
        .text(r.name)
    }
  }

  const plotRect: PlotRect = { left: margin.left, top: margin.top, width, height }
  tweenPlotFrame(orch, { svg, clipId, group: chartArea, from: cached?.plotRect, to: plotRect, active: false })

  if (showLegend) {
    const legendX = legendPos === 'left' ? -(legendSize.width + 10) : legendPos === 'right' ? width + 10 : 0
    const legendY = legendPos === 'top' ? -(legendSize.height + 10) : legendPos === 'bottom' ? height + 25 : 0
    renderLegend(chartArea, columns, palette, legendY, legendPos, legendAnchor, width, height, legendX, [], { left: margin.left, right: margin.right })
  }

  setCachedChart(container, { chartType: 'dot-plot', margin, plotRect })

  if (fadeOverlay) {
    fadeIn(plotLayer.node()!)
    commitFadeOut(container, fadeOverlay)
  }
}
