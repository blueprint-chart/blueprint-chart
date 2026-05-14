import * as d3 from 'd3'
import type { D3Blueprint, Plugin } from 'd3-blueprint'
import { ValueLabelPosition, Orientation } from '../../enums'
import { contrastTextColor } from '../contrast'

export function createValueLabelPlugin<TData = unknown>(options?: {
  position?: 'inside' | 'outside' | 'auto'
  format?: string
  orientation?: 'vertical' | 'horizontal'
}): Plugin<TData> {
  const pos = options?.position ?? ValueLabelPosition.Auto
  const orientation = options?.orientation ?? Orientation.Vertical
  const fmt = options?.format ? d3.format(options.format) : (v: number) => String(v)

  return {
    name: 'value-labels',

    install() {},

    postDraw(chart: D3Blueprint<TData>) {
      // Access the base selection from the chart instance
      const base = (chart as unknown as { base: d3.Selection<SVGElement, unknown, null, undefined> }).base

      // Label bars
      base.selectAll<SVGRectElement, { label: string, value: number }>('.bc-bar').each(function (d) {
        const rect = d3.select(this)
        const x = parseFloat(rect.attr('x'))
        const y = parseFloat(rect.attr('y'))
        const w = parseFloat(rect.attr('width'))
        const h = parseFloat(rect.attr('height'))
        const isNegative = d.value < 0

        let tx: number, ty: number, anchor: string, baseline: string, isInside: boolean

        if (orientation === Orientation.Horizontal) {
          isInside = pos === ValueLabelPosition.Inside
          ty = y + h / 2
          baseline = 'central'

          if (isNegative) {
            // Bar extends leftward from zero: left edge is at x
            if (isInside) {
              tx = x + 4
              anchor = 'start'
            }
            else {
              tx = x - 4
              anchor = 'end'
            }
          }
          else {
            // Bar extends rightward from zero: right edge is at x + w
            const barEnd = x + w
            if (isInside) {
              tx = barEnd - 4
              anchor = 'end'
            }
            else {
              tx = barEnd + 4
              anchor = 'start'
            }
          }
        }
        else {
          isInside = pos === ValueLabelPosition.Inside
          tx = x + w / 2
          anchor = 'middle'

          if (isNegative) {
            // Bar extends downward from zero: bottom edge is at y + h
            if (isInside) {
              ty = y + h / 2
              baseline = 'central'
            }
            else {
              ty = y + h + 4
              baseline = 'hanging'
            }
          }
          else {
            if (isInside) {
              ty = y + h / 2
              baseline = 'central'
            }
            else {
              ty = y - 4
              baseline = 'auto'
            }
          }
        }

        const barColor = rect.attr('fill') || '#ccc'
        const fillColor = isInside ? contrastTextColor(barColor) : 'currentColor'

        const parent = d3.select(this.parentNode as SVGElement)
        parent.append('text')
          .attr('class', 'bc-value-label')
          .attr('x', tx)
          .attr('y', ty)
          .attr('text-anchor', anchor)
          .attr('dominant-baseline', baseline)
          .attr('font-size', '11px')
          .attr('fill', fillColor)
          .text(fmt(d.value))
      })

      // Label dots
      base.selectAll<SVGCircleElement, { label: string, value: number }>('.bc-dot').each(function (d) {
        const dot = d3.select(this)
        const cx = parseFloat(dot.attr('cx'))
        const cy = parseFloat(dot.attr('cy'))

        const parent = d3.select(this.parentNode as SVGElement)
        parent.append('text')
          .attr('class', 'bc-value-label')
          .attr('x', cx)
          .attr('y', cy - 8)
          .attr('text-anchor', 'middle')
          .attr('font-size', '11px')
          .attr('fill', 'currentColor')
          .text(fmt(d.value))
      })
    },
  }
}
