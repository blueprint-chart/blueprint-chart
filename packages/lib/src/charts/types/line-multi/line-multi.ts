import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import type { AreaFillConfig, ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas, contentSize, labelPositionMargins, estimateVerticalLabelWidth } from '../../canvas/canvas'
import { renderVerticalAxis } from '../../axis/vertical-axis'
import { renderHorizontalAxis, type AnyXScale } from '../../axis/horizontal-axis'
import { renderLegend } from '../../legend/legend'
import { estimateLegendSize, estimateDirectLabelWidth } from '../../legend/legend-size'
import { computeLinearDomain, filterLabelsByRange } from '../../scale-helpers'
import { resolveCurve } from '../../curves'
import { renderAnnotations, snapshotAnnotations, type AnnotationSnapshot } from '../../plugins/annotations'
import { resolveBackgroundColor } from '../../contrast'
import { setupProximityInteraction } from '../../plugins/proximity'
import { renderLineSymbols } from '../../line-symbols'
import { getDefaultTransitionMs, fadeIn, snapshotForFadeOut, commitFadeOut } from '../../motion'
import { setCachedChart, getCachedChart } from '../../transition-cache'
import { resolveSeriesColor, resolveSeriesDash, resolveSeriesWidth, resolveSeriesInterpolation, isSeriesHidden, resolveSeriesLabelMode, resolveSeriesValueLabels, resolveSeriesLineSymbols } from '../../series-helpers'
import type { LineSymbolConfig } from '../../types'
import { spreadLabels } from '../../plugins/arc-labels'

const DEFAULT_COLORS = [
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

class LineMultiChart extends D3Blueprint<SeriesDatum[]> {
  initialize() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.configDefine('xPos', { defaultValue: (i: number) => 0 })
    this.configDefine('y', { defaultValue: d3.scaleLinear() })
    this.configDefine('colors', { defaultValue: DEFAULT_COLORS })
    this.configDefine('labels', { defaultValue: [] as string[] })
    this.configDefine('curve', { defaultValue: d3.curveLinear })
    this.configDefine('areaFill', { defaultValue: false })
    this.configDefine('areaFillOpacity', { defaultValue: 0.2 })
    this.configDefine('height', { defaultValue: 0 })
    this.configDefine('dots', { defaultValue: [] as DotDatum[] })

    const areaGroup = this.base.append('g')
    const g = this.base.append('g')
    const dotsGroup = this.base.append('g')

    this.layer('areas', areaGroup, {
      dataBind: (sel, data) => sel.selectAll('.bc-area').data(this.config('areaFill') ? data : [], (d: SeriesDatum) => d.name),
      insert: sel => sel.append('path').attr('class', 'bc-area'),
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'enter': (sel: any) => {
          const xPos = this.config('xPos') as (i: number) => number
          const y = this.config('y') as d3.ScaleLinear<number, number>
          const colors = this.config('colors') as string[]
          const curve = this.config('curve') as d3.CurveFactory
          const h = this.config('height') as number
          const opacity = this.config('areaFillOpacity') as number
          sel
            .attr('data-series', (d: SeriesDatum) => d.colorIndex)
            .attr('fill', (d: SeriesDatum) => colors[d.colorIndex % colors.length])
            .attr('opacity', opacity)
            .attr('d', (d: SeriesDatum) => {
              const areaGen = d3.area<number>()
                .curve(curve)
                .x((_v, i) => xPos(i))
                .y0(h)
                .y1(v => y(v))
              return areaGen(d.values)
            })
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'merge:transition': (sel: any) => {
          const xPos = this.config('xPos') as (i: number) => number
          const y = this.config('y') as d3.ScaleLinear<number, number>
          const colors = this.config('colors') as string[]
          const curve = this.config('curve') as d3.CurveFactory
          const h = this.config('height') as number
          const opacity = this.config('areaFillOpacity') as number
          sel.duration(getDefaultTransitionMs())
            .attr('data-series', (d: SeriesDatum) => d.colorIndex)
            .attr('fill', (d: SeriesDatum) => colors[d.colorIndex % colors.length])
            .attr('opacity', opacity)
            .attr('d', (d: SeriesDatum) => {
              const areaGen = d3.area<number>()
                .curve(curve)
                .x((_v, i) => xPos(i))
                .y0(h)
                .y1(v => y(v))
              return areaGen(d.values)
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

    this.layer('lines', g, {
      dataBind: (sel, data) => sel.selectAll('.bc-line').data(data, (d: SeriesDatum) => d.name),
      insert: sel => sel.append('path').attr('class', 'bc-line'),
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'enter': (sel: any) => {
          const xPos = this.config('xPos') as (i: number) => number
          const y = this.config('y') as d3.ScaleLinear<number, number>
          const colors = this.config('colors') as string[]
          sel
            .attr('data-series', (d: SeriesDatum) => d.colorIndex)
            .attr('fill', 'none')
            .attr('stroke', (d: SeriesDatum) => colors[d.colorIndex % colors.length])
            .attr('stroke-width', 2)
            .attr('d', (d: SeriesDatum) => {
              const curve = this.config('curve') as d3.CurveFactory
              const lineGen = d3.line<number>()
                .curve(curve)
                .x((_v, i) => xPos(i))
                .y(v => y(v))
              return lineGen(d.values)
            })
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'merge:transition': (sel: any) => {
          const xPos = this.config('xPos') as (i: number) => number
          const y = this.config('y') as d3.ScaleLinear<number, number>
          const colors = this.config('colors') as string[]
          sel.duration(getDefaultTransitionMs())
            .attr('data-series', (d: SeriesDatum) => d.colorIndex)
            .attr('fill', 'none')
            .attr('stroke', (d: SeriesDatum) => colors[d.colorIndex % colors.length])
            .attr('stroke-width', 2)
            .attr('d', (d: SeriesDatum) => {
              const curve = this.config('curve') as d3.CurveFactory
              const lineGen = d3.line<number>()
                .curve(curve)
                .x((_v, i) => xPos(i))
                .y(v => y(v))
              return lineGen(d.values)
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

    this.layer('dots', dotsGroup, {
      dataBind: sel => sel.selectAll('.bc-dot').data(this.config('dots') as DotDatum[], (d: DotDatum) => d.label + '\0' + d.series),
      insert: sel => sel.append('circle').attr('class', 'bc-dot'),
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'enter': (sel: any) => {
          const xPos = this.config('xPos') as (i: number) => number
          const y = this.config('y') as d3.ScaleLinear<number, number>
          const colors = this.config('colors') as string[]
          const labels = this.config('labels') as string[]
          sel
            .attr('data-series', (d: DotDatum) => d.colorIndex)
            .attr('cx', (d: DotDatum) => xPos(labels.indexOf(d.label)))
            .attr('cy', (d: DotDatum) => y(d.value))
            .attr('r', 3)
            .attr('fill', (d: DotDatum) => colors[d.colorIndex % colors.length])
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'merge:transition': (sel: any) => {
          const xPos = this.config('xPos') as (i: number) => number
          const y = this.config('y') as d3.ScaleLinear<number, number>
          const colors = this.config('colors') as string[]
          const labels = this.config('labels') as string[]
          sel.duration(getDefaultTransitionMs())
            .attr('data-series', (d: DotDatum) => d.colorIndex)
            .attr('cx', (d: DotDatum) => xPos(labels.indexOf(d.label)))
            .attr('cy', (d: DotDatum) => y(d.value))
            .attr('r', 3)
            .attr('fill', (d: DotDatum) => colors[d.colorIndex % colors.length])
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
  let priorDots: Element[] = []
  let priorSymbolsGroups: Element[] = []
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
    if (cached?.chartType === 'line-multi') {
      priorAreas = Array.from(container.querySelectorAll('.bc-area'))
      priorLines = Array.from(container.querySelectorAll('.bc-line'))
      priorDots = Array.from(container.querySelectorAll('.bc-dot'))
      priorSymbolsGroups = Array.from(container.querySelectorAll('.bc-symbols'))
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

  const colors = options.colors ?? DEFAULT_COLORS
  const seriesNames = series.map(s => s.name)

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
  const legendSize = showLegend ? estimateLegendSize(seriesNames, legendPos, containerWidth) : { width: 0, height: 0 }
  const legendH = showLegend ? legendSize.height + 10 : 0
  const directLabelW = directLabelNames.length > 0 ? estimateDirectLabelWidth(directLabelNames) : 0
  // Filter labels by horizontal axis range
  const rangeIndices = filterLabelsByRange(data.labels, options.horizontalAxis?.range)
  const filteredLabels = rangeIndices.map(i => data.labels[i])
  series = series.map(s => ({ ...s, values: rangeIndices.map(i => s.values[i]) }))
  data = { ...data, labels: filteredLabels, series }

  const allValues = series.flatMap(s => s.values)
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

  const [domainMin, domainMax] = computeLinearDomain(allValues, options.verticalAxis?.range)

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

  renderVerticalAxis(chartArea, y, height, { ...options.verticalAxis, gridWidth: width, topPadding: margin.top }, priorVAxis)

  // When the vertical domain crosses zero, position the axis domain line at y=0
  const yDomain = y.domain() as number[]
  const zeroY = yDomain[0] < 0 && yDomain[1] > 0 ? (y(0) as number) : undefined
  renderHorizontalAxis(chartArea, xScale, height, { ...options.horizontalAxis, width, zeroY }, priorHAxis)

  // Clip chart content to the plot area so lines/areas/dots outside the domain are hidden
  const clipId = `bc-clip-${Math.random().toString(36).slice(2, 8)}`
  const svg = chartArea.ownerSVGElement!
  const clipDefs = d3.select(svg).select('defs').empty()
    ? d3.select(svg).append('defs')
    : d3.select(svg).select('defs')
  clipDefs.append('clipPath').attr('id', clipId)
    .append('rect').attr('width', width).attr('height', height)
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

  // Build flat dot data for tooltips/crosshair
  const dotData: DotDatum[] = []
  series.forEach((s, si) => {
    data.labels.forEach((label, li) => {
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

  const chart = new LineMultiChart(d3.select(clippedArea))
  chart.config({ xPos, y, colors, labels: data.labels, curve, areaFill: options.areaFill ?? false, areaFillOpacity: options.areaFillOpacity ?? 0.2, height, dots: dotData })

  // Re-insert prior elements so D3 data-join finds them and triggers merge:transition
  if (priorLines.length > 0 || priorAreas.length > 0 || priorDots.length > 0) {
    const groups = clippedArea.querySelectorAll(':scope > g')
    if (groups[0]) {
      priorAreas.forEach(el => groups[0].appendChild(el))
    }
    if (groups[1]) {
      priorLines.forEach(el => groups[1].appendChild(el))
    }
    if (groups[2]) {
      priorDots.forEach(el => groups[2].appendChild(el))
    }
  }

  chart.draw(seriesData)

  if (options.annotations?.length) {
    const annotationData = data.labels.map((l, i) => ({
      label: l,
      value: series[0]?.values[i] ?? 0,
    }))
    renderAnnotations(chartArea, options.annotations, { scaleX: xScale, scaleY: y, data: annotationData, width, height, backgroundColor: resolveBackgroundColor(container), transition, priorAnnotations })
  }

  // Per-series value labels: render directly so we control which series gets them
  const vlGroup = d3.select(clippedArea).append('g').attr('class', 'bc-value-labels')
  dotData.forEach((dot) => {
    if (!resolveSeriesValueLabels(dot.series, globalValueLabels, overrides)) {
      return
    }
    const cx = xPos(data.labels.indexOf(dot.label))
    const cy = y(dot.value) as number
    vlGroup.append('text')
      .attr('class', 'bc-value-label')
      .attr('x', cx)
      .attr('y', cy - 8)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', 'currentColor')
      .text(String(dot.value))
  })

  // Apply per-series overrides to lines
  if (overrides?.length) {
    d3.select(clippedArea).selectAll('.bc-line').each(function (this: SVGPathElement, d: unknown) {
      const datum = d as SeriesDatum
      const seriesColor = resolveSeriesColor(datum.name, datum.colorIndex, colors, overrides)
      const seriesWidth = resolveSeriesWidth(datum.name, overrides)
      const seriesDash = resolveSeriesDash(datum.name, overrides)
      const seriesInterp = resolveSeriesInterpolation(datum.name, options.interpolation ?? 'linear', overrides)

      const el = d3.select(this)
      el.attr('stroke', seriesColor)
        .attr('stroke-width', seriesWidth)

      if (seriesDash !== 'solid') {
        el.attr('stroke-dasharray', DASH_MAP[seriesDash] ?? '')
      }

      // Re-generate path if interpolation differs from global
      if (seriesInterp !== (options.interpolation ?? 'linear')) {
        const perCurve = resolveCurve(seriesInterp)
        const lineGen = d3.line<number>()
          .curve(perCurve)
          .x((_v, i) => xPos(i))
          .y(v => y(v))
        el.attr('d', lineGen(datum.values))
      }
    })

    // Apply per-series colors to area fills
    d3.select(clippedArea).selectAll('.bc-area').each(function (this: SVGPathElement, d: unknown) {
      const datum = d as SeriesDatum
      const seriesColor = resolveSeriesColor(datum.name, datum.colorIndex, colors, overrides)
      d3.select(this).attr('fill', seriesColor)
    })
  }

  // Default dots are invisible; proximity interaction handles tooltips/crosshair
  d3.select(clippedArea).selectAll('.bc-dot')
    .attr('fill-opacity', 0)
    .attr('stroke-opacity', 0)
    .attr('pointer-events', 'none')

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
      symbol: (resolved.symbolShape as LineSymbolConfig['symbol']) ?? symbolConfig?.symbol ?? 'circle',
      showOn: (resolved.symbolShowOn as LineSymbolConfig['showOn']) ?? symbolConfig?.showOn ?? 'firstLast',
      style: (resolved.symbolStyle as LineSymbolConfig['style']) ?? symbolConfig?.style ?? 'filled',
      size: resolved.symbolSize ?? symbolConfig?.size ?? 3.5,
      opacity: resolved.symbolOpacity ?? symbolConfig?.opacity ?? 1,
    }

    const symbolPoints = data.labels.map((_, li) => ({
      cx: xPos(li),
      cy: y(s.values[li]) as number,
      color: resolveSeriesColor(s.name, si, colors, overrides),
      index: li,
    }))
    const priorGroup = priorSymbolsGroups.find(el => el.getAttribute('data-series') === String(si))
    let symbolsGroup: d3.Selection<SVGGElement, unknown, null, undefined>
    if (priorGroup) {
      chartArea.appendChild(priorGroup)
      symbolsGroup = d3.select(priorGroup) as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
    }
    else {
      symbolsGroup = d3.select(chartArea).append('g').attr('class', 'bc-symbols').attr('data-series', si) as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
    }
    renderLineSymbols(symbolsGroup, symbolPoints, labelCount, perSeriesSymbolConfig, transition)
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
        .attr('data-series', entry.index)
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

  setCachedChart(container, { chartType: 'line-multi' })

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
  labelCount: number,
  y: d3.ScaleLinear<number, number>,
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
  y: d3.ScaleLinear<number, number>,
  curve: d3.CurveFactory,
  posColor: string,
  negColor: string,
  opacity: number,
): void {
  const n = fromValues.length
  if (n === 0) {
    return
  }

  // Build the list of points including intersection splits
  // Each point: { x, fromY (pixel), toY (pixel) }
  const points: AreaPoint[] = []
  for (let i = 0; i < n; i++) {
    const x = xPos(i)
    const fY = y(fromValues[i]) as number
    const tY = y(toValues[i]) as number
    points.push({ x, fromY: fY, toY: tY })

    if (i < n - 1) {
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
