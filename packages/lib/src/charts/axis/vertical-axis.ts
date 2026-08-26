import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import type { AxisOptions } from '../types'
import { AxisDirection, GridStyle, LabelPosition } from '../../enums'
import { getDefaultTransitionMs } from '../motion'
import { buildNumberFormatter } from '../format-helpers'
import { logTickValues } from '../scale-helpers'

interface AxisDatum {
  placeholder: true
}

const MIN_LABEL_HEIGHT_SPACING = 30

// A band scale carries category strings, which a numeric format turns into NaN.
function isBandScale(scale: d3.AxisScale<string | d3.NumberValue>): boolean {
  return typeof (scale as d3.ScaleBand<string>).bandwidth === 'function'
}

export class VerticalAxisChart extends D3Blueprint<AxisDatum[]> {
  initialize() {
    this.configDefine('scale', { defaultValue: d3.scaleLinear() })
    this.configDefine('direction', { defaultValue: AxisDirection.Left })
    this.configDefine('showAxis', { defaultValue: true })
    this.configDefine('showTicks', { defaultValue: false })
    this.configDefine('gridStyle', { defaultValue: GridStyle.Dashed })
    this.configDefine('gridWidth', { defaultValue: 0 })
    this.configDefine('height', { defaultValue: 0 })
    this.configDefine('ticks', { defaultValue: null as number[] | null })
    this.configDefine('numberFormat', { defaultValue: null as string | null })
    this.configDefine('labelPosition', { defaultValue: LabelPosition.Auto })
    this.configDefine('topPadding', { defaultValue: 0 })
    this.configDefine('tickFormat', { defaultValue: null as ((label: string) => string) | null })

    const g = this.base.append('g')

    this.layer('axis', g, {
      dataBind: (sel, data) => sel.selectAll('.bc-axis-vertical').data(data),
      insert: sel => sel.append('g').attr('class', 'bc-axis bc-axis-vertical'),
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'merge:transition': (sel: any) => {
          const scale = this.config('scale') as d3.AxisScale<string | d3.NumberValue>
          const direction = this.config('direction') as string
          const showAxis = this.config('showAxis') as boolean
          const showTicks = this.config('showTicks') as boolean
          const labelPos = this.config('labelPosition') as string
          const chartWidth = this.config('gridWidth') as number
          const availableHeight = this.config('height') as number
          const axisFn = direction === AxisDirection.Right ? d3.axisRight(scale) : d3.axisLeft(scale)
          if (!showTicks) {
            axisFn.tickSizeOuter(0)
          }
          const ticks = this.config('ticks') as number[] | null
          if (ticks) {
            axisFn.tickValues(ticks as unknown as (string & d3.NumberValue)[])
          }
          else if (availableHeight > 0) {
            const maxTicks = Math.max(2, Math.floor(availableHeight / MIN_LABEL_HEIGHT_SPACING))
            const decades = logTickValues(scale, maxTicks)
            if (decades) {
              axisFn.tickValues(decades as unknown as (string & d3.NumberValue)[])
            }
            else {
              axisFn.ticks(maxTicks)
            }
          }
          const customTickFormat = this.config('tickFormat') as ((label: string) => string) | null
          if (customTickFormat) {
            axisFn.tickFormat(customTickFormat as (d: string | d3.NumberValue) => string)
          }
          else {
            const fmt = this.config('numberFormat') as string | null
            const fmtFn = fmt && !isBandScale(scale) ? buildNumberFormatter(fmt) : null
            if (fmtFn) {
              axisFn.tickFormat(fmtFn as (d: string | d3.NumberValue) => string)
            }
          }
          const ms = getDefaultTransitionMs()
          const axisNode = sel.node() as SVGGElement | null

          if (axisNode) {
            // Use a plain synchronous selection for ms=0 so text/tick updates are
            // applied immediately (D3 transitions defer even 0-duration tweens).
            if (ms > 0) {
              sel.duration(ms).call(axisFn)
            }
            else {
              d3.select(axisNode).call(axisFn)
            }

            // Hide axis domain line when showAxis is off
            if (!showAxis) {
              d3.select(axisNode).select('.domain').remove()
            }

            // Hide tick lines when showTicks is off (must run for all label positions)
            if (!showTicks) {
              d3.select(axisNode).selectAll('.tick line').attr('opacity', 0)
            }

            // Reapply inside label positioning (D3 axisFn resets to defaults)
            const AUTO_INSIDE_THRESHOLD = 400
            const effective = labelPos === LabelPosition.Auto
              ? (chartWidth > 0 && chartWidth < AUTO_INSIDE_THRESHOLD ? LabelPosition.Inside : LabelPosition.Outside)
              : labelPos
            if (effective === LabelPosition.Inside) {
              const padding = showAxis ? 4 : 0
              // When ms > 0, `sel` is the d3 transition created above; writing on
              // `sel.selectAll(...)` makes these attribute writes part of the same
              // tween so they win against axisFn's default tick-text positioning
              // (which targets x=-9 for axisLeft / x=9 for axisRight).
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const tickTextSel: any = ms > 0
                ? sel.selectAll('.tick text')
                : d3.select(axisNode).selectAll('.tick text')
              if (direction === AxisDirection.Right) {
                tickTextSel
                  .attr('x', -padding)
                  .attr('dy', '-0.4em')
                  .attr('text-anchor', 'end')
              }
              else {
                tickTextSel
                  .attr('x', padding)
                  .attr('dy', '-0.4em')
                  .attr('text-anchor', 'start')
              }
            }
            else if (effective === LabelPosition.Off) {
              d3.select(axisNode).selectAll('.tick text').attr('opacity', 0)
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
          const direction = this.config('direction') as string
          const labelPos = this.config('labelPosition') as string
          const chartWidth = this.config('gridWidth') as number
          const availableHeight = this.config('height') as number
          const topPadding = this.config('topPadding') as number
          const axisFn = direction === AxisDirection.Right ? d3.axisRight(scale) : d3.axisLeft(scale)

          if (!this.config('showTicks')) {
            axisFn.tickSizeOuter(0)
          }

          const ticks = this.config('ticks') as number[] | null
          if (ticks) {
            axisFn.tickValues(ticks as unknown as (string & d3.NumberValue)[])
          }
          else if (availableHeight > 0) {
            const maxTicks = Math.max(2, Math.floor(availableHeight / MIN_LABEL_HEIGHT_SPACING))
            const decades = logTickValues(scale, maxTicks)
            if (decades) {
              axisFn.tickValues(decades as unknown as (string & d3.NumberValue)[])
            }
            else {
              axisFn.ticks(maxTicks)
            }
          }

          const customTickFormat = this.config('tickFormat') as ((label: string) => string) | null
          if (customTickFormat) {
            axisFn.tickFormat(customTickFormat as (d: string | d3.NumberValue) => string)
          }
          else {
            const fmt = this.config('numberFormat') as string | null
            const fmtFn = fmt && !isBandScale(scale) ? buildNumberFormatter(fmt) : null
            if (fmtFn) {
              axisFn.tickFormat(fmtFn as (d: string | d3.NumberValue) => string)
            }
          }

          sel.call(axisFn)

          const showAxis = this.config('showAxis') as boolean
          const showTicks = this.config('showTicks') as boolean

          if (!showAxis) {
            sel.select('.domain').remove()
          }

          // Resolve effective label position — auto switches to inside on narrow charts
          const AUTO_INSIDE_THRESHOLD = 400
          const effective = labelPos === LabelPosition.Auto
            ? (chartWidth > 0 && chartWidth < AUTO_INSIDE_THRESHOLD ? LabelPosition.Inside : LabelPosition.Outside)
            : labelPos

          if (effective === LabelPosition.Inside) {
            // Inside labels: position inside the chart area, just above the grid line
            const padding = showAxis ? 4 : 0

            if (direction === AxisDirection.Right) {
              sel.selectAll('.tick text')
                .attr('x', -padding)
                .attr('dy', '-0.4em')
                .attr('text-anchor', 'end')
            }
            else {
              sel.selectAll('.tick text')
                .attr('x', padding)
                .attr('dy', '-0.4em')
                .attr('text-anchor', 'start')
            }

            // Flip tick lines inward when ticks are visible
            if (showTicks) {
              const tickSize = 6
              sel.selectAll('.tick line')
                .attr('x2', direction === AxisDirection.Right ? -tickSize : tickSize)
            }
            else {
              sel.selectAll('.tick line').remove()
            }

            // Extend the axis domain line upward to fill the top padding
            if (topPadding > 0 && showAxis) {
              const domain = sel.select('.domain')
              if (!domain.empty()) {
                const currentD = domain.attr('d') as string
                const extended = currentD.replace(/V[\d.]+/, `V${-topPadding}`)
                if (extended !== currentD) {
                  domain.attr('d', extended)
                }
              }
            }
          }
          else {
            // Outside or off: standard tick/label removal
            if (!showTicks) {
              sel.selectAll('.tick line').remove()
            }
            if (effective === LabelPosition.Off) {
              sel.selectAll('.tick text').remove()
            }
          }
        },
      },
    })
  }

  postDraw() {
    const gridStyle = this.config('gridStyle') as string
    const gridWidth = this.config('gridWidth') as number
    const direction = this.config('direction') as string
    const g = this.base.select('.bc-axis-vertical').node() as SVGGElement
    if (!g) {
      return
    }

    // When axis is on the right, grid lines extend leftward
    const lineWidth = direction === AxisDirection.Right ? -gridWidth : gridWidth
    applyGridLines(g, gridStyle, lineWidth)
  }
}

const GRID_DASH_ARRAY: Partial<Record<string, string>> = {
  [GridStyle.Dashed]: '4,4',
  [GridStyle.Dotted]: '1,3',
}

// A data join rather than an append: re-renders replace the grid instead of
// stacking a second one, and `none` removes what a previous style drew.
function applyGridLines(g: SVGGElement, style: string, width: number): void {
  const root = g.ownerSVGElement?.parentElement ?? document.documentElement
  const cs = getComputedStyle(root)
  const gridColor = cs.getPropertyValue('--bc-grid-color').trim() || '#ccc'
  const data = style === GridStyle.None || width === 0 ? [] : [null]

  const ticks = d3.select(g).selectAll<SVGGElement, unknown>('.tick')
  ticks.each(function () {
    d3.select(this)
      .selectAll<SVGLineElement, null>('.bc-grid-line')
      .data(data)
      .join('line')
      .attr('class', 'bc-grid-line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke', gridColor)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', GRID_DASH_ARRAY[style] ?? null)
  })
}

export function renderVerticalAxis(
  chartArea: SVGGElement,
  scale: d3.ScaleLinear<number, number> | d3.ScaleLogarithmic<number, number> | d3.ScaleBand<string>,
  height: number,
  options: AxisOptions = {},
  priorAxisElement?: Element | null,
): SVGGElement {
  const direction = options.direction ?? AxisDirection.Left
  const chart = new VerticalAxisChart(d3.select(chartArea))

  // Re-insert prior axis element for D3 data-join transition
  if (priorAxisElement) {
    priorAxisElement.querySelectorAll('.bc-grid-line').forEach(el => el.remove())
    const wrapperG = chartArea.lastElementChild
    if (wrapperG) {
      wrapperG.appendChild(priorAxisElement)
    }
  }

  chart.config({
    scale,
    direction,
    showAxis: options.showAxis ?? true,
    showTicks: options.showTicks ?? false,
    gridStyle: options.gridStyle ?? GridStyle.Dashed,
    gridWidth: options.gridWidth ?? 0,
    height,
    ticks: options.ticks ?? null,
    numberFormat: options.numberFormat ?? null,
    labelPosition: options.labelPosition ?? LabelPosition.Auto,
    topPadding: options.topPadding ?? 0,
    tickFormat: options.tickFormat ?? null,
  })
  chart.draw([{ placeholder: true }])

  const el = chartArea.querySelector('.bc-axis-vertical') as SVGGElement
  if (el && direction === AxisDirection.Right) {
    el.setAttribute('transform', `translate(${options.gridWidth ?? 0},0)`)
  }
  return el
}
