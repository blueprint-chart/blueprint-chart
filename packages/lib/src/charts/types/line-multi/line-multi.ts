import * as d3 from 'd3'
import 'd3-transition'
import type { AreaFillConfig, ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas, contentSize, labelPositionMargins, estimateVerticalLabelWidth, computeMarginDelta } from '../../canvas/canvas'
import { AxisService } from '../../axis/axis-service'
import type { AnyXScale } from '../../axis/horizontal-axis'
import { renderLegend } from '../../legend/legend'
import { estimateLegendSize, estimateDirectLabelWidth } from '../../legend/legend-size'
import { computeLinearDomain, filterLabelsByRange } from '../../scale-helpers'
import { resolveCurve } from '../../curves'
import { renderAnnotations, snapshotAnnotations, type AnnotationSnapshot } from '../../plugins/annotations'
import { resolveBackgroundColor } from '../../contrast'
import { setupProximityInteraction, disposeProximityFor } from '../../plugins/proximity'
import { ensureClipPath } from '../../clip-path-helper'
import { clampPointLabel } from '../../value-label-fit'
import { renderLineSymbols } from '../../line-symbols'
import { setRenderTransition, fadeIn, snapshotForFadeOut, commitFadeOut } from '../../motion'
import { setCachedChart, getCachedChart } from '../../transition-cache'
import { featureJoin, getSceneTransition, tweenPlotFrame, type PlotRect } from '../../../transitions'
import { expandColorsToSeries, resolveSeriesColor, resolveSeriesDash, resolveSeriesWidth, resolveSeriesInterpolation, isSeriesHidden, resolveSeriesLabelMode, resolveSeriesValueLabels, resolveSeriesLineSymbols } from '../../series-helpers'
import { highlightTargetSet, highlightOpacity } from '../../plugins/highlight'
import { buildColorOverrides } from '../../plugins/colorize'
import type { LineSymbolConfig } from '../../types'
import { SymbolShape, SymbolShowOn, SymbolStyle } from '../../../enums'
import { spreadLabels } from '../../plugins/arc-labels'

export const DEFAULT_COLORS = [
  '#4e79a7', '#f28e2b', '#e15759', '#76b7b2',
  '#59a14f', '#edc948', '#b07aa1', '#ff9da7',
]

interface SeriesDatum {
  name: string
  values: number[]
  colorIndex: number
}

interface DotDatum {
  label: string
  value: number
  series: string
  colorIndex: number
}

export function render(
  container: HTMLElement,
  inputData: ChartData,
  options: ChartOptions = {},
  transition = false,
): void {
  setRenderTransition(transition)
  // Tear down the previous proximity interaction (if any) so we don't leak
  // a body-level .bc-tooltip or stale event listeners on every render.
  disposeProximityFor(container)
  let data = inputData
  // Preserve existing data elements for smooth D3 data-join transitions
  let priorAreas: Element[] = []
  let priorLines: Element[] = []
  let priorSymbolsGroups: Element[] = []
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
    if (cached?.chartType === 'line-multi') {
      priorAreas = Array.from(container.querySelectorAll('.bc-frame .bc-area'))
      priorLines = Array.from(container.querySelectorAll('.bc-frame .bc-line'))
      priorSymbolsGroups = Array.from(container.querySelectorAll('.bc-frame .bc-symbols'))
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
  let series = allSeries.filter(s => !isSeriesHidden(s.name, options.seriesOverrides))

  // Sort series by total values when sortMode is 'total' or 'within-groups'
  if (options.sortMode === 'total' || options.sortMode === 'within-groups') {
    series = [...series].sort((a, b) => {
      const totalA = a.values.reduce((sum, v) => sum + v, 0)
      const totalB = b.values.reduce((sum, v) => sum + v, 0)
      return totalB - totalA
    })
  }

  const colors = expandColorsToSeries(options.colors ?? DEFAULT_COLORS, allSeries.length)
  const seriesNames = series.map(s => s.name)
  const colorOverrides = buildColorOverrides(options.colorizes)

  // Determine global label mode early so margin calculations account for per-series overrides
  const overrides = options.seriesOverrides
  // 'auto' defers to legend when legend is explicitly true; explicit true/truthy forces direct
  const wantsDirect = options.directLabelling === true || (options.directLabelling === 'auto' && options.legend !== true) || (!!options.directLabelling && options.directLabelling !== 'auto')
  const globalLabelMode = wantsDirect ? 'direct' : (options.legend !== false ? 'legend' : 'none')

  // Collect series that will have direct labels (global or per-series override)
  const directLabelNames = seriesNames.filter((name) => {
    return resolveSeriesLabelMode(name, globalLabelMode, overrides) === 'direct'
  })

  // Compute margin adjustments for legend and direct labels
  const showLegend = options.legend !== false && !wantsDirect
  const containerWidth = contentSize(body).width
  const NARROW_THRESHOLD = 350
  const requestedLegendPos = options.legendPosition ?? 'top'
  const legendPos = (containerWidth > 0 && containerWidth < NARROW_THRESHOLD && (requestedLegendPos === 'left' || requestedLegendPos === 'right'))
    ? 'top'
    : requestedLegendPos
  const legendAnchor = options.legendAnchor ?? 'start'
  // Filter labels by horizontal axis range
  const rangeIndices = filterLabelsByRange(data.labels, options.horizontalAxis?.range)
  const filteredLabels = rangeIndices.map(i => data.labels[i])
  series = series.map(s => ({ ...s, values: rangeIndices.map(i => s.values[i]) }))
  data = { ...data, labels: filteredLabels, series }

  const allValues = series.flatMap(s => s.values)
  const vLabelW = estimateVerticalLabelWidth(allValues, options.verticalAxis?.range, options.verticalAxis?.numberFormat, options.verticalAxis?.scaleType)
  const lpMargins = labelPositionMargins(containerWidth, options.verticalAxis?.labelPosition, options.horizontalAxis?.labelPosition, options.verticalAxis?.direction, vLabelW)
  const directLabelW = directLabelNames.length > 0 ? estimateDirectLabelWidth(directLabelNames) : 0

  const vLabelsInside = lpMargins.top != null
  const legendAvailableWidth = Math.max(0, containerWidth - (lpMargins.left ?? 50) - (lpMargins.right ?? 20) - directLabelW)
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
  if (directLabelW > 0) {
    marginOverrides.right = (marginOverrides.right ?? 20) + directLabelW
  }

  const { chartArea, width, height, margin } = createCanvas(body, marginOverrides)
  const marginDelta = computeMarginDelta(priorMargin, margin)

  const [domainMin, domainMax] = computeLinearDomain(allValues, options.verticalAxis?.range, options.verticalAxis?.scaleType, false)

  const pointScale = d3.scalePoint<string>()
    .domain(data.labels)
    .range([0, width])
    .padding(options.edgePadding ? 0.6 : 0)
  const xScale: AnyXScale = pointScale
  const xPos = (i: number) => pointScale(data.labels[i]) ?? 0

  const useLog = options.verticalAxis?.scaleType === 'log'
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

  const seriesData: SeriesDatum[] = series.map(s => ({
    name: s.name,
    values: s.values,
    colorIndex: allSeries.findIndex(a => a.name === s.name),
  }))

  const curve = resolveCurve(options.interpolation)

  // Between-series area fills (rendered before lines so lines draw on top)
  if (options.areaFills?.length) {
    renderAreaFills(clippedArea, options.areaFills, series, xPos, data.labels.length, y, curve)
  }

  // A cell the parser could not read, and a ragged row's missing cell, both arrive
  // as `undefined`. They are gaps, not zeros: the category keeps its slot on the
  // axis and the mark breaks, rather than reaching the scale and painting NaN.
  const plottable = (v: number) => Number.isFinite(v)
  // Build flat dot data for tooltips/crosshair
  const dotData: DotDatum[] = []
  series.forEach((s, si) => {
    data.labels.forEach((label, li) => {
      if (!plottable(s.values[li])) {
        return
      }
      dotData.push({ label, value: s.values[li], series: s.name, colorIndex: si })
    })
  })

  const symbolConfig = options.lineSymbols

  const DASH_MAP: Record<string, string> = {
    'solid': '',
    'dotted': '2,4',
    'dashed': '8,4',
    'dash-dot': '8,4,2,4',
  }

  const globalValueLabels = options.valueLabels ?? false

  // Build colorize target set for dimming non-targeted series
  const highlightTargets = highlightTargetSet(options.highlights, seriesNames)

  const areaFillOn = options.areaFill ?? false
  const areaFillOpacity = options.areaFillOpacity ?? 0.2
  const seriesColorFor = (d: SeriesDatum) =>
    colorOverrides.get(d.name) ?? resolveSeriesColor(d.name, d.colorIndex, colors, overrides)
  const areaGen = d3.area<number>().curve(curve).defined(plottable).x((_v, i) => xPos(i)).y0(height).y1(v => y(v) as number)

  // Marks are driven through the SceneTransition orchestrator's featureJoin so
  // they tween (resize) on the same `bc-scene` clock as the frame-geometry tween
  // below — instead of snapping. Per-series styling (color/width/dash/interp/
  // highlight) is folded into `attrs` so the orchestrator tweens it on one clock;
  // there is no post-draw `.each()` pass because featureJoin defers DOM creation
  // to commit(). Captured prior marks (for series that persist) are re-inserted
  // into the featureJoin layers so the data-join matches them as updates.
  const orch = getSceneTransition(container)
  const areaLayer = d3.select(clippedArea).append('g').node() as SVGGElement
  const lineLayer = d3.select(clippedArea).append('g').node() as SVGGElement
  // Drop priors whose series no longer exists so they vanish immediately
  // (not reinserted = removed by replaceChildren) instead of exit-fading.
  const nextSeriesNames = new Set(seriesData.map(s => s.name))
  if (transition) {
    for (const el of priorAreas) {
      if (nextSeriesNames.has((el as { __data__?: SeriesDatum }).__data__?.name ?? '')) {
        areaLayer.appendChild(el)
      }
    }
    for (const el of priorLines) {
      if (nextSeriesNames.has((el as { __data__?: SeriesDatum }).__data__?.name ?? '')) {
        lineLayer.appendChild(el)
      }
    }
  }

  featureJoin<SeriesDatum>(orch, {
    role: 'series-area',
    parent: areaLayer,
    selector: '.bc-area',
    data: areaFillOn ? seriesData : [],
    key: d => d.name,
    insert: sel => sel.append('path').attr('class', 'bc-area'),
    attrs: d => ({
      'data-series': d.name,
      'd': areaGen(d.values) ?? '',
      'fill': seriesColorFor(d),
      'opacity': highlightOpacity(highlightTargets, d.name, areaFillOpacity),
    }),
  })

  featureJoin<SeriesDatum>(orch, {
    role: 'series-line',
    parent: lineLayer,
    selector: '.bc-line',
    data: seriesData,
    key: d => d.name,
    insert: sel => sel.append('path').attr('class', 'bc-line'),
    attrs: (d) => {
      const seriesInterp = resolveSeriesInterpolation(d.name, options.interpolation ?? 'linear', overrides)
      const lineGen = d3.line<number>().curve(resolveCurve(seriesInterp)).defined(plottable).x((_v, i) => xPos(i)).y(v => y(v) as number)
      return {
        'data-series': d.name,
        'd': lineGen(d.values) ?? '',
        'fill': 'none',
        'stroke': seriesColorFor(d),
        // `chart.scss` declares `.bc-line { stroke-width: var(--bc-line-stroke-width) }`,
        // which outranks a presentation attribute, so the per-series width has to
        // be inline. Inline also survives the bare-SVG export, which the custom
        // property would not.
        'style': `stroke-width:${resolveSeriesWidth(d.name, overrides)}`,
        'stroke-dasharray': DASH_MAP[resolveSeriesDash(d.name, overrides)] ?? '',
        'opacity': highlightOpacity(highlightTargets, d.name, 1),
      }
    },
  })

  // Invisible dots: re-derived each render (proximity handles interaction). Rendered
  // fresh so the count always tracks the current data — they ride the group transform.
  const dotsLayer = d3.select(clippedArea).append('g')
  dotsLayer.selectAll<SVGCircleElement, DotDatum>('.bc-dot')
    .data(dotData, d => d.label + '\0' + d.series)
    .enter()
    .append('circle')
    .attr('class', 'bc-dot')
    .attr('data-series', d => d.series)
    .attr('cx', d => xPos(data.labels.indexOf(d.label)))
    .attr('cy', d => y(d.value) as number)
    .attr('r', 3)
    .attr('fill', d => seriesColorFor({ name: d.series, values: [], colorIndex: d.colorIndex }))
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
    active: transition && (priorLines.length > 0 || priorAreas.length > 0),
  })

  if (options.annotations?.length) {
    const annotationData = data.labels.map((l, i) => ({
      label: l,
      value: series[0]?.values[i] ?? 0,
    }))
    renderAnnotations(chartArea, options.annotations, { scaleX: xScale, scaleY: y, data: annotationData, width, height, backgroundColor: resolveBackgroundColor(container), transition, priorAnnotations })
  }

  // Per-series value labels: render directly so we control which series gets them.
  // The layer sits outside the plot clip: a clipped label is sliced mid-number, so
  // 20 paints as 0 and the maximum's label vanishes. It is inserted where the
  // clipped group held it so the proximity overlay keeps its z-order above it.
  const vlGroup = d3.select(chartArea).insert('g', () => clippedArea.nextSibling).attr('class', 'bc-value-labels')
  dotData.forEach((dot) => {
    if (!resolveSeriesValueLabels(dot.series, globalValueLabels, overrides)) {
      return
    }
    const cx = xPos(data.labels.indexOf(dot.label))
    const cy = y(dot.value) as number
    const pos = clampPointLabel(String(dot.value), cx, cy, { width, height, margin })
    vlGroup.append('text')
      .attr('class', 'bc-value-label')
      .attr('data-series', dot.series)
      .attr('x', pos.x)
      .attr('y', pos.y)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', 'currentColor')
      .text(String(dot.value))
  })

  if (options.tooltips || options.crosshair) {
    const proximityPoints = dotData.map(d => ({
      cx: xPos(data.labels.indexOf(d.label)),
      cy: y(d.value) as number,
      label: d.label,
      value: d.value,
      series: d.series,
      color: resolveSeriesColor(d.series, d.colorIndex, colors, overrides),
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

  // Per-series line symbols: use global config as base, override per series
  const globalSymbolOverride: import('../../types').SeriesOverride | undefined = symbolConfig
    ? {
        name: '',
        lineSymbols: true,
        symbolShape: symbolConfig.symbol,
        symbolShowOn: symbolConfig.showOn,
        symbolStyle: symbolConfig.style,
        symbolSize: symbolConfig.size,
        symbolOpacity: symbolConfig.opacity,
      }
    : undefined

  const labelCount = data.labels.length
  series.forEach((s, si) => {
    const resolved = resolveSeriesLineSymbols(s.name, globalSymbolOverride, overrides)
    if (!resolved) {
      return
    }

    const perSeriesSymbolConfig: LineSymbolConfig = {
      symbol: (resolved.symbolShape as LineSymbolConfig['symbol']) ?? symbolConfig?.symbol ?? SymbolShape.Circle,
      showOn: (resolved.symbolShowOn as LineSymbolConfig['showOn']) ?? symbolConfig?.showOn ?? SymbolShowOn.FirstLast,
      style: (resolved.symbolStyle as LineSymbolConfig['style']) ?? symbolConfig?.style ?? SymbolStyle.Filled,
      size: resolved.symbolSize ?? symbolConfig?.size ?? 3.5,
      opacity: resolved.symbolOpacity ?? symbolConfig?.opacity ?? 1,
    }

    const symbolPoints = data.labels.map((_, li) => ({
      cx: xPos(li),
      cy: y(s.values[li]) as number,
      color: resolveSeriesColor(s.name, si, colors, overrides),
      index: li,
    })).filter(p => Number.isFinite(p.cy))
    // Match prior symbol groups by series name so symbols stay slaved to their
    // line — matching by si would carry an old series' symbols onto a different
    // series in the new scene, making them appear to fly across the chart.
    const priorGroup = priorSymbolsGroups.find(el => el.getAttribute('data-series-name') === s.name)
    let symbolsGroup: d3.Selection<SVGGElement, unknown, null, undefined>
    let hasPrior = false
    if (priorGroup) {
      chartArea.appendChild(priorGroup)
      symbolsGroup = d3.select(priorGroup) as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
      hasPrior = true
    }
    else {
      symbolsGroup = d3.select(chartArea).append('g').attr('class', 'bc-symbols')
        .attr('data-series', s.name)
        .attr('data-series-name', s.name) as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
    }
    // Without a matching prior group there is no source position to transition
    // from; rendering without transition lets the new symbols snap into place
    // rather than drift across the chart.
    renderLineSymbols(symbolsGroup, symbolPoints, labelCount, perSeriesSymbolConfig, transition && hasPrior)
  })

  // Direct labels: show for series with 'direct' label mode (global or per-series)
  const lastLabelIdx = data.labels.length - 1
  const labelX = xPos(lastLabelIdx) + 6

  const directLabelEntries: { name: string, index: number, naturalY: number, text: string }[] = []
  series.forEach((s, i) => {
    const seriesLabelMode = resolveSeriesLabelMode(s.name, globalLabelMode, overrides)
    if (seriesLabelMode !== 'direct') {
      return
    }
    const lastValue = s.values[lastLabelIdx]
    // A horizontal range bound can exclude every category, and a ragged row can
    // leave the last cell empty: either way there is no point to label.
    if (!Number.isFinite(lastValue)) {
      return
    }
    const labelText = overrides?.find(o => o.name === s.name)?.labelText || s.name
    directLabelEntries.push({ name: s.name, index: i, naturalY: y(lastValue) as number, text: labelText })
  })

  if (directLabelEntries.length > 0) {
    directLabelEntries.sort((a, b) => a.naturalY - b.naturalY)
    const naturalYs = directLabelEntries.map(e => e.naturalY)
    const DIRECT_LABEL_GAP = 14
    const resolvedYs = spreadLabels(naturalYs, 0, height, DIRECT_LABEL_GAP)
    directLabelEntries.forEach((entry, i) => {
      d3.select(chartArea)
        .append('text')
        .attr('class', 'bc-direct-label')
        .attr('data-series', entry.name)
        .attr('x', labelX)
        .attr('y', resolvedYs[i])
        .attr('dy', '0.35em')
        .attr('font-size', '11px')
        .attr('fill', resolveSeriesColor(entry.name, entry.index, colors, overrides))
        .text(entry.text)
    })
  }

  // Legend: filter to series whose label mode resolves to 'legend'
  const legendSeriesNames = seriesNames.filter((name) => {
    const mode = resolveSeriesLabelMode(name, globalLabelMode, overrides)
    return mode === 'legend'
  })

  if (showLegend && legendSeriesNames.length > 0) {
    // Build colors array matching legend series order
    const legendColors = legendSeriesNames.map((name) => {
      const idx = allSeries.findIndex(s => s.name === name)
      return resolveSeriesColor(name, idx, colors, overrides)
    })

    let xLegendPos = 0
    let yPos = 0
    if (legendPos === 'top') {
      const insideGap = vLabelsInside ? 15 : 0
      yPos = -(legendSize.height + 10 + insideGap)
    }
    else if (legendPos === 'bottom') {
      yPos = height + 25
    }
    else if (legendPos === 'left') {
      xLegendPos = -(legendSize.width + 10)
    }
    else if (legendPos === 'right') {
      xLegendPos = width + 10
    }
    renderLegend(chartArea, legendSeriesNames, legendColors, yPos, legendPos, legendAnchor, width, height, xLegendPos, [], { left: margin.left, right: margin.right })
  }

  setCachedChart(container, { chartType: 'line-multi', margin, plotRect })

  if (fadeOverlay) {
    fadeIn(clippedGroup.node()!)
    commitFadeOut(container, fadeOverlay)
  }
}

function renderAreaFills(
  chartArea: SVGGElement,
  fills: AreaFillConfig[],
  series: { name: string, values: number[] }[],
  xPos: (i: number) => number,
  _labelCount: number,
  y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  curve: d3.CurveFactory,
): void {
  const g = d3.select(chartArea).append('g').attr('class', 'bc-area-fills')

  for (const fill of fills) {
    const fromSeries = series.find(s => s.name === fill.from)
    const toSeries = series.find(s => s.name === fill.to)
    if (!fromSeries || !toSeries) {
      continue
    }

    const fillCurve = fill.interpolation ? resolveCurve(fill.interpolation) : curve
    const opacity = (fill.opacity ?? 30) / 100
    const color = fill.color ?? '#ccc'
    const negColor = fill.negativeColor

    if (negColor) {
      renderSplitAreaFill(g, fromSeries.values, toSeries.values, xPos, y, fillCurve, color, negColor, opacity)
    }
    else {
      const areaGen = d3.area<number>()
        .curve(fillCurve)
        .defined((v, i) => Number.isFinite(v) && Number.isFinite(toSeries.values[i]))
        .x((_v, i) => xPos(i))
        .y0((_v, i) => y(toSeries.values[i]))
        .y1(v => y(v))

      g.append('path')
        .attr('class', 'bc-area-fill')
        .attr('d', areaGen(fromSeries.values) ?? '')
        .attr('fill', color)
        .attr('opacity', opacity)
    }
  }
}

/** A point with x, fromY, toY used for building split area segments. */
interface AreaPoint {
  x: number
  fromY: number
  toY: number
}

/**
 * Compute the x-coordinate where two line segments (from[i]→from[i+1]) and
 * (to[i]→to[i+1]) cross, using linear interpolation in pixel space.
 * Returns the fractional parameter t in [0,1] if they cross, or null.
 */
function findCrossingT(
  fromY0: number, fromY1: number,
  toY0: number, toY1: number,
): number | null {
  const d0 = fromY0 - toY0
  const d1 = fromY1 - toY1
  // If signs differ (or one is zero), the lines cross in this segment
  if (d0 === 0 && d1 === 0) {
    return null // coincident
  }
  if ((d0 > 0 && d1 > 0) || (d0 < 0 && d1 < 0)) {
    return null // no crossing
  }
  // t where the difference is zero: d0 + t*(d1-d0) = 0  →  t = -d0/(d1-d0)
  const denom = d1 - d0
  if (denom === 0) {
    return null
  }
  const t = -d0 / denom
  if (t < 0 || t > 1) {
    return null
  }
  return t
}

/**
 * Render area fill between two series, splitting at intersection points so
 * positive regions (from > to) and negative regions (from < to) get different colors.
 */
function renderSplitAreaFill(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  fromValues: number[],
  toValues: number[],
  xPos: (i: number) => number,
  y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  _curve: d3.CurveFactory,
  posColor: string,
  negColor: string,
  opacity: number,
): void {
  const n = fromValues.length
  if (n === 0) {
    return
  }

  // Build the list of points including intersection splits
  // Each point: { x, fromY (pixel), toY (pixel) }. A `null` marks a gap where one
  // of the two series has no readable cell: the fill breaks there rather than
  // spanning it, matching what `.defined()` does for the lines themselves.
  const points: (AreaPoint | null)[] = []
  const finite = (i: number) => Number.isFinite(fromValues[i]) && Number.isFinite(toValues[i])
  for (let i = 0; i < n; i++) {
    if (!finite(i)) {
      points.push(null)
      continue
    }
    const x = xPos(i)
    const fY = y(fromValues[i]) as number
    const tY = y(toValues[i]) as number
    points.push({ x, fromY: fY, toY: tY })

    if (i < n - 1 && finite(i + 1)) {
      const fY1 = y(fromValues[i + 1]) as number
      const tY1 = y(toValues[i + 1]) as number
      const t = findCrossingT(fY, fY1, tY, tY1)
      if (t !== null && t > 0 && t < 1) {
        const cx = x + t * (xPos(i + 1) - x)
        const cFromY = fY + t * (fY1 - fY)
        const cToY = tY + t * (tY1 - tY)
        points.push({ x: cx, fromY: cFromY, toY: cToY })
      }
    }
  }

  // Split points into segments at crossings (where fromY === toY)
  // Each segment is a contiguous run where the sign of (fromY - toY) is constant
  type Segment = { points: AreaPoint[], positive: boolean }
  const segments: Segment[] = []
  let current: AreaPoint[] = []
  let currentSign: boolean | null = null // true = positive (from above = fromY < toY in SVG, but fromVal > toVal)

  for (const pt of points) {
    if (!pt) {
      if (current.length >= 2 && currentSign !== null) {
        segments.push({ points: current, positive: currentSign })
      }
      current = []
      currentSign = null
      continue
    }
    const diff = pt.fromY - pt.toY // negative in SVG means from is above (higher value)
    const isPositive = diff < 0 // fromY < toY means from is higher on screen = from data value > to data value

    if (currentSign === null) {
      currentSign = diff === 0 ? null : isPositive
      current.push(pt)
    }
    else if (diff === 0) {
      // Crossing point: close current segment and start a new one
      current.push(pt)
      if (current.length >= 2) {
        segments.push({ points: current, positive: currentSign })
      }
      current = [pt]
      currentSign = null
    }
    else if (currentSign === isPositive) {
      current.push(pt)
    }
    else {
      // Sign changed without a crossing point (shouldn't happen given our intersection logic)
      current.push(pt)
      if (current.length >= 2) {
        segments.push({ points: current, positive: currentSign })
      }
      current = [pt]
      currentSign = isPositive
    }
  }
  // Flush the last segment
  if (current.length >= 2 && currentSign !== null) {
    segments.push({ points: current, positive: currentSign })
  }

  // Render each segment as a separate path
  for (const seg of segments) {
    const pts = seg.points
    // Build a closed polygon path: go along fromY, then back along toY
    let d = `M${pts[0].x},${pts[0].fromY}`
    for (let i = 1; i < pts.length; i++) {
      d += `L${pts[i].x},${pts[i].fromY}`
    }
    for (let i = pts.length - 1; i >= 0; i--) {
      d += `L${pts[i].x},${pts[i].toY}`
    }
    d += 'Z'

    g.append('path')
      .attr('class', `bc-area-fill ${seg.positive ? 'bc-area-fill-pos' : 'bc-area-fill-neg'}`)
      .attr('d', d)
      .attr('fill', seg.positive ? posColor : negColor)
      .attr('opacity', opacity)
  }
}
