import * as d3 from 'd3'
import 'd3-transition'
import type { ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas, contentSize, labelPositionMargins, estimateVerticalLabelWidth, computeMarginDelta } from '../../canvas/canvas'
import { AxisService } from '../../axis/axis-service'
import type { AnyXScale } from '../../axis/horizontal-axis'
import { computeLinearDomain, filterLabelsByRange } from '../../scale-helpers'
import { resolveCurve } from '../../curves'
import { renderAnnotations, snapshotAnnotations, type AnnotationSnapshot } from '../../plugins/annotations'
import { resolveBackgroundColor } from '../../contrast'
import { setupProximityInteraction, disposeProximityFor } from '../../plugins/proximity'
import { ensureClipPath } from '../../clip-path-helper'
import { renderLineSymbols } from '../../line-symbols'
import { setRenderTransition, fadeIn, snapshotForFadeOut, commitFadeOut } from '../../motion'
import { getCachedChart, setCachedChart } from '../../transition-cache'
import { featureJoin, getSceneTransition, tweenPlotFrame, type PlotRect } from '../../../transitions'

export const DEFAULT_COLOR = '#4e79a7'

interface AreaDatum {
  label: string
  value: number
}

/** Single-series wrapper so the area/line paths join as one keyed feature. */
interface AreaSeriesDatum {
  name: string
  points: AreaDatum[]
}

export function render(
  container: HTMLElement,
  data: ChartData,
  options: ChartOptions = {},
  transition = false,
): void {
  setRenderTransition(transition)
  // Tear down the previous proximity interaction (if any) so we don't leak
  // a body-level .bc-tooltip or stale event listeners on every render.
  disposeProximityFor(container)
  // Preserve existing mark paths for smooth resize transitions: they are the
  // tween's "from" shape, re-inserted into the featureJoin layers below.
  let priorAreas: Element[] = []
  let priorLines: Element[] = []
  let priorSymbolsGroup: Element | null = null
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
    if (cached?.chartType === 'area') {
      priorAreas = Array.from(container.querySelectorAll('.bc-frame .bc-area'))
      priorLines = Array.from(container.querySelectorAll('.bc-frame .bc-line'))
      priorSymbolsGroup = container.querySelector('.bc-frame .bc-symbols')
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
  const containerWidth = contentSize(body).width
  const vLabelW = estimateVerticalLabelWidth(data.values, options.verticalAxis?.range, options.verticalAxis?.numberFormat, options.verticalAxis?.scaleType)
  const lpMargins = labelPositionMargins(containerWidth, options.verticalAxis?.labelPosition, options.horizontalAxis?.labelPosition, options.verticalAxis?.direction, vLabelW)
  const { chartArea, width, height, margin } = createCanvas(body, lpMargins)
  const marginDelta = computeMarginDelta(priorMargin, margin)

  // Filter labels by horizontal axis range
  const rangeIndices = filterLabelsByRange(data.labels, options.horizontalAxis?.range)
  const filteredLabels = rangeIndices.map(i => data.labels[i])
  const filteredValues = rangeIndices.map(i => data.values[i])

  const areaData: AreaDatum[] = filteredLabels.map((l, i) => ({
    label: l,
    value: filteredValues[i],
  }))

  const pointScale = d3.scalePoint<string>()
    .domain(filteredLabels)
    .range([0, width])
    .padding(options.edgePadding ? 0.6 : 0)
  const xScale: AnyXScale = pointScale
  const xPos = (d: AreaDatum) => pointScale(d.label) ?? 0

  const useLog = options.verticalAxis?.scaleType === 'log'
  const [domainMin, domainMax] = computeLinearDomain(filteredValues, options.verticalAxis?.range, options.verticalAxis?.scaleType)
  const y = useLog
    ? d3.scaleSymlog().domain([domainMin, domainMax]).nice().range([height, 0])
    : d3.scaleLinear().domain([domainMin, domainMax]).nice().range([height, 0])

  // When the vertical domain crosses zero, position the axis domain line at y=0
  const yDomain = y.domain() as number[]
  const zeroY = yDomain[0] < 0 && yDomain[1] > 0 ? (y(0) as number) : undefined

  axes.attach(chartArea, marginDelta)
  axes.update({
    vertical: { scale: y, height, options: { ...options.verticalAxis, gridWidth: width, topPadding: margin.top } },
    horizontal: { scale: xScale, height, options: { ...options.horizontalAxis, width, zeroY } },
  })

  // Clip chart content to the plot area so lines/areas/dots outside the domain are hidden
  const svg = chartArea.ownerSVGElement!
  const clipId = ensureClipPath(svg, container, 'plot', { x: 0, y: 0, width, height })
  const clippedGroup = d3.select(chartArea).append('g').attr('clip-path', `url(#${clipId})`)
  const clippedArea = clippedGroup.node() as SVGGElement

  const color = options.colors?.[0] ?? DEFAULT_COLOR
  const curve = resolveCurve(options.interpolation ?? 'monotoneX')
  const areaFillOpacity = options.areaFillOpacity ?? 0.25

  const areaGen = d3.area<AreaDatum>().curve(curve).x(d => xPos(d)).y0(height).y1(d => y(d.value) as number)
  const lineGen = d3.line<AreaDatum>().curve(curve).x(d => xPos(d)).y(d => y(d.value) as number)

  // Marks are driven through the SceneTransition orchestrator's featureJoin so
  // they tween (resize) on the same `bc-scene` clock as the frame-geometry tween
  // below — instead of snapping. Captured prior marks are re-inserted (with their
  // bound data) into the featureJoin layers so the data-join matches them as
  // updates: that gives the tween its "from" shape, which a plain rebuild lacks.
  const areaLayer = d3.select(clippedArea).append('g').node() as SVGGElement
  const lineLayer = d3.select(clippedArea).append('g').node() as SVGGElement
  if (transition) {
    for (const el of priorAreas) {
      areaLayer.appendChild(el)
    }
    for (const el of priorLines) {
      lineLayer.appendChild(el)
    }
  }
  const orch = getSceneTransition(container)
  const seriesData: AreaSeriesDatum[] = [{ name: 'area', points: areaData }]

  featureJoin<AreaSeriesDatum>(orch, {
    role: 'series-area',
    parent: areaLayer,
    selector: '.bc-area',
    data: seriesData,
    key: d => d.name,
    insert: sel => sel.append('path').attr('class', 'bc-area'),
    attrs: d => ({
      d: areaGen(d.points) ?? '',
      fill: color,
      opacity: areaFillOpacity,
    }),
  })

  featureJoin<AreaSeriesDatum>(orch, {
    role: 'series-line',
    parent: lineLayer,
    selector: '.bc-line',
    data: seriesData,
    key: d => d.name,
    insert: sel => sel.append('path').attr('class', 'bc-line'),
    attrs: d => ({
      'd': lineGen(d.points) ?? '',
      'fill': 'none',
      'stroke': color,
      'stroke-width': 2,
    }),
  })

  // Invisible dots: re-derived each render (proximity handles interaction; these
  // exist for value-label anchoring and structural parity). Rendered fresh so the
  // count always tracks the current data — they ride the group transform below.
  const dotsLayer = d3.select(clippedArea).append('g')
  dotsLayer.selectAll<SVGCircleElement, AreaDatum>('.bc-dot')
    .data(areaData, d => d.label)
    .enter()
    .append('circle')
    .attr('class', 'bc-dot')
    .attr('cx', d => xPos(d))
    .attr('cy', d => y(d.value) as number)
    .attr('r', 3)
    .attr('fill', color)
    .attr('fill-opacity', 0)
    .attr('stroke-opacity', 0)
    .attr('pointer-events', 'none')

  // Frame-geometry tween: ease the plot origin (chart-area transform) + clip from
  // the prior scene's cached rect to this one on the SAME orchestrator clock, so
  // the marks (above), legend and axis move in lockstep. Same-type only.
  const plotRect: PlotRect = { left: margin.left, top: margin.top, width, height }
  tweenPlotFrame(orch, {
    svg,
    clipId,
    group: chartArea,
    from: priorPlotRect,
    to: plotRect,
    active: transition && (priorAreas.length > 0 || priorLines.length > 0),
  })

  if (options.annotations?.length) {
    renderAnnotations(chartArea, options.annotations, { scaleX: xScale, scaleY: y, data: areaData, width, height, backgroundColor: resolveBackgroundColor(container), transition, priorAnnotations })
  }

  if (options.tooltips || options.crosshair) {
    const proximityPoints = areaData.map(d => ({
      cx: xPos(d),
      cy: y(d.value) as number,
      label: d.label,
      value: d.value,
      color,
    }))
    setupProximityInteraction(chartArea, {
      width,
      height,
      points: proximityPoints,
      tooltip: options.tooltips,
      crosshair: options.crosshair,
      crosshairDirection: options.crosshairDirection,
      crosshairStyle: options.crosshairStyle,
      crosshairColor: options.crosshairColor,
      numberFormat: options.verticalAxis?.numberFormat,
      container,
    })
  }

  // Value labels: rendered above each point. Re-derived each render (no tween);
  // they ride the group transform during a resize.
  if (options.valueLabels) {
    const labelLayer = d3.select(clippedArea).append('g')
    labelLayer.selectAll<SVGTextElement, AreaDatum>('.bc-value-label')
      .data(areaData, d => d.label)
      .enter()
      .append('text')
      .attr('class', 'bc-value-label')
      .attr('x', d => xPos(d))
      .attr('y', d => (y(d.value) as number) - 8)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', 'currentColor')
      .text(d => String(d.value))
  }

  if (options.lineSymbols) {
    const symbolPoints = areaData.map((d, i) => ({
      cx: xPos(d),
      cy: y(d.value) as number,
      color,
      index: i,
    }))
    let symbolsGroup: d3.Selection<SVGGElement, unknown, null, undefined>
    if (priorSymbolsGroup) {
      chartArea.appendChild(priorSymbolsGroup)
      symbolsGroup = d3.select(priorSymbolsGroup) as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
    }
    else {
      symbolsGroup = d3.select(chartArea).append('g').attr('class', 'bc-symbols') as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
    }
    renderLineSymbols(symbolsGroup, symbolPoints, areaData.length, options.lineSymbols, transition)
  }

  setCachedChart(container, { chartType: 'area', margin, plotRect })

  if (fadeOverlay) {
    fadeIn(clippedGroup.node()!)
    commitFadeOut(container, fadeOverlay)
  }
}
