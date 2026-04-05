import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import type { AxisOptions } from '../types'
import { detectDates, type DateGranularity } from '../date-parse'
import { getDefaultTransitionMs } from '../motion'
import { buildNumberFormatter } from '../format-helpers'

interface AxisDatum {
  placeholder: true
}

const MIN_LABEL_SPACING = 60
// Approximate px per character for SVG axis text (sans-serif ~11–12 px font size).
// Calibrated against Chromium rendering: "Jan 2024" (8 chars) measures ~88 px.
const AVG_CHAR_WIDTH_PX = 10

const AUTO_DATE_FORMATS: Record<string, string> = {
  year: '%Y',
  month: '%b %Y',
  day: '%b %-d, %Y',
  datetime: '%b %-d, %Y %H:%M',
}

type AnyXScale = d3.ScaleBand<string> | d3.ScalePoint<string> | d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>

function isOrdinalScale(scale: AnyXScale): scale is d3.ScaleBand<string> | d3.ScalePoint<string> {
  return typeof (scale as d3.ScaleBand<string>).step === 'function'
}

function buildTickFormatter(
  fmt: string | null,
  labels: string[],
): ((d: string | d3.NumberValue) => string) | null {
  const detected = detectDates(labels)

  if (fmt && fmt.includes('%')) {
    // Explicit time format specifier
    if (detected) {
      const timeFmt = d3.timeFormat(fmt)
      // For band scales, we get string domain values — map them to dates
      const dateMap = new Map<string, Date>()
      labels.forEach((l, i) => dateMap.set(l, detected.dates[i]))
      return (d: string | d3.NumberValue) => {
        // For time scales, d is a Date; for band scales, d is a string label
        if (d instanceof Date) {
          return timeFmt(d)
        }
        const date = dateMap.get(String(d))
        return date ? timeFmt(date) : String(d)
      }
    }
    // Format has % but labels aren't parseable dates — ignore
    return null
  }

  if (fmt) {
    // Numeric d3.format
    return (buildNumberFormatter(fmt) ?? d3.format(fmt)) as (d: string | d3.NumberValue) => string
  }

  // No explicit format — auto-format dates if detected
  if (detected) {
    const timeFmt = d3.timeFormat(AUTO_DATE_FORMATS[detected.granularity] ?? '%Y-%m-%d')
    const dateMap = new Map<string, Date>()
    labels.forEach((l, i) => dateMap.set(l, detected.dates[i]))
    return (d: string | d3.NumberValue) => {
      if (d instanceof Date) {
        return timeFmt(d)
      }
      const date = dateMap.get(String(d))
      return date ? timeFmt(date) : String(d)
    }
  }

  return null
}

function thinLabels(domain: string[], availableWidth: number): string[] {
  if (domain.length <= 1) {
    return domain
  }
  // Estimate the rendered width of the longest domain label. A 20% inflate
  // factor accounts for date formatters expanding raw values (e.g. "2024-01"
  // → "Jan 2024"), plus a fixed 8 px inter-label gap.
  const maxLen = domain.reduce((m, l) => Math.max(m, l.length), 0)
  const estLabelWidth = Math.ceil(maxLen * AVG_CHAR_WIDTH_PX * 1.2)
  const minSpacing = Math.max(MIN_LABEL_SPACING, estLabelWidth + 8)
  const maxLabels = Math.max(2, Math.floor(availableWidth / minSpacing))
  if (domain.length <= maxLabels) {
    return domain
  }
  const step = Math.ceil(domain.length / maxLabels)
  const result = domain.filter((_, i) => i % step === 0)
  // Always append the last label so the axis endpoint (data range end) is visible.
  const last = domain[domain.length - 1]
  if (result[result.length - 1] !== last) {
    result.push(last)
  }
  return result
}

export class HorizontalAxisChart extends D3Blueprint<AxisDatum[]> {
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
    this.configDefine('tickFormat', { defaultValue: null as ((label: string) => string) | null })

    const g = this.base.append('g')

    this.layer('axis', g, {
      dataBind: (sel, data) => sel.selectAll('.bc-axis-horizontal').data(data),
      insert: sel => sel.append('g').attr('class', 'bc-axis bc-axis-horizontal'),
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'merge:transition': (sel: any) => {
          const scale = this.config('scale') as d3.AxisScale<string | d3.NumberValue>
          const position = this.config('tickPosition') as string
          const height = this.config('height') as number
          const labelPos = this.config('labelPosition') as string
          const availableWidth = this.config('width') as number
          const axisFn = position === 'above'
            ? d3.axisTop(scale)
            : d3.axisBottom(scale)
          if (!this.config('showTicks')) {
            axisFn.tickSizeOuter(0)
          }
          let ticks = this.config('ticks') as (string & d3.NumberValue)[] | null
          const rawScale = this.config('scale') as AnyXScale
          if (!ticks && availableWidth > 0) {
            if (isOrdinalScale(rawScale)) {
              const domain = rawScale.domain()
              const thinned = thinLabels(domain, availableWidth)
              if (thinned.length < domain.length) {
                ticks = thinned as (string & d3.NumberValue)[]
              }
            }
            else {
              const maxTicks = Math.max(2, Math.floor(availableWidth / MIN_LABEL_SPACING))
              axisFn.ticks(maxTicks)
            }
          }
          if (ticks) {
            axisFn.tickValues(ticks)
          }
          const fmt = this.config('numberFormat') as string | null
          const labels = this.config('labels') as string[]
          const customTickFormat = this.config('tickFormat') as ((label: string) => string) | null
          if (customTickFormat) {
            axisFn.tickFormat(customTickFormat as (d: string | d3.NumberValue) => string)
          }
          else {
            const formatter = buildTickFormatter(fmt, labels)
            if (formatter) {
              axisFn.tickFormat(formatter)
            }
          }
          const translateY = position === 'above' ? 0 : height
          const ms = getDefaultTransitionMs()
          const axisNode = sel.node() as SVGGElement | null

          if (axisNode) {
            // Use a plain synchronous selection for ms=0 so text/tick updates are
            // applied immediately (D3 transitions defer even 0-duration tweens).
            if (ms > 0) {
              sel.attr('transform', `translate(0,${translateY})`)
              sel.duration(ms).call(axisFn)
            }
            else {
              d3.select(axisNode)
                .attr('transform', `translate(0,${translateY})`)
                .call(axisFn)
            }

            if (!this.config('showAxis')) {
              d3.select(axisNode).select('.domain').remove()
            }

            if (!this.config('showTicks')) {
              d3.select(axisNode).selectAll('.tick line').remove()
            }

            const AUTO_INSIDE_THRESHOLD = 400
            const effective = labelPos === 'auto'
              ? (availableWidth > 0 && availableWidth < AUTO_INSIDE_THRESHOLD ? 'inside' : 'outside')
              : labelPos

            if (effective === 'off') {
              d3.select(axisNode).selectAll('.tick text').remove()
            }
            else if (effective === 'inside') {
              d3.select(axisNode).selectAll('.tick text').attr('dy', '-0.6em')
            }
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'exit': (sel: any) => {
          sel.remove()
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'enter': (sel: any) => {
          const scale = this.config('scale') as d3.AxisScale<string | d3.NumberValue>
          const position = this.config('tickPosition') as string
          const labelPos = this.config('labelPosition') as string
          const height = this.config('height') as number
          const availableWidth = this.config('width') as number

          const axisFn = position === 'above'
            ? d3.axisTop(scale)
            : d3.axisBottom(scale)

          if (!this.config('showTicks')) {
            axisFn.tickSizeOuter(0)
          }

          let ticks = this.config('ticks') as (string & d3.NumberValue)[] | null

          const rawScale = this.config('scale') as AnyXScale
          if (!ticks && availableWidth > 0) {
            if (isOrdinalScale(rawScale)) {
              const domain = rawScale.domain()
              const thinned = thinLabels(domain, availableWidth)
              if (thinned.length < domain.length) {
                ticks = thinned as (string & d3.NumberValue)[]
              }
            }
            else {
              // For time/linear scales, limit tick count based on available width
              const maxTicks = Math.max(2, Math.floor(availableWidth / MIN_LABEL_SPACING))
              axisFn.ticks(maxTicks)
            }
          }

          if (ticks) {
            axisFn.tickValues(ticks)
          }

          const fmt = this.config('numberFormat') as string | null
          const labels = this.config('labels') as string[]
          const customTickFormat = this.config('tickFormat') as ((label: string) => string) | null
          if (customTickFormat) {
            axisFn.tickFormat(customTickFormat as (d: string | d3.NumberValue) => string)
          }
          else {
            const formatter = buildTickFormatter(fmt, labels)
            if (formatter) {
              axisFn.tickFormat(formatter)
            }
          }

          const translateY = position === 'above' ? 0 : height
          sel.attr('transform', `translate(0,${translateY})`)
          sel.call(axisFn)

          const showAxis = this.config('showAxis') as boolean
          if (!showAxis) {
            sel.select('.domain').remove()
          }
          else {
            // Move the domain line to y=0 when the vertical domain crosses zero
            const zeroY = this.config('zeroY') as number | null
            if (zeroY != null) {
              const offset = zeroY - (position === 'above' ? 0 : height)
              sel.select('.domain').attr('transform', `translate(0,${offset})`)
            }
          }

          if (!this.config('showTicks')) {
            sel.selectAll('.tick line').remove()
          }

          // Resolve effective label position — auto switches to inside on narrow charts
          const AUTO_INSIDE_THRESHOLD = 400
          const effective = labelPos === 'auto'
            ? (availableWidth > 0 && availableWidth < AUTO_INSIDE_THRESHOLD ? 'inside' : 'outside')
            : labelPos

          if (effective === 'off') {
            sel.selectAll('.tick text').remove()
          }
          else if (effective === 'inside') {
            // Position labels just inside the chart area (above the axis line)
            sel.selectAll('.tick text')
              .attr('dy', '-0.6em')
          }
        },
      },
    })
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

export function renderHorizontalAxis(
  chartArea: SVGGElement,
  scale: AnyXScale,
  height: number,
  options: AxisOptions = {},
  priorAxisElement?: Element | null,
): SVGGElement {
  const chart = new HorizontalAxisChart(d3.select(chartArea))

  // Re-insert prior axis element for D3 data-join transition
  if (priorAxisElement) {
    priorAxisElement.querySelectorAll('.bc-grid-line').forEach(el => el.remove())
    const wrapperG = chartArea.lastElementChild
    if (wrapperG) {
      wrapperG.appendChild(priorAxisElement)
    }
  }

  // Extract labels from band scale domain if available
  const labels = isOrdinalScale(scale)
    ? scale.domain()
    : []

  chart.config({
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
    tickFormat: options.tickFormat ?? null,
  })
  chart.draw([{ placeholder: true }])
  return chartArea.querySelector('.bc-axis-horizontal') as SVGGElement
}

export { thinLabels, buildTickFormatter, detectDates }
export type { AnyXScale, DateGranularity }
