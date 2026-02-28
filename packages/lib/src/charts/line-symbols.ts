import * as d3 from 'd3'
import type { LineSymbolConfig } from './types'

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
    case 'first': return index === 0
    case 'last': return index === total - 1
    case 'firstLast': return index === 0 || index === total - 1
    case 'all':
    default: return true
  }
}

export function renderLineSymbols(
  parent: d3.Selection<SVGGElement, unknown, null, undefined>,
  points: { cx: number, cy: number, color: string, index: number }[],
  total: number,
  config: LineSymbolConfig,
): void {
  const symbol = config.symbol ?? 'circle'
  const showOn = config.showOn ?? 'firstLast'
  const style = config.style ?? 'filled'
  const size = config.size ?? 3.5
  const opacity = config.opacity ?? 1

  // For hollow style, use white fill so the line behind doesn't show through
  const hollowFill = 'var(--bs-body-bg, #fff)'

  const visible = points.filter(p => shouldShowSymbol(p.index, total, showOn))

  if (symbol === 'circle') {
    parent.selectAll('.bc-symbol')
      .data(visible)
      .join('circle')
      .attr('class', 'bc-symbol')
      .attr('cx', d => d.cx)
      .attr('cy', d => d.cy)
      .attr('r', size)
      .attr('fill', d => style === 'filled' ? d.color : hollowFill)
      .attr('stroke', d => d.color)
      .attr('stroke-width', style === 'hollow' ? 1.5 : 0)
      .attr('opacity', opacity)
  }
  else {
    const symbolType = SYMBOL_MAP[symbol] ?? d3.symbolCircle
    const area = Math.PI * size * size
    const pathGen = d3.symbol().type(symbolType).size(area)

    parent.selectAll('.bc-symbol')
      .data(visible)
      .join('path')
      .attr('class', 'bc-symbol')
      .attr('transform', d => `translate(${d.cx},${d.cy})`)
      .attr('d', pathGen as unknown as string)
      .attr('fill', d => style === 'filled' ? d.color : hollowFill)
      .attr('stroke', d => d.color)
      .attr('stroke-width', style === 'hollow' ? 1.5 : 0)
      .attr('opacity', opacity)
  }
}
