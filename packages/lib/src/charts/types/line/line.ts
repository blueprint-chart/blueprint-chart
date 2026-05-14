import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import { widen } from '../../d3-types'
import type { ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas, contentSize, labelPositionMargins, estimateVerticalLabelWidth, computeMarginDelta } from '../../canvas/canvas'
import { AxisService } from '../../axis/axis-service'
import type { AnyXScale } from '../../axis/horizontal-axis'
import { computeLinearDomain, filterLabelsByRange } from '../../scale-helpers'
import { resolveCurve } from '../../curves'
import { createValueLabelPlugin } from '../../plugins/value-labels'
import { renderAnnotations, snapshotAnnotations, type AnnotationSnapshot } from '../../plugins/annotations'
import { resolveBackgroundColor } from '../../contrast'
import { setupProximityInteraction } from '../../plugins/proximity'
import { renderLineSymbols } from '../../line-symbols'
import { getDefaultTransitionMs, setRenderTransition, fadeIn, snapshotForFadeOut, commitFadeOut, reinsertWithOffset } from '../../motion'
import { getCachedChart, setCachedChart } from '../../transition-cache'
import { Orientation } from '../../../enums'

export const DEFAULT_COLOR = '#4e79a7'

interface LineDatum {
  label: string
  value: number
}

class LineChart extends D3Blueprint<LineDatum[]> {
  initialize() {
    this.configDefine('xPos', { defaultValue: (_d: LineDatum, _i: number) => 0 })
    this.configDefine('y', { defaultValue: d3.scaleLinear() })
    this.configDefine('color', { defaultValue: DEFAULT_COLOR })
    this.configDefine('curve', { defaultValue: d3.curveLinear })
    this.configDefine('areaFill', { defaultValue: false })
    this.configDefine('areaFillOpacity', { defaultValue: 0.2 })
    this.configDefine('height', { defaultValue: 0 })

    const areaGroup = widen(this.base.append('g'))
    const lineGroup = widen(this.base.append('g'))
    const dotsGroup = widen(this.base.append('g'))

    this.layer('area', areaGroup, {
      dataBind: (sel, data) => widen(sel.selectAll('.bc-area').data(this.config('areaFill') ? [data] : [])),
      insert: sel => widen(sel.append('path').attr('class', 'bc-area')),
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'enter': (sel: any) => {
          const xPos = this.config('xPos') as (d: LineDatum, i: number) => number
          const y = this.config('y') as d3.ScaleLinear<number, number>
          const color = this.config('color') as string
          const curve = this.config('curve') as d3.CurveFactory
          const h = this.config('height') as number
          const opacity = this.config('areaFillOpacity') as number
          const areaGen = d3.area<LineDatum>()
            .curve(curve)
            .x((d, i) => xPos(d, i))
            .y0(h)
            .y1(d => y(d.value))
          sel
            .attr('fill', color)
            .attr('opacity', opacity)
            .attr('d', areaGen)
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'merge:transition': (sel: any) => {
          const xPos = this.config('xPos') as (d: LineDatum, i: number) => number
          const y = this.config('y') as d3.ScaleLinear<number, number>
          const color = this.config('color') as string
          const curve = this.config('curve') as d3.CurveFactory
          const h = this.config('height') as number
          const opacity = this.config('areaFillOpacity') as number
          const areaGen = d3.area<LineDatum>()
            .curve(curve)
            .x((d, i) => xPos(d, i))
            .y0(h)
            .y1(d => y(d.value))
          sel.duration(getDefaultTransitionMs())
            .attr('fill', color)
            .attr('opacity', opacity)
            .attr('d', areaGen)
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'exit:transition': (sel: any) => {
          sel.duration(getDefaultTransitionMs())
            .attr('opacity', 0)
            .remove()
        },
      },
    })

    this.layer('line', lineGroup, {
      dataBind: (sel, data) => widen(sel.selectAll('.bc-line').data([data])),
      insert: sel => widen(sel.append('path').attr('class', 'bc-line')),
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'enter': (sel: any) => {
          const xPos = this.config('xPos') as (d: LineDatum, i: number) => number
          const y = this.config('y') as d3.ScaleLinear<number, number>
          const color = this.config('color') as string
          const curve = this.config('curve') as d3.CurveFactory
          const lineGen = d3.line<LineDatum>()
            .curve(curve)
            .x((d, i) => xPos(d, i))
            .y(d => y(d.value))
          sel
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 2)
            .attr('d', lineGen)
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'merge:transition': (sel: any) => {
          const xPos = this.config('xPos') as (d: LineDatum, i: number) => number
          const y = this.config('y') as d3.ScaleLinear<number, number>
          const color = this.config('color') as string
          const curve = this.config('curve') as d3.CurveFactory
          const lineGen = d3.line<LineDatum>()
            .curve(curve)
            .x((d, i) => xPos(d, i))
            .y(d => y(d.value))
          sel.duration(getDefaultTransitionMs())
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 2)
            .attr('d', lineGen)
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
      dataBind: (sel, data) => widen(sel.selectAll('.bc-dot').data(data, (d: LineDatum) => d.label)),
      insert: sel => widen(sel.append('circle').attr('class', 'bc-dot')),
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'enter': (sel: any) => {
          const xPos = this.config('xPos') as (d: LineDatum, i: number) => number
          const y = this.config('y') as d3.ScaleLinear<number, number>
          const color = this.config('color') as string
          sel
            .attr('cx', (d: LineDatum, i: number) => xPos(d, i))
            .attr('cy', (d: LineDatum) => y(d.value))
            .attr('r', 3)
            .attr('fill', color)
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'merge:transition': (sel: any) => {
          const xPos = this.config('xPos') as (d: LineDatum, i: number) => number
          const y = this.config('y') as d3.ScaleLinear<number, number>
          const color = this.config('color') as string
          sel.duration(getDefaultTransitionMs())
            .attr('cx', (d: LineDatum, i: number) => xPos(d, i))
            .attr('cy', (d: LineDatum) => y(d.value))
            .attr('r', 3)
            .attr('fill', color)
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
  data: ChartData,
  options: ChartOptions = {},
  transition = false,
): void {
  setRenderTransition(transition)
  // Preserve existing data elements for smooth D3 data-join transitions
  let priorAreas: Element[] = []
  let priorLines: Element[] = []
  let priorDots: Element[] = []
  let priorSymbolsGroup: Element | null = null
  let fadeOverlay: HTMLElement | null = null
  let priorAnnotations: Map<string, AnnotationSnapshot> | undefined
  let priorMargin: { top: number, left: number } | undefined
  const axes = AxisService.for(container)
  if (transition) {
    const cached = getCachedChart(container)
    priorMargin = cached?.margin
    axes.detach()
    if (cached?.chartType === 'line') {
      priorAreas = Array.from(container.querySelectorAll('.bc-frame .bc-area'))
      priorLines = Array.from(container.querySelectorAll('.bc-frame .bc-line'))
      priorDots = Array.from(container.querySelectorAll('.bc-frame .bc-dot'))
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

  const lineData: LineDatum[] = filteredLabels.map((l, i) => ({
    label: l,
    value: filteredValues[i],
  }))

  const pointScale = d3.scalePoint<string>()
    .domain(filteredLabels)
    .range([0, width])
    .padding(options.edgePadding ? 0.6 : 0)
  const xScale: AnyXScale = pointScale
  const xPos = (d: LineDatum) => pointScale(d.label) ?? 0

  const useLog = options.verticalAxis?.scaleType === 'log'
  const [domainMin, domainMax] = computeLinearDomain(filteredValues, options.verticalAxis?.range)
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
  const clipId = `bc-clip-${Math.random().toString(36).slice(2, 8)}`
  const svg = chartArea.ownerSVGElement!
  const defs = d3.select(svg).select('defs').empty()
    ? d3.select(svg).append('defs')
    : d3.select(svg).select('defs')
  defs.append('clipPath').attr('id', clipId)
    .append('rect').attr('width', width).attr('height', height)
  const clippedGroup = d3.select(chartArea).append('g').attr('clip-path', `url(#${clipId})`)
  const clippedArea = clippedGroup.node() as SVGGElement

  const color = options.colors?.[0] ?? DEFAULT_COLOR
  const curve = resolveCurve(options.interpolation)

  const symbolConfig = options.lineSymbols

  const chart = new LineChart(widen(d3.select(clippedArea)))
  chart.config({ xPos, y, color, curve, areaFill: options.areaFill ?? false, areaFillOpacity: options.areaFillOpacity ?? 0.2, height })
  // Re-insert prior elements so D3 data-join finds them and triggers merge:transition
  if (priorLines.length > 0 || priorAreas.length > 0 || priorDots.length > 0) {
    const dx = marginDelta?.dx ?? 0
    const dy = marginDelta?.dy ?? 0
    const groups = clippedArea.querySelectorAll(':scope > g')
    if (groups[0]) {
      reinsertWithOffset(groups[0], priorAreas, dx, dy)
    }
    if (groups[1]) {
      reinsertWithOffset(groups[1], priorLines, dx, dy)
    }
    if (groups[2]) {
      reinsertWithOffset(groups[2], priorDots, dx, dy)
    }
  }
  if (options.valueLabels) {
    chart.use(createValueLabelPlugin({ position: options.valueLabelPosition, orientation: Orientation.Vertical }))
  }
  chart.draw(lineData)

  if (options.annotations?.length) {
    renderAnnotations(chartArea, options.annotations, { scaleX: xScale, scaleY: y, data: lineData, width, height, backgroundColor: resolveBackgroundColor(container), transition, priorAnnotations })
  }

  // Default dots are invisible; proximity interaction handles tooltips/crosshair
  d3.select(clippedArea).selectAll('.bc-dot')
    .attr('fill-opacity', 0)
    .attr('stroke-opacity', 0)
    .attr('pointer-events', 'none')

  if (options.tooltips || options.crosshair) {
    const proximityPoints = lineData.map((d, i) => ({
      cx: xPos(d, i),
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
    })
  }

  if (symbolConfig) {
    const symbolPoints = lineData.map((d, i) => ({
      cx: xPos(d, i),
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
    renderLineSymbols(symbolsGroup, symbolPoints, lineData.length, symbolConfig, transition)
  }

  setCachedChart(container, { chartType: 'line', margin })

  if (fadeOverlay) {
    fadeIn(clippedGroup.node()!)
    commitFadeOut(container, fadeOverlay)
  }
}
