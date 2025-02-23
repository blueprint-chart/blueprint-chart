import * as d3 from 'd3'
import type { D3Blueprint, Plugin } from 'd3-blueprint'
import { contrastTextColor } from '../contrast'

export function createValueLabelPlugin(options?: {
  position?: 'inside' | 'outside' | 'auto'
  format?: string
  orientation?: 'vertical' | 'horizontal'
}): Plugin {
  const pos = options?.position ?? 'auto'
  const orientation = options?.orientation ?? 'vertical'
  const fmt = options?.format ? d3.format(options.format) : (v: number) => String(v)

  return {
    name: 'value-labels',

    install() {},

    postDraw(chart: D3Blueprint) {
      // Access the base selection from the chart instance
      const base = (chart as unknown as { base: d3.Selection<SVGElement, unknown, null, undefined> }).base

      // Label bars
      base.selectAll<SVGRectElement, { label: string, value: number }>('.bc-bar').each(function (d) {
        const rect = d3.select(this)
        const x = parseFloat(rect.attr('x'))
        const y = parseFloat(rect.attr('y'))
        const w = parseFloat(rect.attr('width'))
        const h = parseFloat(rect.attr('height'))

        let tx: number, ty: number, anchor: string, isInside: boolean

        if (orientation === 'horizontal') {
          const barEnd = x + w
          isInside = pos === 'inside' || (pos === 'auto' && w > 40)
          ty = y + h / 2
          if (isInside) {
            tx = barEnd - 4
            anchor = 'end'
          }
          else {
            tx = barEnd + 4
            anchor = 'start'
          }
        }
        else {
          isInside = pos === 'inside' || (pos === 'auto' && h > 20)
          tx = x + w / 2
          anchor = 'middle'
          if (isInside) {
            ty = y + h / 2
          }
          else {
            ty = y - 4
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
          .attr('dominant-baseline', orientation === 'horizontal' ? 'central' : (isInside ? 'central' : 'auto'))
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
