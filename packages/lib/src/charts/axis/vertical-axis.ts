import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import type { AxisOptions } from '../types'

interface AxisDatum {
  placeholder: true
}

const V_AUTO_INSIDE_THRESHOLD = 400

function resolveVerticalLabelPosition(labelPos: string, chartWidth: number): string {
  if (labelPos !== 'auto') {
    return labelPos
  }
  return (chartWidth > 0 && chartWidth < V_AUTO_INSIDE_THRESHOLD) ? 'inside' : 'outside'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyInsideLabels(sel: any, direction: string, showAxis: boolean, showTicks: boolean, topPadding: number): void {
  const padding = showAxis ? 4 : 0
  const anchor = direction === 'right' ? 'end' : 'start'
  const xVal = direction === 'right' ? -padding : padding

  sel.selectAll('.tick text')
    .attr('x', xVal)
    .attr('dy', '-0.4em')
    .attr('text-anchor', anchor)

  if (showTicks) {
    const tickSize = 6
    sel.selectAll('.tick line')
      .attr('x2', direction === 'right' ? -tickSize : tickSize)
  }
  else {
    sel.selectAll('.tick line').remove()
  }

  extendDomainLine(sel, topPadding, showAxis)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extendDomainLine(sel: any, topPadding: number, showAxis: boolean): void {
  if (topPadding <= 0 || !showAxis) {
    return
  }
  const domain = sel.select('.domain')
  if (domain.empty()) {
    return
  }
  const currentD = domain.attr('d') as string
  const extended = currentD.replace(/V[\d.]+/, `V${-topPadding}`)
  if (extended !== currentD) {
    domain.attr('d', extended)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyOutsideLabels(sel: any, effective: string, showTicks: boolean): void {
  if (!showTicks) {
    sel.selectAll('.tick line').remove()
  }
  if (effective === 'off') {
    sel.selectAll('.tick text').remove()
  }
}

class VerticalAxisChart extends D3Blueprint<AxisDatum[]> {
  initialize() {
    this.configDefine('scale', { defaultValue: d3.scaleLinear() })
    this.configDefine('direction', { defaultValue: 'left' })
    this.configDefine('showAxis', { defaultValue: true })
    this.configDefine('showTicks', { defaultValue: false })
    this.configDefine('gridStyle', { defaultValue: 'dashed' })
    this.configDefine('gridWidth', { defaultValue: 0 })
    this.configDefine('ticks', { defaultValue: null as number[] | null })
    this.configDefine('numberFormat', { defaultValue: null as string | null })
    this.configDefine('labelPosition', { defaultValue: 'auto' })
    this.configDefine('topPadding', { defaultValue: 0 })

    const g = this.base.append('g')

    this.layer('axis', g, {
      dataBind: (sel, data) => sel.selectAll('.bc-axis-vertical').data(data),
      insert: sel => sel.append('g').attr('class', 'bc-axis bc-axis-vertical'),
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        enter: (sel: any) => this.renderAxis(sel),
      },
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private renderAxis(sel: any): void {
    const scale = this.config('scale') as d3.AxisScale<string | d3.NumberValue>
    const direction = this.config('direction') as string
    const axisFn = this.buildAxisFn(scale, direction)

    sel.call(axisFn)

    const showAxis = this.config('showAxis') as boolean
    const showTicks = this.config('showTicks') as boolean
    if (!showAxis) {
      sel.select('.domain').remove()
    }

    const effective = resolveVerticalLabelPosition(this.config('labelPosition') as string, this.config('gridWidth') as number)
    if (effective === 'inside') {
      applyInsideLabels(sel, direction, showAxis, showTicks, this.config('topPadding') as number)
    }
    else {
      applyOutsideLabels(sel, effective, showTicks)
    }
  }

  private buildAxisFn(scale: d3.AxisScale<string | d3.NumberValue>, direction: string): d3.Axis<string | d3.NumberValue> {
    const axisFn = direction === 'right' ? d3.axisRight(scale) : d3.axisLeft(scale)
    if (!this.config('showTicks')) {
      axisFn.tickSizeOuter(0)
    }
    const ticks = this.config('ticks') as number[] | null
    if (ticks) {
      axisFn.tickValues(ticks as (string & d3.NumberValue)[])
    }
    const fmt = this.config('numberFormat') as string | null
    if (fmt) {
      axisFn.tickFormat(d3.format(fmt) as (d: string | d3.NumberValue) => string)
    }
    return axisFn
  }

  postDraw() {
    const gridStyle = this.config('gridStyle') as string
    const gridWidth = this.config('gridWidth') as number
    const direction = this.config('direction') as string
    const g = this.base.select('.bc-axis-vertical').node() as SVGGElement
    if (!g) {
      return
    }

    if (gridStyle !== 'none' && gridWidth > 0) {
      const lineWidth = direction === 'right' ? -gridWidth : gridWidth
      applyGridLines(g, gridStyle, lineWidth)
    }
  }
}

function applyGridLines(g: SVGGElement, style: string, width: number): void {
  const root = g.ownerSVGElement?.parentElement ?? document.documentElement
  const cs = getComputedStyle(root)
  const gridColor = cs.getPropertyValue('--bc-grid-color').trim() || '#ccc'

  const ticks = d3.select(g).selectAll<SVGGElement, unknown>('.tick')
  ticks.each(function () {
    const tick = d3.select(this)
    const line = tick.append('line')
      .attr('class', 'bc-grid-line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', 0)
      .attr('y2', 0)
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

function buildVerticalAxisConfig(
  scale: d3.ScaleLinear<number, number> | d3.ScaleLogarithmic<number, number> | d3.ScaleBand<string>,
  options: AxisOptions,
): Record<string, unknown> {
  return {
    scale,
    direction: options.direction ?? 'left',
    showAxis: options.showAxis ?? true,
    showTicks: options.showTicks ?? false,
    gridStyle: options.gridStyle ?? 'dashed',
    gridWidth: options.gridWidth ?? 0,
    ticks: options.ticks ?? null,
    numberFormat: options.numberFormat ?? null,
    labelPosition: options.labelPosition ?? 'auto',
    topPadding: options.topPadding ?? 0,
  }
}

export function renderVerticalAxis(
  chartArea: SVGGElement,
  scale: d3.ScaleLinear<number, number> | d3.ScaleLogarithmic<number, number> | d3.ScaleBand<string>,
  _height: number,
  options: AxisOptions = {},
): SVGGElement {
  const direction = options.direction ?? 'left'
  const chart = new VerticalAxisChart(d3.select(chartArea))
  chart.config(buildVerticalAxisConfig(scale, options))
  chart.draw([{ placeholder: true }])

  const el = chartArea.querySelector('.bc-axis-vertical') as SVGGElement
  if (el && direction === 'right') {
    el.setAttribute('transform', `translate(${options.gridWidth ?? 0},0)`)
  }
  return el
}
