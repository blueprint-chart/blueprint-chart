import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import type { AxisOptions } from '../types'
import { detectDates, type DateGranularity } from '../date-parse'

interface AxisDatum {
  placeholder: true
}

const MIN_LABEL_SPACING = 60

const AUTO_DATE_FORMATS: Record<string, string> = {
  year: '%Y',
  month: '%b %Y',
  day: '%b %-d, %Y',
  datetime: '%b %-d, %Y %H:%M',
}

type AnyXScale = d3.ScaleBand<string> | d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>

function isBandScale(scale: AnyXScale): scale is d3.ScaleBand<string> {
  return typeof (scale as d3.ScaleBand<string>).bandwidth === 'function'
}

function buildDateFormatter(
  timeFmt: (d: Date) => string,
  labels: string[],
  dates: Date[],
): (d: string | d3.NumberValue) => string {
  const dateMap = new Map<string, Date>()
  labels.forEach((l, i) => dateMap.set(l, dates[i]))
  return (d: string | d3.NumberValue) => {
    if (d instanceof Date) {
      return timeFmt(d)
    }
    const date = dateMap.get(String(d))
    return date ? timeFmt(date) : String(d)
  }
}

function buildTickFormatter(
  fmt: string | null,
  labels: string[],
): ((d: string | d3.NumberValue) => string) | null {
  const detected = detectDates(labels)

  if (fmt && fmt.includes('%')) {
    if (detected) {
      return buildDateFormatter(d3.timeFormat(fmt), labels, detected.dates)
    }
    return null
  }

  if (fmt) {
    return d3.format(fmt) as (d: string | d3.NumberValue) => string
  }

  if (detected) {
    const timeFmt = d3.timeFormat(AUTO_DATE_FORMATS[detected.granularity] ?? '%Y-%m-%d')
    return buildDateFormatter(timeFmt, labels, detected.dates)
  }

  return null
}

function thinLabels(domain: string[], availableWidth: number): string[] {
  if (domain.length <= 1) {
    return domain
  }
  const maxLabels = Math.max(2, Math.floor(availableWidth / MIN_LABEL_SPACING))
  if (domain.length <= maxLabels) {
    return domain
  }
  const step = Math.ceil(domain.length / maxLabels)
  const thinned: string[] = []
  for (let i = 0; i < domain.length; i += step) {
    thinned.push(domain[i])
  }
  // Always include the last label
  if (thinned[thinned.length - 1] !== domain[domain.length - 1]) {
    thinned.push(domain[domain.length - 1])
  }
  return thinned
}

const AUTO_INSIDE_THRESHOLD = 400

function resolveEffectiveLabelPosition(labelPos: string, availableWidth: number): string {
  if (labelPos !== 'auto') {
    return labelPos
  }
  return (availableWidth > 0 && availableWidth < AUTO_INSIDE_THRESHOLD) ? 'inside' : 'outside'
}

function configureAutoTicks(
  axisFn: d3.Axis<string | d3.NumberValue>,
  rawScale: AnyXScale,
  availableWidth: number,
  ticks: (string & d3.NumberValue)[] | null,
): (string & d3.NumberValue)[] | null {
  if (ticks || availableWidth <= 0) {
    return ticks
  }
  if (isBandScale(rawScale)) {
    const domain = rawScale.domain()
    if (domain.length > Math.floor(availableWidth / MIN_LABEL_SPACING)) {
      return thinLabels(domain, availableWidth) as (string & d3.NumberValue)[]
    }
  }
  else {
    const maxTicks = Math.max(2, Math.floor(availableWidth / MIN_LABEL_SPACING))
    axisFn.ticks(maxTicks)
  }
  return ticks
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyAxisDomain(sel: any, showAxis: boolean, zeroY: number | null, position: string, height: number): void {
  if (!showAxis) {
    sel.select('.domain').remove()
    return
  }
  if (zeroY != null) {
    const offset = zeroY - (position === 'above' ? 0 : height)
    sel.select('.domain').attr('transform', `translate(0,${offset})`)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyLabelPosition(sel: any, effective: string): void {
  if (effective === 'off') {
    sel.selectAll('.tick text').remove()
  }
  else if (effective === 'inside') {
    sel.selectAll('.tick text').attr('dy', '-0.6em')
  }
}

class HorizontalAxisChart extends D3Blueprint<AxisDatum[]> {
  initialize() {
    this.configDefine('scale', { defaultValue: d3.scaleBand<string>() as AnyXScale })
    this.configDefine('height', { defaultValue: 0 })
    this.configDefine('tickPosition', { defaultValue: 'below' })
    this.configDefine('showAxis', { defaultValue: true })
    this.configDefine('showTicks', { defaultValue: false })
    this.configDefine('gridStyle', { defaultValue: 'dashed' })
    this.configDefine('ticks', { defaultValue: null as unknown[] | null })
    this.configDefine('numberFormat', { defaultValue: null as string | null })
    this.configDefine('width', { defaultValue: 0 })
    this.configDefine('labels', { defaultValue: [] as string[] })
    this.configDefine('labelPosition', { defaultValue: 'auto' })
    this.configDefine('zeroY', { defaultValue: null as number | null })

    const g = this.base.append('g')

    this.layer('axis', g, {
      dataBind: (sel, data) => sel.selectAll('.bc-axis-horizontal').data(data),
      insert: sel => sel.append('g').attr('class', 'bc-axis bc-axis-horizontal'),
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        enter: (sel: any) => this.renderAxis(sel),
      },
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private renderAxis(sel: any): void {
    const scale = this.config('scale') as d3.AxisScale<string | d3.NumberValue>
    const position = this.config('tickPosition') as string
    const height = this.config('height') as number
    const availableWidth = this.config('width') as number

    const axisFn = this.buildAxisFn(scale, position, availableWidth)
    sel.attr('transform', `translate(0,${position === 'above' ? 0 : height})`)
    sel.call(axisFn)

    applyAxisDomain(sel, this.config('showAxis') as boolean, this.config('zeroY') as number | null, position, height)
    if (!this.config('showTicks')) {
      sel.selectAll('.tick line').remove()
    }

    const effective = resolveEffectiveLabelPosition(this.config('labelPosition') as string, availableWidth)
    applyLabelPosition(sel, effective)
  }

  private buildAxisFn(scale: d3.AxisScale<string | d3.NumberValue>, position: string, availableWidth: number): d3.Axis<string | d3.NumberValue> {
    const axisFn = position === 'above' ? d3.axisTop(scale) : d3.axisBottom(scale)
    if (!this.config('showTicks')) {
      axisFn.tickSizeOuter(0)
    }

    const rawScale = this.config('scale') as AnyXScale
    const ticks = configureAutoTicks(axisFn, rawScale, availableWidth, this.config('ticks') as (string & d3.NumberValue)[] | null)
    if (ticks) {
      axisFn.tickValues(ticks)
    }

    const formatter = buildTickFormatter(this.config('numberFormat') as string | null, this.config('labels') as string[])
    if (formatter) {
      axisFn.tickFormat(formatter)
    }
    return axisFn
  }

  postDraw() {
    const gridStyle = this.config('gridStyle') as string
    const height = this.config('height') as number
    const g = this.base.select('.bc-axis-horizontal').node() as SVGGElement
    if (!g) {
      return
    }

    if (gridStyle !== 'none' && height > 0) {
      applyGridLines(g, gridStyle, height)
    }
  }
}

function applyGridLines(g: SVGGElement, style: string, height: number): void {
  const root = g.ownerSVGElement?.parentElement ?? document.documentElement
  const cs = getComputedStyle(root)
  const gridColor = cs.getPropertyValue('--bc-grid-color').trim() || '#ccc'

  const ticks = d3.select(g).selectAll<SVGGElement, unknown>('.tick')
  ticks.each(function () {
    const tick = d3.select(this)
    const line = tick.append('line')
      .attr('class', 'bc-grid-line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 0)
      .attr('y2', -height)
      .attr('stroke', gridColor)
      .attr('stroke-width', 1)

    if (style === 'dashed') {
      line.attr('stroke-dasharray', '4,4')
    }
    else if (style === 'dotted') {
      line.attr('stroke-dasharray', '1,3')
    }
  })
}

function buildHorizontalAxisConfig(scale: AnyXScale, height: number, options: AxisOptions): Record<string, unknown> {
  const labels = isBandScale(scale) ? scale.domain() : []
  return {
    scale,
    height,
    tickPosition: options.tickPosition ?? 'below',
    showAxis: options.showAxis ?? true,
    showTicks: options.showTicks ?? false,
    gridStyle: options.gridStyle ?? 'dashed',
    ticks: options.ticks ?? null,
    numberFormat: options.numberFormat ?? null,
    width: options.width ?? 0,
    labels,
    labelPosition: options.labelPosition ?? 'auto',
    zeroY: options.zeroY ?? null,
  }
}

export function renderHorizontalAxis(
  chartArea: SVGGElement,
  scale: AnyXScale,
  height: number,
  options: AxisOptions = {},
): SVGGElement {
  const chart = new HorizontalAxisChart(d3.select(chartArea))
  chart.config(buildHorizontalAxisConfig(scale, height, options))
  chart.draw([{ placeholder: true }])
  return chartArea.querySelector('.bc-axis-horizontal') as SVGGElement
}

export { thinLabels, buildTickFormatter, detectDates }
export type { AnyXScale, DateGranularity }
