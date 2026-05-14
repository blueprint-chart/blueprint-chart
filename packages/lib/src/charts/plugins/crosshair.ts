import * as d3 from 'd3'
import type { D3Blueprint, Plugin } from 'd3-blueprint'
import { CrosshairDirection, CrosshairStyle, Orientation } from '../../enums'

function styleToDash(style?: string): string {
  switch (style) {
    case CrosshairStyle.Solid: return 'none'
    case CrosshairStyle.Dotted: return '2,2'
    case CrosshairStyle.Dashed:
    default: return '4,3'
  }
}

export function createCrosshairPlugin<TData = unknown>(options?: {
  width?: number
  height?: number
  direction?: 'both' | 'vertical' | 'horizontal'
  style?: 'solid' | 'dashed' | 'dotted'
  color?: string
  dashArray?: string
  orientation?: 'vertical' | 'horizontal'
}): Plugin<TData> {
  const color = options?.color ?? '#999'
  const dashArray = options?.dashArray ?? styleToDash(options?.style)
  const direction = options?.direction ?? CrosshairDirection.Both
  const orientation = options?.orientation ?? Orientation.Vertical
  const cleanups: (() => void)[] = []

  return {
    name: 'crosshair',

    install() {},

    postDraw(chart: D3Blueprint<TData>) {
      const base = (chart as unknown as { base: d3.Selection<SVGElement, unknown, null, undefined> }).base
      const w = options?.width ?? 0
      const h = options?.height ?? 0

      const showV = direction === CrosshairDirection.Both || direction === CrosshairDirection.Vertical
      const showH = direction === CrosshairDirection.Both || direction === CrosshairDirection.Horizontal

      const vLine = showV
        ? base.append('line')
            .attr('class', 'bc-crosshair bc-crosshair-v')
            .attr('y1', 0).attr('y2', h)
            .attr('stroke', color)
            .attr('stroke-width', 1)
            .style('stroke-dasharray', dashArray)
            .attr('pointer-events', 'none')
            .style('display', 'none')
        : null

      const hLine = showH
        ? base.append('line')
            .attr('class', 'bc-crosshair bc-crosshair-h')
            .attr('x1', 0).attr('x2', w)
            .attr('stroke', color)
            .attr('stroke-width', 1)
            .style('stroke-dasharray', dashArray)
            .attr('pointer-events', 'none')
            .style('display', 'none')
        : null

      const targets = base.selectAll<SVGElement, unknown>('.bc-dot, .bc-bar')

      targets.each(function () {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const el = this

        const onEnter = () => {
          const sel = d3.select(el)
          let cx: number, cy: number

          if (el.tagName === 'circle') {
            cx = parseFloat(sel.attr('cx'))
            cy = parseFloat(sel.attr('cy'))
          }
          else {
            // rect (bar)
            const x = parseFloat(sel.attr('x'))
            const bw = parseFloat(sel.attr('width'))
            const y = parseFloat(sel.attr('y'))
            const bh = parseFloat(sel.attr('height'))
            if (orientation === Orientation.Horizontal) {
              cx = x + bw
              cy = y + bh / 2
            }
            else {
              cx = x + bw / 2
              cy = y
            }
          }

          if (vLine) {
            vLine.attr('x1', cx).attr('x2', cx).style('display', null)
          }
          if (hLine) {
            hLine.attr('y1', cy).attr('y2', cy).style('display', null)
          }
        }

        const onLeave = () => {
          if (vLine) {
            vLine.style('display', 'none')
          }
          if (hLine) {
            hLine.style('display', 'none')
          }
        }

        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
        cleanups.push(() => {
          el.removeEventListener('mouseenter', onEnter)
          el.removeEventListener('mouseleave', onLeave)
        })
      })
    },

    destroy() {
      for (const cleanup of cleanups) {
        cleanup()
      }
      cleanups.length = 0
    },
  }
}
