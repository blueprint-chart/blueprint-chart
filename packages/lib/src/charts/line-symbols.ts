import * as d3 from 'd3'
import 'd3-transition'
import type { LineSymbolConfig } from './types'
import { SymbolShape, SymbolShowOn, SymbolStyle } from '../enums'
import { getDefaultTransitionMs } from './motion'

// d3.symbolTriangle2 is triangle-down in d3 v7+; fall back to a rotated triangle
const symbolTriangleDown: d3.SymbolType = d3.symbolTriangle2 ?? d3.symbolTriangle

const SYMBOL_MAP: Record<string, d3.SymbolType> = {
  circle: d3.symbolCircle,
  square: d3.symbolSquare,
  diamond: d3.symbolDiamond,
  triangle: d3.symbolTriangle,
  triangleDown: symbolTriangleDown,
  cross: d3.symbolCross,
  star: d3.symbolStar,
}

export function shouldShowSymbol(
  index: number,
  total: number,
  showOn: LineSymbolConfig['showOn'],
): boolean {
  switch (showOn) {
    case SymbolShowOn.First: return index === 0
    case SymbolShowOn.Last: return index === total - 1
    case SymbolShowOn.FirstLast: return index === 0 || index === total - 1
    case SymbolShowOn.All:
    default: return true
  }
}

export function renderLineSymbols(
  parent: d3.Selection<SVGGElement, unknown, null, undefined>,
  points: { cx: number, cy: number, color: string, index: number }[],
  total: number,
  config: LineSymbolConfig,
  transition = false,
): void {
  const symbol = config.symbol ?? SymbolShape.Circle
  const showOn = config.showOn ?? SymbolShowOn.FirstLast
  const style = config.style ?? SymbolStyle.Filled
  const size = config.size ?? 3.5
  const opacity = config.opacity ?? 1

  // For hollow style, use white fill so the line behind doesn't show through
  const hollowFill = 'var(--bs-body-bg, #fff)'

  const visible = points.filter(p => shouldShowSymbol(p.index, total, showOn))

  const duration = transition ? getDefaultTransitionMs() : 0

  if (symbol === SymbolShape.Circle) {
    const joined = parent.selectAll<SVGCircleElement, typeof visible[number]>('.bc-symbol')
      .data(visible)
      .join(
        enter => enter.append('circle')
          .attr('class', 'bc-symbol')
          .attr('cx', d => d.cx)
          .attr('cy', d => d.cy)
          .attr('r', size)
          .attr('fill', d => style === SymbolStyle.Filled ? d.color : hollowFill)
          .attr('stroke', d => d.color)
          .attr('stroke-width', style === SymbolStyle.Hollow ? 1.5 : 0)
          .attr('opacity', opacity),
        update => update,
        exit => exit.remove(),
      )

    const target = transition
      ? joined.transition().duration(duration)
      : joined
    target
      .attr('cx', d => d.cx)
      .attr('cy', d => d.cy)
      .attr('r', size)
      .attr('fill', d => style === SymbolStyle.Filled ? d.color : hollowFill)
      .attr('stroke', d => d.color)
      .attr('stroke-width', style === SymbolStyle.Hollow ? 1.5 : 0)
      .attr('opacity', opacity)
  }
  else {
    const symbolType = SYMBOL_MAP[symbol] ?? d3.symbolCircle
    const area = Math.PI * size * size
    const pathGen = d3.symbol().type(symbolType).size(area)

    const joined = parent.selectAll<SVGPathElement, typeof visible[number]>('.bc-symbol')
      .data(visible)
      .join(
        enter => enter.append('path')
          .attr('class', 'bc-symbol')
          .attr('transform', d => `translate(${d.cx},${d.cy})`)
          .attr('d', pathGen as unknown as string)
          .attr('fill', d => style === SymbolStyle.Filled ? d.color : hollowFill)
          .attr('stroke', d => d.color)
          .attr('stroke-width', style === SymbolStyle.Hollow ? 1.5 : 0)
          .attr('opacity', opacity),
        update => update,
        exit => exit.remove(),
      )

    const target = transition
      ? joined.transition().duration(duration)
      : joined
    target
      .attr('transform', d => `translate(${d.cx},${d.cy})`)
      .attr('d', pathGen as unknown as string)
      .attr('fill', d => style === SymbolStyle.Filled ? d.color : hollowFill)
      .attr('stroke', d => d.color)
      .attr('stroke-width', style === SymbolStyle.Hollow ? 1.5 : 0)
      .attr('opacity', opacity)
  }
}
