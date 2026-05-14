import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import type { ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas, contentSize, labelPositionMargins, estimateVerticalLabelWidth, computeMarginDelta } from '../../canvas/canvas'
import { AxisService } from '../../axis/axis-service'
import type { AnyXScale } from '../../axis/horizontal-axis'
import { renderLegend } from '../../legend/legend'
import { estimateLegendSize, estimateDirectLabelWidth } from '../../legend/legend-size'
import { resolveCurve } from '../../curves'
import { renderAnnotations, snapshotAnnotations, type AnnotationSnapshot } from '../../plugins/annotations'
import { resolveBackgroundColor } from '../../contrast'
import { setupProximityInteraction } from '../../plugins/proximity'
import { getDefaultTransitionMs, setRenderTransition, fadeIn, snapshotForFadeOut, commitFadeOut, reinsertWithOffset } from '../../motion'
import { setCachedChart, getCachedChart } from '../../transition-cache'
import { computeStack, computeStack100 } from '../../stack-helpers'
import { filterLabelsByRange } from '../../scale-helpers'
import { resolveSeriesColor, resolveSeriesInterpolation, isSeriesHidden, resolveSeriesLabelMode } from '../../series-helpers'
import { spreadLabels } from '../../plugins/arc-labels'
import { StackMode, SortDirection } from '../../../enums'

export const DEFAULT_COLORS = [
  '#4e79a7', '#f28e2b', '#e15759', '#76b7b2',
  '#59a14f', '#edc948', '#b07aa1', '#ff9da7',
]

interface StackedAreaDatum {
  name: string
  points: [number, number][] // [y0, y1] pairs
  colorIndex: number
}

class AreaStackedChart extends D3Blueprint<StackedAreaDatum[]> {
  initialize() {
    this.configDefine('xPos', { defaultValue: (_i: number) => 0 })
    this.configDefine('colors', { defaultValue: DEFAULT_COLORS })
    this.configDefine('curve', { defaultValue: d3.curveMonotoneX })
    this.configDefine('areaFillOpacity', { defaultValue: 0.85 })
    this.configDefine('highlightTargets', { defaultValue: new Set<string>() })

    const areaGroup = this.base.append('g')
    const lineGroup = this.base.append('g')

    this.layer('stacked-areas', areaGroup, {
      dataBind: (sel, data) => sel.selectAll('.bc-area').data(data, (d: StackedAreaDatum) => d.name),
      insert: sel => sel.append('path').attr('class', 'bc-area'),
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'enter': (sel: any) => {
          const xPos = this.config('xPos') as (i: number) => number
          const colors = this.config('colors') as string[]
          const curve = this.config('curve') as d3.CurveFactory
          const opacity = this.config('areaFillOpacity') as number
          const hl = this.config('highlightTargets') as Set<string>
          const hasHl = hl.size > 0
          sel
            .attr('data-series', (d: StackedAreaDatum) => d.colorIndex)
            .attr('fill', (d: StackedAreaDatum) => colors[d.colorIndex % colors.length])
            .attr('opacity', (d: StackedAreaDatum) => hasHl ? (hl.has(d.name) ? opacity : 0.3) : opacity)
            .attr('d', (d: StackedAreaDatum) => {
              const areaGen = d3.area<[number, number]>()
                .curve(curve)
                .x((_v, i) => xPos(i))
                .y0(p => p[0])
                .y1(p => p[1])
              return areaGen(d.points)
            })
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'merge:transition': (sel: any) => {
          const xPos = this.config('xPos') as (i: number) => number
          const colors = this.config('colors') as string[]
          const curve = this.config('curve') as d3.CurveFactory
          const opacity = this.config('areaFillOpacity') as number
          const hl = this.config('highlightTargets') as Set<string>
          const hasHl = hl.size > 0
          sel.duration(getDefaultTransitionMs())
            .attr('data-series', (d: StackedAreaDatum) => d.colorIndex)
            .attr('fill', (d: StackedAreaDatum) => colors[d.colorIndex % colors.length])
            .attr('opacity', (d: StackedAreaDatum) => hasHl ? (hl.has(d.name) ? opacity : 0.3) : opacity)
            .attr('d', (d: StackedAreaDatum) => {
              const areaGen = d3.area<[number, number]>()
                .curve(curve)
                .x((_v, i) => xPos(i))
                .y0(p => p[0])
                .y1(p => p[1])
              return areaGen(d.points)
            })
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'exit:transition': (sel: any) => {
          sel.duration(getDefaultTransitionMs())
            .attr('opacity', 0)
            .remove()
        },
      },
    })

    this.layer('line-edges', lineGroup, {
      dataBind: (sel, data) => sel.selectAll('.bc-line').data(data, (d: StackedAreaDatum) => d.name),
      insert: sel => sel.append('path').attr('class', 'bc-line'),
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'enter': (sel: any) => {
          const xPos = this.config('xPos') as (i: number) => number
          const colors = this.config('colors') as string[]
          const curve = this.config('curve') as d3.CurveFactory
          const hl = this.config('highlightTargets') as Set<string>
          const hasHl = hl.size > 0
          sel
            .attr('data-series', (d: StackedAreaDatum) => d.colorIndex)
            .attr('fill', 'none')
            .attr('stroke', (d: StackedAreaDatum) => colors[d.colorIndex % colors.length])
            .attr('stroke-width', 1)
            .attr('opacity', (d: StackedAreaDatum) => hasHl ? (hl.has(d.name) ? 1 : 0.3) : null)
            .attr('d', (d: StackedAreaDatum) => {
              const lineGen = d3.line<[number, number]>()
                .curve(curve)
                .x((_v, i) => xPos(i))
                .y(p => p[1])
              return lineGen(d.points)
            })
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'merge:transition': (sel: any) => {
          const xPos = this.config('xPos') as (i: number) => number
          const colors = this.config('colors') as string[]
          const curve = this.config('curve') as d3.CurveFactory
          const hl = this.config('highlightTargets') as Set<string>
          const hasHl = hl.size > 0
          sel.duration(getDefaultTransitionMs())
            .attr('data-series', (d: StackedAreaDatum) => d.colorIndex)
            .attr('fill', 'none')
            .attr('stroke', (d: StackedAreaDatum) => colors[d.colorIndex % colors.length])
            .attr('stroke-width', 1)
            .attr('opacity', (d: StackedAreaDatum) => hasHl ? (hl.has(d.name) ? 1 : 0.3) : null)
            .attr('d', (d: StackedAreaDatum) => {
              const lineGen = d3.line<[number, number]>()
                .curve(curve)
                .x((_v, i) => xPos(i))
                .y(p => p[1])
              return lineGen(d.points)
            })
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'exit:transition': (sel: any) => {
          sel.duration(getDefaultTransitionMs())
            .attr('opacity', 0)
            .remove()
        },
      },
    })
  }
}

export function render(
  container: HTMLElement,
  inputData: ChartData,
  options: ChartOptions = {},
  transition = false,
): void {
  setRenderTransition(transition)
  let data = inputData
  // Preserve existing data elements for smooth D3 data-join transitions
  let priorAreas: Element[] = []
  let priorLines: Element[] = []
  let fadeOverlay: HTMLElement | null = null
  let priorAnnotations: Map<string, AnnotationSnapshot> | undefined
  let priorMargin: { top: number, left: number } | undefined
  const axes = AxisService.for(container)
  if (transition) {
    const cached = getCachedChart(container)
    priorMargin = cached?.margin
    axes.detach()
    if (cached?.chartType === 'area-stacked') {
      priorAreas = Array.from(container.querySelectorAll('.bc-frame .bc-area'))
      priorLines = Array.from(container.querySelectorAll('.bc-frame .bc-line'))
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

  // Filter labels by horizontal axis range
  const rangeIndices = filterLabelsByRange(data.labels, options.horizontalAxis?.range)
  if (rangeIndices.length < data.labels.length) {
    const filteredLabels = rangeIndices.map(i => data.labels[i])
    const filteredSeries = (data.series ?? []).map(s => ({ ...s, values: rangeIndices.map(i => s.values[i]) }))
    data = { labels: filteredLabels, values: rangeIndices.map(i => data.values[i]), series: filteredSeries }
  }

  const allSeries = data.series ?? []
  const series = allSeries.filter(s => !isSeriesHidden(s.name, options.seriesOverrides))

  const colors = options.colors ?? DEFAULT_COLORS
  const seriesNames = series.map(s => s.name)
  const overrides = options.seriesOverrides

  // Determine global label mode for legend/direct label sizing
  // 'auto' defers to legend when legend is explicitly true; explicit true/truthy forces direct
  const wantsDirect = options.directLabelling === true || (options.directLabelling === 'auto' && options.legend !== true) || (!!options.directLabelling && options.directLabelling !== 'auto')
  const globalLabelMode = wantsDirect ? 'direct' : (options.legend !== false ? 'legend' : 'none')
  const directLabelNames = seriesNames.filter(name => resolveSeriesLabelMode(name, globalLabelMode, overrides) === 'direct')

  const showLegend = options.legend !== false && !wantsDirect
  const containerWidth = contentSize(body).width
  const NARROW_THRESHOLD = 350
  const requestedLegendPos = options.legendPosition ?? 'top'
  const legendPos = (containerWidth > 0 && containerWidth < NARROW_THRESHOLD && (requestedLegendPos === 'left' || requestedLegendPos === 'right'))
    ? 'top'
    : requestedLegendPos
  const legendAnchor = options.legendAnchor ?? 'start'
  // Compute domain and margins before estimating legend size,
  // so we can use the actual chart-area width for wrapping estimation.
  const isStacked = options.stacked !== false
  const isPercent = options.stackPercent === true || options.stackMode === StackMode.Percent
  const areaSortMode = options.areaSortMode ?? SortDirection.None
  const showAreaLines = options.areaLines !== false

  // Sort series by total if requested
  const sortedSeries = [...series]
  if (areaSortMode !== SortDirection.None) {
    const totals = new Map(sortedSeries.map(s => [s.name, s.values.reduce((a, b) => a + b, 0)]))
    sortedSeries.sort((a, b) => {
      const diff = (totals.get(a.name) ?? 0) - (totals.get(b.name) ?? 0)
      return areaSortMode === SortDirection.Ascending ? diff : -diff
    })
  }

  const filteredData: ChartData = { labels: data.labels, values: data.values, series: sortedSeries }
  const stackedSeries = isPercent ? computeStack100(filteredData) : computeStack(filteredData)

  // Domain for stacked/unstacked values
  let domainMax = 0
  if (isStacked) {
    for (const s of stackedSeries) {
      for (const point of s) {
        if (point[1] > domainMax) {
          domainMax = point[1]
        }
      }
    }
  }
  else {
    for (const s of sortedSeries) {
      for (const v of s.values) {
        if (v > domainMax) {
          domainMax = v
        }
      }
    }
  }
  if (isPercent) {
    domainMax = 100
  }

  const allValues = [0, domainMax]
  const vLabelW = estimateVerticalLabelWidth(allValues, options.verticalAxis?.range, options.verticalAxis?.numberFormat, options.verticalAxis?.scaleType)
  const lpMargins = labelPositionMargins(containerWidth, options.verticalAxis?.labelPosition, options.horizontalAxis?.labelPosition, options.verticalAxis?.direction, vLabelW)
  const directLabelW = directLabelNames.length > 0 ? estimateDirectLabelWidth(directLabelNames) : 0

  // Estimate legend size using the actual chart-area width so wrapping matches rendering.
  // Left/right margins are fixed at this point (they don't depend on legend height).
  const vLabelsInside = lpMargins.top != null
  const legendAvailableWidth = Math.max(0, containerWidth - (lpMargins.left ?? 50) - (lpMargins.right ?? 20) - directLabelW)
  const legendSize = showLegend ? estimateLegendSize(seriesNames, legendPos, legendAvailableWidth) : { width: 0, height: 0 }
  const legendH = showLegend ? legendSize.height + 10 : 0
  const marginOverrides: Record<string, number> = { ...lpMargins }
  if (showLegend && legendPos === 'top') {
    const insideGap = vLabelsInside ? 15 : 0
    marginOverrides.top = legendH + insideGap
  }
  if (showLegend && legendPos === 'bottom') {
    marginOverrides.bottom = (marginOverrides.bottom ?? 40) + legendH
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

  const pointScale = d3.scalePoint<string>()
    .domain(data.labels)
    .range([0, width])
    .padding(options.edgePadding ? 0.6 : 0)
  const xScale: AnyXScale = pointScale
  const xPos = (i: number) => pointScale(data.labels[i]) ?? 0

  const y = d3.scaleLinear().domain([0, domainMax]).nice().range([height, 0])

  axes.attach(chartArea, marginDelta)
  axes.update({
    vertical: { scale: y, height, options: { ...options.verticalAxis, gridWidth: width, topPadding: margin.top } },
    horizontal: { scale: xScale, height, options: { ...options.horizontalAxis, width } },
  })

  // Clip chart content to the plot area
  const clipId = `bc-clip-${Math.random().toString(36).slice(2, 8)}`
  const svg = chartArea.ownerSVGElement!
  const clipDefs = d3.select(svg).select('defs').empty()
    ? d3.select(svg).append('defs')
    : d3.select(svg).select('defs')
  clipDefs.append('clipPath').attr('id', clipId)
    .append('rect').attr('width', width).attr('height', height)
  const clippedGroup = d3.select(chartArea).append('g').attr('clip-path', `url(#${clipId})`)
  const clippedArea = clippedGroup.node() as SVGGElement

  const curve = resolveCurve(options.interpolation ?? 'monotoneX')

  // Convert d3 stack series to StackedAreaDatum[]
  const stackedAreaData: StackedAreaDatum[] = stackedSeries.map((s) => {
    const seriesIdx = allSeries.findIndex(a => a.name === s.key)
    let points: [number, number][]
    if (isStacked) {
      points = Array.from(s).map(point => [y(point[0]) as number, y(point[1]) as number])
    }
    else {
      // Unstacked: each area from y=0 to its own value
      const rawSeries = sortedSeries.find(rs => rs.name === s.key)
      points = (rawSeries?.values ?? []).map(v => [y(0) as number, y(v) as number])
    }
    return {
      name: s.key,
      points,
      colorIndex: seriesIdx >= 0 ? seriesIdx : 0,
    }
  })

  // Build colorize target set for dimming non-targeted series
  const highlightTargets = new Set((options.highlights ?? []).map(h => h.target))
  const hasHighlights = highlightTargets.size > 0

  const resolvedOpacity = options.areaFillOpacity != null ? options.areaFillOpacity : 0.85
  const chart = new AreaStackedChart(d3.select(clippedArea))
  chart.config({ xPos, colors, curve, areaFillOpacity: resolvedOpacity, highlightTargets })

  // Re-insert prior elements so D3 data-join finds them and triggers merge:transition
  if (priorAreas.length > 0 || priorLines.length > 0) {
    const dx = marginDelta?.dx ?? 0
    const dy = marginDelta?.dy ?? 0
    const groups = clippedArea.querySelectorAll(':scope > g')
    if (groups[0]) {
      reinsertWithOffset(groups[0], priorAreas, dx, dy)
    }
    if (groups[1]) {
      reinsertWithOffset(groups[1], priorLines, dx, dy)
    }
  }

  chart.draw(stackedAreaData)

  // Apply per-series color overrides and highlight dimming
  d3.select(clippedArea).selectAll('.bc-area').each(function (this: SVGPathElement, d: unknown) {
    const datum = d as StackedAreaDatum
    const seriesColor = resolveSeriesColor(datum.name, datum.colorIndex, colors, overrides)
    const el = transition
      ? d3.select(this).transition().duration(getDefaultTransitionMs())
      : d3.select(this)
    el.attr('fill', seriesColor)
    if (hasHighlights) {
      el.attr('opacity', highlightTargets.has(datum.name) ? resolvedOpacity : 0.3)
    }
  })

  if (!showAreaLines) {
    d3.select(clippedArea).selectAll('.bc-line').attr('display', 'none')
  }

  d3.select(clippedArea).selectAll('.bc-line').each(function (this: SVGPathElement, d: unknown) {
    const datum = d as StackedAreaDatum
    const seriesColor = resolveSeriesColor(datum.name, datum.colorIndex, colors, overrides)
    const seriesInterp = resolveSeriesInterpolation(datum.name, options.interpolation ?? 'monotoneX', overrides)
    const el = transition
      ? d3.select(this).transition().duration(getDefaultTransitionMs())
      : d3.select(this)
    el.attr('stroke', seriesColor)
    if (hasHighlights) {
      el.attr('opacity', highlightTargets.has(datum.name) ? 1 : 0.3)
    }
    if (seriesInterp !== (options.interpolation ?? 'monotoneX')) {
      const perCurve = resolveCurve(seriesInterp)
      const lineGen = d3.line<[number, number]>()
        .curve(perCurve)
        .x((_v, i) => xPos(i))
        .y(p => p[1])
      el.attr('d', lineGen(datum.points))
    }
  })

  if (options.annotations?.length) {
    const annotationData = data.labels.map((l, i) => ({
      label: l,
      value: series[0]?.values[i] ?? 0,
    }))
    renderAnnotations(chartArea, options.annotations, { scaleX: xScale, scaleY: y, data: annotationData, width, height, backgroundColor: resolveBackgroundColor(container), transition, priorAnnotations })
  }

  if (options.tooltips || options.crosshair) {
    // Build proximity points from all series
    const proximityPoints: { cx: number, cy: number, label: string, value: number, series: string, color: string }[] = []
    stackedSeries.forEach((s) => {
      const seriesIdx = allSeries.findIndex(a => a.name === s.key)
      Array.from(s).forEach((point, i) => {
        const rawValue = point[1] - point[0]
        proximityPoints.push({
          cx: xPos(i),
          cy: y(point[1]) as number,
          label: data.labels[i],
          value: Math.round(rawValue * 100) / 100,
          series: s.key,
          color: resolveSeriesColor(s.key, seriesIdx, colors, overrides),
        })
      })
    })
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
    })
  }

  // Direct labels
  const lastLabelIdx = data.labels.length - 1
  const labelX = xPos(lastLabelIdx) + 6
  const directLabelEntries: { name: string, index: number, naturalY: number, text: string }[] = []
  series.forEach((s, i) => {
    const seriesLabelMode = resolveSeriesLabelMode(s.name, globalLabelMode, overrides)
    if (seriesLabelMode !== 'direct') {
      return
    }
    const stackSeries = stackedSeries.find(ss => ss.key === s.name)
    if (!stackSeries) {
      return
    }
    const lastPoint = stackSeries[lastLabelIdx]
    const midY = y((lastPoint[0] + lastPoint[1]) / 2) as number
    const labelText = overrides?.find(o => o.name === s.name)?.labelText || s.name
    directLabelEntries.push({ name: s.name, index: i, naturalY: midY, text: labelText })
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
        .attr('data-series', entry.index)
        .attr('x', labelX)
        .attr('y', resolvedYs[i])
        .attr('dy', '0.35em')
        .attr('font-size', '11px')
        .attr('fill', resolveSeriesColor(entry.name, entry.index, colors, overrides))
        .text(entry.text)
    })
  }

  // Legend
  const legendSeriesNames = seriesNames.filter(name => resolveSeriesLabelMode(name, globalLabelMode, overrides) === 'legend')

  if (showLegend && legendSeriesNames.length > 0) {
    const legendColors = legendSeriesNames.map((name) => {
      const idx = allSeries.findIndex(s => s.name === name)
      return resolveSeriesColor(name, idx, colors, overrides)
    })

    let xLegendPos = 0
    let yPos = 0
    if (legendPos === 'top') {
      const insideGap = vLabelsInside ? 15 : 0
      yPos = -(legendSize.height + 5 + insideGap)
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

  setCachedChart(container, { chartType: 'area-stacked', margin })

  if (fadeOverlay) {
    fadeIn(clippedGroup.node()!)
    commitFadeOut(container, fadeOverlay)
  }
}
