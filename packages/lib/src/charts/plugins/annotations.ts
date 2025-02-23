import * as d3 from 'd3'
import type { D3Blueprint, Plugin } from 'd3-blueprint'
import type { AnnotationConfig } from '../types'

export function createAnnotationPlugin(
  annotations: AnnotationConfig[],
  scaleX: d3.ScaleBand<string>,
  scaleY: d3.ScaleLinear<number, number>,
  data: { label: string, value: number }[],
): Plugin {
  return {
    name: 'annotations',

    install() {},

    postDraw(chart: D3Blueprint) {
      const base = (chart as unknown as { base: d3.Selection<SVGElement, unknown, null, undefined> }).base

      // Ensure arrowhead marker
      const svg = base.node()?.ownerSVGElement ?? base.node()
      if (svg && !svg.querySelector('#bc-arrow')) {
        d3.select(svg).append('defs').append('marker')
          .attr('id', 'bc-arrow')
          .attr('viewBox', '0 0 10 10')
          .attr('refX', 10)
          .attr('refY', 5)
          .attr('markerWidth', 6)
          .attr('markerHeight', 6)
          .attr('orient', 'auto-start-reverse')
          .append('path')
          .attr('d', 'M 0 0 L 10 5 L 0 10 z')
          .attr('fill', '#666')
      }

      const g = base.append('g').attr('class', 'bc-annotations')

      for (const ann of annotations) {
        const datum = data.find(d => d.label === ann.target)
        if (!datum) continue

        const cx = (scaleX(datum.label) ?? 0) + scaleX.bandwidth() / 2
        const cy = scaleY(datum.value)
        const dx = ann.dx ?? 40
        const dy = ann.dy ?? -40
        const tx = cx + dx
        const ty = cy + dy

        if (ann.showArrow !== false) {
          g.append('line')
            .attr('class', 'bc-annotation-arrow')
            .attr('x1', tx)
            .attr('y1', ty)
            .attr('x2', cx)
            .attr('y2', cy)
            .attr('stroke', '#666')
            .attr('stroke-width', 1)
            .attr('marker-end', 'url(#bc-arrow)')
        }

        g.append('text')
          .attr('class', 'bc-annotation-text')
          .attr('x', tx)
          .attr('y', ty - 4)
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .attr('fill', 'currentColor')
          .text(ann.text)
      }
    },
  }
}
