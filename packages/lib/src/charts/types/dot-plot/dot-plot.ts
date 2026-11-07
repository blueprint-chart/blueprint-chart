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
import { setupProximityInteraction, disposeProximityFor } from '../../plugins/proximity'
import { highlightTargetSet, highlightOpacity } from '../../plugins/highlight'
import { buildColorOverrides } from '../../plugins/colorize'
import { renderAnnotations, snapshotAnnotations, type AnnotationSnapshot } from '../../plugins/annotations'
import { formatValueLabel } from '../../format-helpers'
import { measureMaxTextWidth } from '../../text-measure'
import { setCachedChart, getCachedChart } from '../../transition-cache'
import { featureJoin, getSceneTransition, tweenPlotFrame, type PlotRect } from '../../../transitions'
import { ArrowDirection, LabelPosition } from '../../../enums'
import { CATEGORY_LABEL_HEIGHT, categoryLabelLineHeight, categoryLabelsNeedTheirOwnLine } from '../../category-label-line'
import { buildScatterScale } from '../scatter/scales'
import { DEFAULT_COLORS } from '../../palettes'
import { resolveDotPlotMapping, type DotPlotMode } from './mapping'
import { formatDotPlotTooltip } from './tooltip'
import { buildDotPlotRows, sortDotPlotRows, type DotPlotRow } from './rows'
import { dotPlotAnnotationContext } from './annotations'

export const DEFAULT_COLOR = DEFAULT_COLORS[0]
export const DOT_RADIUS = 5
const RANGE_FILL_OPACITY = 0.25
const LINE_STROKE_OPACITY = 0.4
const LINE_WIDTH = 2
const NARROW_THRESHOLD = 350
const ARROW_SIZE = 5
const LABEL_GAP = 6
const LABEL_FONT_SIZE = 11

interface DotDatum { row: string, column: string, value: number, color: string }
interface LabelDatum { key: string, row: string, series?: string, text: string, x: number, anchor: 'start' | 'end' }

export function render(
  container: HTMLElement,
  data: ChartData,
  options: ChartOptions = {},
  transition = false,
): void {
  disposeProximityFor(container)
  setRenderTransition(transition)
  const axes = AxisService.for(container)
  const cached = transition ? getCachedChart(container) : undefined
  const prior = { ranges: [] as Element[], lines: [] as Element[], dots: [] as Element[], labels: [] as Element[] }
  let fadeOverlay: HTMLElement | null = null
  const priorAnnotations = new Map<string, AnnotationSnapshot>()
  if (transition) {
    axes.detach()
    if (cached?.chartType === 'dot-plot') {
      prior.ranges = Array.from(container.querySelectorAll('.bc-frame .bc-dot-range'))
      prior.lines = Array.from(container.querySelectorAll('.bc-frame .bc-dot-line'))
      prior.dots = Array.from(container.querySelectorAll('.bc-frame .bc-dot'))
      prior.labels = Array.from(container.querySelectorAll('.bc-frame .bc-dot-label'))
    }
    else if (cached) {
      fadeOverlay = snapshotForFadeOut(container)
    }
    for (const el of container.querySelectorAll('.bc-frame .bc-annotations, .bc-frame .bc-annotations-range')) {
      for (const [k, v] of snapshotAnnotations(el)) {
        priorAnnotations.set(k, v)
      }
    }
    container.replaceChildren()
  }

  const resolved = resolveDotPlotMapping(data, { dotStyle: options.dotStyle, low: options.low, high: options.high })
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
  const fmt = (v: number) => formatValueLabel(v, options.horizontalAxis?.numberFormat)
  const labelRoom = options.valueLabels ? labelRoomFor(rows, resolved.mode, fmt, width) : 0
  const x = buildScatterScale(scaleType, allNumbers, options.horizontalAxis?.range).range([isDumbbell ? labelRoom : 0, width - labelRoom])

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
  rangeLayer.append(...prior.ranges)
  lineLayer.append(...prior.lines)
  dotLayer.append(...prior.dots)
  const stroke = resolveBackgroundColor(container)
  const orch = getSceneTransition(container)
  const targets = highlightTargetSet(options.highlights, rows.map(r => r.name))
  const opacityOf = (row: string) => highlightOpacity(targets, row)
  const colorOverrides = buildColorOverrides(options.colorizes)

  const rangeRows = rows.filter(r => r.low !== undefined)
  const rangeAttrs = (r: DotPlotRow) => ({
    'x': Math.min(x(r.low!), x(r.high!)),
    'y': rowY(r.name) - DOT_RADIUS,
    'width': Math.abs(x(r.high!) - x(r.low!)),
    'height': DOT_RADIUS * 2,
    'rx': DOT_RADIUS,
    'fill': colorOverrides.get(r.name) ?? columnColor(0),
    'fill-opacity': RANGE_FILL_OPACITY,
    'opacity': opacityOf(r.name),
  })
  featureJoin<DotPlotRow>(orch, {
    role: 'mark-per-category',
    parent: rangeLayer,
    selector: '.bc-dot-range',
    data: rangeRows,
    key: r => r.name,
    insert: sel => sel.append('rect').attr('class', 'bc-dot-range').attr('data-key', r => r.name),
    attrs: rangeAttrs,
    enterFrom: r => ({ ...rangeAttrs(r), opacity: 0 }),
    exitTo: () => ({ opacity: 0 }),
  })

  const lineRows = isDumbbell ? rows : []
  const lineAttrs = (r: DotPlotRow) => {
    const [start, end] = d3.extent(r.values).map(v => x(v!))
    const cy = rowY(r.name)
    const dir = Math.sign(r.values.at(-1)! - r.values[0])
    const arrows = options.arrows ?? ArrowDirection.None
    const head = arrowhead(dir > 0 ? end : start, dir, arrows === ArrowDirection.Forward || arrows === ArrowDirection.Both)
    const tail = arrowhead(dir > 0 ? start : end, -dir, arrows === ArrowDirection.Backward || arrows === ArrowDirection.Both)
    return {
      'd': `M${start},${cy}L${end},${cy}${arrowheadPath(head, cy)}${arrowheadPath(tail, cy)}`,
      'fill': 'none',
      'stroke': 'currentColor',
      'stroke-opacity': LINE_STROKE_OPACITY,
      'stroke-width': LINE_WIDTH,
      'opacity': opacityOf(r.name),
    }
  }
  featureJoin<DotPlotRow>(orch, {
    role: 'series-line',
    parent: lineLayer,
    selector: '.bc-dot-line',
    data: lineRows,
    key: r => r.name,
    insert: sel => sel.append('path').attr('class', 'bc-dot-line').attr('data-key', r => r.name),
    attrs: lineAttrs,
    enterFrom: r => ({ ...lineAttrs(r), opacity: 0 }),
    exitTo: () => ({ opacity: 0 }),
  })

  const dots: DotDatum[] = rows.flatMap(r => columns.map((column, i) => ({ row: r.name, column, value: r.values[i], color: columnColor(i) })))
  const dotAttrs = (d: DotDatum) => ({
    'data-series': d.column,
    'cx': x(d.value),
    'cy': rowY(d.row),
    'r': DOT_RADIUS,
    'fill': colorOverrides.get(d.row) ?? d.color,
    'stroke': stroke,
    'stroke-width': 1,
    'opacity': opacityOf(d.row),
  })
  featureJoin<DotDatum>(orch, {
    role: 'mark-per-cell',
    parent: dotLayer,
    selector: '.bc-dot',
    data: dots,
    key: d => `${d.row}\0${d.column}`,
    insert: sel => sel.append('circle').attr('class', 'bc-dot').attr('data-key', d => `${d.row}|${d.column}`),
    attrs: dotAttrs,
    enterFrom: d => ({ ...dotAttrs(d), opacity: 0 }),
    exitTo: () => ({ opacity: 0 }),
  })

  const labelLayer = d3.select(chartArea).append('g').node()!
  labelLayer.append(...prior.labels)
  const labels = options.valueLabels ? buildLabels(rows, columns, resolved.mode, x, fmt) : []
  renderValueLabels(orch, labelLayer, labels, rowY, opacityOf)

  if (options.annotations?.length) {
    renderAnnotations(chartArea, options.annotations, { ...dotPlotAnnotationContext(rows, x, y, rowY), width, height, backgroundColor: stroke, transition, priorAnnotations })
  }

  if (options.tooltips) {
    const tooltipByRow = new Map(rows.map(r => [r.name, formatDotPlotTooltip(r, resolved, options.horizontalAxis?.numberFormat)]))
    setupProximityInteraction(chartArea, {
      width,
      height,
      points: dots.map(d => ({ cx: x(d.value), cy: rowY(d.row), label: tooltipByRow.get(d.row)!, value: d.value, color: colorOverrides.get(d.row) ?? d.color, r: DOT_RADIUS })),
      nearest: 'xy',
      format: p => p.label,
      container,
    })
  }

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
  tweenPlotFrame(orch, { svg, clipId, group: chartArea, from: cached?.chartType === 'dot-plot' ? cached.plotRect : undefined, to: plotRect, active: transition })

  if (showLegend) {
    const legendX = legendPos === 'left' ? -(legendSize.width + 10) : legendPos === 'right' ? width + 10 : 0
    const legendY = legendPos === 'top' ? -(legendSize.height + 10) : legendPos === 'bottom' ? height + 25 : 0
    renderLegend(chartArea, columns, palette, legendY, legendPos, legendAnchor, width, height, legendX, [], { left: margin.left, right: margin.right })
  }

  setCachedChart(container, { chartType: 'dot-plot', margin, plotRect })

  if (fadeOverlay) {
    fadeIn(plotLayer.node()!)
    fadeIn(labelLayer)
    commitFadeOut(container, fadeOverlay)
  }
}

function labelRoomFor(rows: DotPlotRow[], mode: DotPlotMode, fmt: (v: number) => string, width: number): number {
  const texts = rows.flatMap(r => r.values).map(fmt)
  const room = measureMaxTextWidth(texts, LABEL_FONT_SIZE) + LABEL_GAP + (mode === 'range' ? 0 : DOT_RADIUS)
  return Math.min(room, width / 4)
}

function arrowhead(edgeX: number, direction: number, enabled: boolean) {
  const dir = enabled ? direction : 0
  const tipX = edgeX - dir * DOT_RADIUS
  return { tipX, armX: tipX - dir * ARROW_SIZE, armOffset: dir === 0 ? 0 : ARROW_SIZE }
}

function arrowheadPath({ tipX, armX, armOffset }: ReturnType<typeof arrowhead>, cy: number) {
  return `M${armX},${cy - armOffset}L${tipX},${cy}L${armX},${cy + armOffset}`
}

function buildLabels(
  rows: DotPlotRow[],
  columns: string[],
  mode: DotPlotMode,
  x: (v: number) => number,
  fmt: (v: number) => string,
): LabelDatum[] {
  return rows.flatMap((r): LabelDatum[] => {
    if (mode === 'range') {
      return [{ key: `${r.name}|range`, row: r.name, text: fmt(r.values[0]), x: Math.max(x(r.low!), x(r.high!)) + LABEL_GAP, anchor: 'start' }]
    }
    const order = columns.map((_, i) => i).sort((a, b) => r.values[a] - r.values[b])
    const ends = order.length > 1 ? [order[0], order.at(-1)!] : order
    return ends.map((i, n): LabelDatum => {
      const left = ends.length > 1 && n === 0
      return {
        key: `${r.name}|${columns[i]}`,
        row: r.name,
        series: columns[i],
        text: fmt(r.values[i]),
        x: x(r.values[i]) + (left ? -1 : 1) * (DOT_RADIUS + LABEL_GAP),
        anchor: left ? 'end' : 'start',
      }
    })
  })
}

function renderValueLabels(
  orch: ReturnType<typeof getSceneTransition>,
  parent: SVGGElement,
  labels: LabelDatum[],
  rowY: (name: string) => number,
  opacityOf: (row: string) => number,
): void {
  const labelAttrs = (l: LabelDatum) => ({
    ...(l.series ? { 'data-series': l.series } : {}),
    'x': l.x,
    'y': rowY(l.row),
    'text-anchor': l.anchor,
    'fill': 'currentColor',
    'opacity': opacityOf(l.row),
  })
  featureJoin<LabelDatum>(orch, {
    role: 'value-label',
    parent,
    selector: '.bc-dot-label',
    data: labels,
    key: l => l.key,
    insert: sel => sel.append('text')
      .attr('class', 'bc-dot-label')
      .attr('data-key', l => l.key)
      .attr('font-size', `${LABEL_FONT_SIZE}px`)
      .attr('dominant-baseline', 'central')
      .text(l => l.text),
    attrs: labelAttrs,
    enterFrom: l => ({ ...labelAttrs(l), opacity: 0 }),
    exitTo: () => ({ opacity: 0 }),
  })
  d3.select(parent).selectAll<SVGTextElement, LabelDatum>('.bc-dot-label')
    .data(labels, l => l.key)
    .text(l => l.text)
}
