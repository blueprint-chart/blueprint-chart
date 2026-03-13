import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import type { ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas, contentSize, labelPositionMargins, estimateVerticalLabelWidth } from '../../canvas/canvas'
import { renderVerticalAxis } from '../../axis/vertical-axis'
import { renderHorizontalAxis, type AnyXScale } from '../../axis/horizontal-axis'
import { renderLegend } from '../../legend/legend'
import { estimateLegendSize, estimateDirectLabelWidth } from '../../legend/legend-size'
import { resolveCurve } from '../../curves'
import { renderAnnotations, snapshotAnnotations, type AnnotationSnapshot } from '../../plugins/annotations'
import { resolveBackgroundColor } from '../../contrast'
import { setupProximityInteraction } from '../../plugins/proximity'
import { getDefaultTransitionMs, fadeIn, snapshotForFadeOut, commitFadeOut } from '../../motion'
import { setCachedChart, getCachedChart } from '../../transition-cache'
import { computeStack, computeStack100 } from '../../stack-helpers'
import { filterLabelsByRange } from '../../scale-helpers'
import { resolveSeriesColor, resolveSeriesInterpolation, isSeriesHidden, resolveSeriesLabelMode } from '../../series-helpers'
import { spreadLabels } from '../../plugins/arc-labels'

const DEFAULT_COLORS = [
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.configDefine('xPos', { defaultValue: (i: number) => 0 })
    this.configDefine('colors', { defaultValue: DEFAULT_COLORS })
    this.configDefine('curve', { defaultValue: d3.curveMonotoneX })
    this.configDefine('areaFillOpacity', { defaultValue: 0.85 })

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
          sel
            .attr('data-series', (d: StackedAreaDatum) => d.colorIndex)
            .attr('fill', (d: StackedAreaDatum) => colors[d.colorIndex % colors.length])
            .attr('opacity', opacity)
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
          sel.duration(getDefaultTransitionMs())
            .attr('data-series', (d: StackedAreaDatum) => d.colorIndex)
            .attr('fill', (d: StackedAreaDatum) => colors[d.colorIndex % colors.length])
            .attr('opacity', opacity)
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
          sel
            .attr('data-series', (d: StackedAreaDatum) => d.colorIndex)
            .attr('fill', 'none')
            .attr('stroke', (d: StackedAreaDatum) => colors[d.colorIndex % colors.length])
            .attr('stroke-width', 1)
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
          sel.duration(getDefaultTransitionMs())
            .attr('data-series', (d: StackedAreaDatum) => d.colorIndex)
            .attr('fill', 'none')
            .attr('stroke', (d: StackedAreaDatum) => colors[d.colorIndex % colors.length])
            .attr('stroke-width', 1)
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
  let data = inputData
  // Preserve existing data elements for smooth D3 data-join transitions
  let priorAreas: Element[] = []
  let priorLines: Element[] = []
  let priorVAxis: Element | null = null
  let priorHAxis: Element | null = null
  let fadeOverlay: HTMLElement | null = null
  let priorAnnotations: Map<string, AnnotationSnapshot> | undefined
  if (transition) {
    const cached = getCachedChart(container)
    if (cached) {
      priorVAxis = container.querySelector('.bc-axis-vertical')
      priorHAxis = container.querySelector('.bc-axis-horizontal')
    }
    if (cached?.chartType === 'area-stacked') {
      priorAreas = Array.from(container.querySelectorAll('.bc-area'))
      priorLines = Array.from(container.querySelectorAll('.bc-line'))
    }
    else if (cached) {
      fadeOverlay = snapshotForFadeOut(container)
    }
    priorAnnotations = new Map()
    for (const el of container.querySelectorAll('.bc-annotations, .bc-annotations-range')) {
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
  const legendSize = showLegend ? estimateLegendSize(seriesNames, legendPos, containerWidth) : { width: 0, height: 0 }
  const legendH = showLegend ? legendSize.height + 10 : 0
  const directLabelW = directLabelNames.length > 0 ? estimateDirectLabelWidth(directLabelNames) : 0

  // Compute stacked data to determine domain
  const stackMode = options.stackMode ?? 'normal'
  const isPercent = stackMode === 'percent'
  const filteredData: ChartData = { labels: data.labels, values: data.values, series }
  const stackedSeries = isPercent ? computeStack100(filteredData) : computeStack(filteredData)

  // Domain for stacked values
  let domainMax = 0
  for (const s of stackedSeries) {
    for (const point of s) {
      if (point[1] > domainMax) {
        domainMax = point[1]
      }
    }
  }
  if (isPercent) {
    domainMax = 100
  }

  const allValues = [0, domainMax]
  const vLabelW = estimateVerticalLabelWidth(allValues, options.verticalAxis?.range, options.verticalAxis?.numberFormat, options.verticalAxis?.scaleType)
  const lpMargins = labelPositionMargins(containerWidth, options.verticalAxis?.labelPosition, options.horizontalAxis?.labelPosition, options.verticalAxis?.direction, vLabelW)

  const vLabelsInside = lpMargins.top != null
  const marginOverrides: Record<string, number> = { ...lpMargins }
  if (showLegend && legendPos === 'top') {
    const insideGap = vLabelsInside ? 15 : 0
    marginOverrides.top = (marginOverrides.top ?? 20) + legendH + insideGap
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

  const pointScale = d3.scalePoint<string>()
    .domain(data.labels)
    .range([0, width])
    .padding(options.edgePadding ? 0.6 : 0)
  const xScale: AnyXScale = pointScale
  const xPos = (i: number) => pointScale(data.labels[i]) ?? 0

  const y = d3.scaleLinear().domain([0, domainMax]).nice().range([height, 0])

  renderVerticalAxis(chartArea, y, height, { ...options.verticalAxis, gridWidth: width, topPadding: margin.top }, priorVAxis)
  renderHorizontalAxis(chartArea, xScale, height, { ...options.horizontalAxis, width }, priorHAxis)

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
    const points: [number, number][] = Array.from(s).map(point => [y(point[0]) as number, y(point[1]) as number])
    return {
      name: s.key,
      points,
      colorIndex: seriesIdx >= 0 ? seriesIdx : 0,
    }
  })

  const chart = new AreaStackedChart(d3.select(clippedArea))
  chart.config({ xPos, colors, curve, areaFillOpacity: options.areaFillOpacity ?? 0.85 })

  // Re-insert prior elements so D3 data-join finds them and triggers merge:transition
  if (priorAreas.length > 0 || priorLines.length > 0) {
    const groups = clippedArea.querySelectorAll(':scope > g')
    if (groups[0]) {
      priorAreas.forEach(el => groups[0].appendChild(el))
    }
    if (groups[1]) {
      priorLines.forEach(el => groups[1].appendChild(el))
    }
  }

  chart.draw(stackedAreaData)

  // Apply per-series color overrides
  if (overrides?.length) {
    d3.select(clippedArea).selectAll('.bc-area').each(function (this: SVGPathElement, d: unknown) {
      const datum = d as StackedAreaDatum
      const seriesColor = resolveSeriesColor(datum.name, datum.colorIndex, colors, overrides)
      d3.select(this).attr('fill', seriesColor)
    })

    d3.select(clippedArea).selectAll('.bc-line').each(function (this: SVGPathElement, d: unknown) {
      const datum = d as StackedAreaDatum
      const seriesColor = resolveSeriesColor(datum.name, datum.colorIndex, colors, overrides)
      const seriesInterp = resolveSeriesInterpolation(datum.name, options.interpolation ?? 'monotoneX', overrides)
      const el = d3.select(this)
      el.attr('stroke', seriesColor)
      if (seriesInterp !== (options.interpolation ?? 'monotoneX')) {
        const perCurve = resolveCurve(seriesInterp)
        const lineGen = d3.line<[number, number]>()
          .curve(perCurve)
          .x((_v, i) => xPos(i))
          .y(p => p[1])
        el.attr('d', lineGen(datum.points))
      }
    })
  }

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
    const resolvedYs = spreadLabels(naturalYs, 0, height)
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
    renderLegend(chartArea, legendSeriesNames, legendColors, yPos, legendPos, legendAnchor, width, height, xLegendPos)
  }

  setCachedChart(container, { chartType: 'area-stacked' })

  if (fadeOverlay) {
    fadeIn(clippedGroup.node()!)
    commitFadeOut(container, fadeOverlay)
  }
}
