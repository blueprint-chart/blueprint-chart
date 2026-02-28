import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import type { ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas, labelPositionMargins, estimateVerticalLabelWidth } from '../../canvas/canvas'
import { renderVerticalAxis } from '../../axis/vertical-axis'
import { renderHorizontalAxis, type AnyXScale } from '../../axis/horizontal-axis'
import { detectDates } from '../../date-parse'
import { computeLinearDomain } from '../../scale-helpers'
import { resolveCurve } from '../../curves'
import { createValueLabelPlugin } from '../../plugins/value-labels'
import { createAnnotationPlugin } from '../../plugins/annotations'
import { setupProximityInteraction } from '../../plugins/proximity'
import { renderLineSymbols } from '../../line-symbols'

const DEFAULT_COLOR = '#4e79a7'

interface LineDatum {
  label: string
  value: number
}

class LineChart extends D3Blueprint<LineDatum[]> {
  initialize() {
    this.defineLineConfigs()
    const areaGroup = this.base.append('g')
    const lineGroup = this.base.append('g')
    const dotsGroup = this.base.append('g')

    this.layer('area', areaGroup, {
      dataBind: (sel, data) => sel.selectAll('.bc-area').data(this.config('areaFill') ? [data] : []),
      insert: sel => sel.append('path').attr('class', 'bc-area'),
      events: { enter: this.enterArea.bind(this) },
    })

    this.layer('line', lineGroup, {
      dataBind: (sel, data) => sel.selectAll('.bc-line').data([data]),
      insert: sel => sel.append('path').attr('class', 'bc-line'),
      events: { enter: this.enterLine.bind(this) },
    })

    this.layer('dots', dotsGroup, {
      dataBind: (sel, data) => sel.selectAll('.bc-dot').data(data),
      insert: sel => sel.append('circle').attr('class', 'bc-dot'),
      events: { enter: this.enterDots.bind(this) },
    })
  }

  private defineLineConfigs() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.configDefine('xPos', { defaultValue: (d: LineDatum, i: number) => 0 })
    this.configDefine('y', { defaultValue: d3.scaleLinear() })
    this.configDefine('color', { defaultValue: DEFAULT_COLOR })
    this.configDefine('curve', { defaultValue: d3.curveLinear })
    this.configDefine('areaFill', { defaultValue: false })
    this.configDefine('areaFillOpacity', { defaultValue: 0.2 })
    this.configDefine('height', { defaultValue: 0 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private enterArea(sel: any) {
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
    sel.attr('fill', color).attr('opacity', opacity).attr('d', areaGen)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private enterLine(sel: any) {
    const xPos = this.config('xPos') as (d: LineDatum, i: number) => number
    const y = this.config('y') as d3.ScaleLinear<number, number>
    const color = this.config('color') as string
    const curve = this.config('curve') as d3.CurveFactory
    const lineGen = d3.line<LineDatum>()
      .curve(curve)
      .x((d, i) => xPos(d, i))
      .y(d => y(d.value))
    sel.attr('fill', 'none').attr('stroke', color).attr('stroke-width', 2).attr('d', lineGen)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private enterDots(sel: any) {
    const xPos = this.config('xPos') as (d: LineDatum, i: number) => number
    const y = this.config('y') as d3.ScaleLinear<number, number>
    const color = this.config('color') as string
    sel
      .attr('cx', (d: LineDatum, i: number) => xPos(d, i))
      .attr('cy', (d: LineDatum) => y(d.value))
      .attr('r', 3)
      .attr('fill', color)
  }
}

export function render(
  container: HTMLElement,
  data: ChartData,
  options: ChartOptions = {},
): void {
  const { body } = createFrame(container, options.frame)
  const containerWidth = body.getBoundingClientRect().width
  const vLabelW = estimateVerticalLabelWidth(data.values, options.verticalAxis?.range, options.verticalAxis?.numberFormat, options.verticalAxis?.scaleType)
  const lpMargins = labelPositionMargins(containerWidth, options.verticalAxis?.labelPosition, options.horizontalAxis?.labelPosition, options.verticalAxis?.direction, vLabelW)
  const { chartArea, width, height, margin } = createCanvas(body, lpMargins)

  const lineData: LineDatum[] = data.labels.map((l, i) => ({ label: l, value: data.values[i] }))
  const { xScale, xPos } = buildLineXScale(data, width, options)
  const y = buildLineYScale(data, height, options)

  renderLineAxes(chartArea, xScale, y, width, height, margin, options)
  const clippedArea = createLineClipGroup(chartArea, width, height)

  drawLineChart(clippedArea, chartArea, lineData, xScale, xPos, y, width, height, options)
}

function buildLineXScale(data: ChartData, width: number, options: ChartOptions) {
  const dateInfo = detectDates(data.labels)
  const numericLabels = !dateInfo && data.labels.every(l => !isNaN(Number(l)) && l.trim() !== '')

  if (dateInfo) {
    const dates = dateInfo.dates
    const hRange = options.horizontalAxis?.range
    const minDate = hRange?.min != null ? new Date(hRange.min) : d3.min(dates)!
    const maxDate = hRange?.max != null ? new Date(hRange.max) : d3.max(dates)!
    const timeScale = d3.scaleTime().domain([minDate, maxDate]).range([0, width])
    return { xScale: timeScale as AnyXScale, xPos: (_d: LineDatum, i: number) => timeScale(dates[i]) }
  }
  if (numericLabels) {
    const nums = data.labels.map(Number)
    const hRange = options.horizontalAxis?.range
    const minVal = hRange?.min ?? d3.min(nums)!
    const maxVal = hRange?.max ?? d3.max(nums)!
    const linearScale = d3.scaleLinear().domain([minVal, maxVal]).range([0, width])
    return { xScale: linearScale as AnyXScale, xPos: (_d: LineDatum, i: number) => linearScale(nums[i]) }
  }
  const bandScale = d3.scaleBand<string>().domain(data.labels).range([0, width]).padding(0.5)
  return { xScale: bandScale as AnyXScale, xPos: (d: LineDatum) => (bandScale(d.label) ?? 0) + bandScale.bandwidth() / 2 }
}

function buildLineYScale(data: ChartData, height: number, options: ChartOptions) {
  const useLog = options.verticalAxis?.scaleType === 'log'
  const [domainMin, domainMax] = computeLinearDomain(data.values, options.verticalAxis?.range)
  return useLog
    ? d3.scaleSymlog().domain([domainMin, domainMax]).nice().range([height, 0])
    : d3.scaleLinear().domain([domainMin, domainMax]).nice().range([height, 0])
}

function renderLineAxes(
  chartArea: SVGGElement,
  xScale: AnyXScale,
  y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  width: number,
  height: number,
  margin: { top: number },
  options: ChartOptions,
) {
  renderVerticalAxis(chartArea, y, height, { ...options.verticalAxis, gridWidth: width, topPadding: margin.top })
  const yDomain = y.domain() as number[]
  const zeroY = yDomain[0] < 0 && yDomain[1] > 0 ? (y(0) as number) : undefined
  renderHorizontalAxis(chartArea, xScale, height, { ...options.horizontalAxis, width, zeroY })
}

function createLineClipGroup(chartArea: SVGGElement, width: number, height: number): SVGGElement {
  const clipId = `bc-clip-${Math.random().toString(36).slice(2, 8)}`
  const svg = chartArea.ownerSVGElement!
  const defs = d3.select(svg).select('defs').empty()
    ? d3.select(svg).append('defs')
    : d3.select(svg).select('defs')
  defs.append('clipPath').attr('id', clipId)
    .append('rect').attr('width', width).attr('height', height)
  const clippedGroup = d3.select(chartArea).append('g').attr('clip-path', `url(#${clipId})`)
  return clippedGroup.node() as SVGGElement
}

function createLineChartBlueprint(
  clippedArea: SVGGElement, lineData: LineDatum[], xScale: AnyXScale,
  xPos: (d: LineDatum, i: number) => number, y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  color: string, options: ChartOptions, height: number,
): void {
  const curve = resolveCurve(options.interpolation)
  const chart = new LineChart(d3.select(clippedArea))
  chart.config({ xPos, y, color, curve, areaFill: options.areaFill ?? false, areaFillOpacity: options.areaFillOpacity ?? 0.2, height })
  if (options.valueLabels) {
    chart.use(createValueLabelPlugin({ position: options.valueLabelPosition, orientation: 'vertical' }))
  }
  if (options.annotations?.length) {
    chart.use(createAnnotationPlugin(options.annotations, xScale as d3.ScaleBand<string>, y, lineData))
  }
  chart.draw(lineData)
  d3.select(clippedArea).selectAll('.bc-dot')
    .attr('fill-opacity', 0).attr('stroke-opacity', 0).attr('pointer-events', 'none')
}

function drawLineChart(
  clippedArea: SVGGElement,
  chartArea: SVGGElement,
  lineData: LineDatum[],
  xScale: AnyXScale,
  xPos: (d: LineDatum, i: number) => number,
  y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  width: number,
  height: number,
  options: ChartOptions,
) {
  const color = options.colors?.[0] ?? DEFAULT_COLOR
  createLineChartBlueprint(clippedArea, lineData, xScale, xPos, y, color, options, height)
  setupLineInteraction(chartArea, lineData, xPos, y, color, width, height, options)
  renderLineChartSymbols(chartArea, lineData, xPos, y, color, options)
}

function buildLineProximityPoints(lineData: LineDatum[], xPos: (d: LineDatum, i: number) => number, y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>, color: string) {
  return lineData.map((d, i) => ({
    cx: xPos(d, i), cy: y(d.value) as number,
    label: d.label, value: d.value, color,
  }))
}

function setupLineInteraction(
  chartArea: SVGGElement,
  lineData: LineDatum[],
  xPos: (d: LineDatum, i: number) => number,
  y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  color: string,
  width: number,
  height: number,
  options: ChartOptions,
) {
  if (!options.tooltips && !options.crosshair) {
    return
  }
  setupProximityInteraction(chartArea, {
    width, height,
    points: buildLineProximityPoints(lineData, xPos, y, color),
    tooltip: options.tooltips,
    crosshair: options.crosshair,
    crosshairDirection: options.crosshairDirection,
    crosshairStyle: options.crosshairStyle,
    crosshairColor: options.crosshairColor,
  })
}

function renderLineChartSymbols(
  chartArea: SVGGElement,
  lineData: LineDatum[],
  xPos: (d: LineDatum, i: number) => number,
  y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  color: string,
  options: ChartOptions,
) {
  if (!options.lineSymbols) {
    return
  }
  const symbolPoints = lineData.map((d, i) => ({
    cx: xPos(d, i),
    cy: y(d.value) as number,
    color,
    index: i,
  }))
  const symbolsGroup = d3.select(chartArea).append('g').attr('class', 'bc-symbols')
  renderLineSymbols(symbolsGroup as unknown as d3.Selection<SVGGElement, unknown, null, undefined>, symbolPoints, lineData.length, options.lineSymbols)
}
