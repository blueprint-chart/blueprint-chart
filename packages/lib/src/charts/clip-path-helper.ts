import * as d3 from 'd3'

let clipCounter = 0
const containerClipIds = new WeakMap<Element, Map<string, string>>()

export interface ClipRect {
  x: number
  y: number
  width: number
  height: number
}

export function ensureClipPath(
  svg: SVGSVGElement,
  container: Element,
  key: string,
  rect: ClipRect,
): string {
  let perContainer = containerClipIds.get(container)
  if (!perContainer) {
    perContainer = new Map()
    containerClipIds.set(container, perContainer)
  }
  let id = perContainer.get(key)
  if (!id) {
    id = `bc-clip-${++clipCounter}`
    perContainer.set(key, id)
  }
  const defs = d3.select(svg).select<SVGDefsElement>('defs').empty()
    ? d3.select(svg).append<SVGDefsElement>('defs')
    : d3.select(svg).select<SVGDefsElement>('defs')
  const existing = defs.select<SVGClipPathElement>(`#${id}`)
  if (existing.empty()) {
    defs.append('clipPath').attr('id', id)
      .append('rect')
      .attr('x', rect.x).attr('y', rect.y)
      .attr('width', rect.width).attr('height', rect.height)
  }
  else {
    existing.select<SVGRectElement>('rect')
      .attr('x', rect.x).attr('y', rect.y)
      .attr('width', rect.width).attr('height', rect.height)
  }
  return id
}
