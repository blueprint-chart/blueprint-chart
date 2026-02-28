import * as d3 from 'd3'
import { computePosition, flip, offset, shift } from '@floating-ui/dom'

const TOOLTIP_CLASS = 'bc-tooltip'

function ensureStyles(): void {
  if (document.getElementById('bc-tooltip-styles')) {
    return
  }
  const style = document.createElement('style')
  style.id = 'bc-tooltip-styles'
  style.textContent = `
    .${TOOLTIP_CLASS} {
      position: absolute;
      pointer-events: none;
      background: var(--bs-body-bg, #fff);
      color: var(--bs-body-color, #212529);
      border: 1px solid var(--bs-border-color, #dee2e6);
      border-radius: 4px;
      padding: 6px 10px;
      font-size: 13px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      z-index: 9999;
      display: none;
    }
  `
  document.head.appendChild(style)
}

export interface ProximityPoint {
  cx: number
  cy: number
  label: string
  value: number
  series?: string
  color: string
}

export interface ProximityOptions {
  width: number
  height: number
  points: ProximityPoint[]
  tooltip?: boolean
  crosshair?: boolean
  crosshairDirection?: 'both' | 'vertical' | 'horizontal'
  crosshairStyle?: 'solid' | 'dashed' | 'dotted'
  crosshairColor?: string
  format?: (point: ProximityPoint) => string
}

function defaultFormat(p: ProximityPoint): string {
  if (p.series) {
    return `${p.series} – ${p.label}: ${p.value}`
  }
  return `${p.label}: ${p.value}`
}

function createProxCrosshairLine(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  cls: string, axis: 'v' | 'h', size: number,
  color: string, dashArray: string,
): d3.Selection<SVGLineElement, unknown, null, undefined> {
  const line = g.append('line')
    .attr('class', `bc-crosshair ${cls}`)
    .attr('stroke', color)
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', dashArray)
    .attr('pointer-events', 'none')
    .style('display', 'none')
  if (axis === 'v') {
    line.attr('y1', 0).attr('y2', size)
  }
  else {
    line.attr('x1', 0).attr('x2', size)
  }
  return line
}

function createHighlightDot(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
): d3.Selection<SVGCircleElement, unknown, null, undefined> {
  return g.append('circle')
    .attr('class', 'bc-proximity-dot')
    .attr('r', 6)
    .attr('fill', 'none')
    .attr('stroke', '#333')
    .attr('stroke-width', 1)
    .attr('opacity', 0.45)
    .attr('pointer-events', 'none')
    .style('display', 'none')
}

function findNearest(
  mouseX: number, mouseY: number,
  xPositions: number[], points: ProximityPoint[],
): ProximityPoint | null {
  if (xPositions.length === 0) {
    return null
  }

  const bisect = d3.bisectCenter(xPositions, mouseX)
  const nearestX = xPositions[bisect]
  const candidates = points.filter(p => p.cx === nearestX)
  if (candidates.length === 0) {
    return null
  }

  let best = candidates[0]
  let bestDist = Math.abs(candidates[0].cy - mouseY)
  for (let i = 1; i < candidates.length; i++) {
    const dist = Math.abs(candidates[i].cy - mouseY)
    if (dist < bestDist) {
      best = candidates[i]
      bestDist = dist
    }
  }
  return best
}

function positionTooltip(
  tooltipEl: HTMLDivElement,
  anchor: SVGCircleElement,
): void {
  computePosition(anchor, tooltipEl, {
    placement: 'top',
    middleware: [offset(8), flip(), shift()],
  }).then(({ x, y }) => {
    tooltipEl.style.left = `${x}px`
    tooltipEl.style.top = `${y}px`
  })
}

function updateHighlight(
  nearest: ProximityPoint,
  highlightDot: d3.Selection<SVGCircleElement, unknown, null, undefined>,
  tooltipEl: HTMLDivElement | null,
  format: (point: ProximityPoint) => string,
  vLine: d3.Selection<SVGLineElement, unknown, null, undefined> | null,
  hLine: d3.Selection<SVGLineElement, unknown, null, undefined> | null,
): void {
  highlightDot
    .attr('cx', nearest.cx)
    .attr('cy', nearest.cy)
    .attr('stroke', nearest.color)
    .style('display', null)

  if (tooltipEl) {
    tooltipEl.textContent = format(nearest)
    tooltipEl.style.display = 'block'
    positionTooltip(tooltipEl, highlightDot.node()!)
  }

  if (vLine) {
    vLine.attr('x1', nearest.cx).attr('x2', nearest.cx).style('display', null)
  }
  if (hLine) {
    hLine.attr('y1', nearest.cy).attr('y2', nearest.cy).style('display', null)
  }
}

function hideHighlight(
  highlightDot: d3.Selection<SVGCircleElement, unknown, null, undefined>,
  tooltipEl: HTMLDivElement | null,
  vLine: d3.Selection<SVGLineElement, unknown, null, undefined> | null,
  hLine: d3.Selection<SVGLineElement, unknown, null, undefined> | null,
): void {
  highlightDot.style('display', 'none')
  if (tooltipEl) {
    tooltipEl.style.display = 'none'
  }
  if (vLine) {
    vLine.style('display', 'none')
  }
  if (hLine) {
    hLine.style('display', 'none')
  }
}

interface ProximityElements {
  tooltipEl: HTMLDivElement | null
  vLine: d3.Selection<SVGLineElement, unknown, null, undefined> | null
  hLine: d3.Selection<SVGLineElement, unknown, null, undefined> | null
  highlightDot: d3.Selection<SVGCircleElement, unknown, null, undefined>
  overlay: d3.Selection<SVGRectElement, unknown, null, undefined>
}

function cleanupProximityElements(els: ProximityElements): void {
  els.overlay.remove()
  els.highlightDot.remove()
  if (els.tooltipEl) {
    els.tooltipEl.remove()
    els.tooltipEl = null
  }
  if (els.vLine) {
    els.vLine.remove()
  }
  if (els.hLine) {
    els.hLine.remove()
  }
}

function createProximityElements(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  options: ProximityOptions, dashArray: string,
): ProximityElements {
  const { width, height, tooltip = true, crosshair = false, crosshairDirection = 'both', crosshairColor = '#999' } = options

  let tooltipEl: HTMLDivElement | null = null
  if (tooltip) {
    ensureStyles()
    tooltipEl = document.createElement('div')
    tooltipEl.className = TOOLTIP_CLASS
    document.body.appendChild(tooltipEl)
  }

  const showV = crosshair && (crosshairDirection === 'both' || crosshairDirection === 'vertical')
  const showH = crosshair && (crosshairDirection === 'both' || crosshairDirection === 'horizontal')
  const vLine = showV ? createProxCrosshairLine(g, 'bc-crosshair-v', 'v', height, crosshairColor, dashArray) : null
  const hLine = showH ? createProxCrosshairLine(g, 'bc-crosshair-h', 'h', width, crosshairColor, dashArray) : null

  const highlightDot = createHighlightDot(g)
  const overlay = g.append('rect')
    .attr('class', 'bc-proximity-overlay')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'none')
    .attr('pointer-events', 'all')

  return { tooltipEl, vLine, hLine, highlightDot, overlay }
}

function toDashArray(style: string): string {
  if (style === 'solid') {
    return ''
  }
  return style === 'dotted' ? '2,2' : '4,3'
}

function createMoveHandler(
  chartArea: SVGGElement, xPositions: number[], points: ProximityPoint[],
  els: ProximityElements, format: (point: ProximityPoint) => string,
): (event: MouseEvent) => void {
  return (event: MouseEvent) => {
    const [mouseX, mouseY] = d3.pointer(event, chartArea)
    const nearest = findNearest(mouseX, mouseY, xPositions, points)
    if (!nearest) {
      return
    }
    updateHighlight(nearest, els.highlightDot, els.tooltipEl, format, els.vLine, els.hLine)
  }
}

function attachProximityListeners(
  overlayNode: SVGRectElement, chartArea: SVGGElement,
  xPositions: number[], points: ProximityPoint[],
  els: ProximityElements, format: (point: ProximityPoint) => string,
): () => void {
  const onMove = createMoveHandler(chartArea, xPositions, points, els, format)
  const onLeave = () => {
    hideHighlight(els.highlightDot, els.tooltipEl, els.vLine, els.hLine)
  }

  overlayNode.addEventListener('mousemove', onMove)
  overlayNode.addEventListener('mouseleave', onLeave)

  return () => {
    overlayNode.removeEventListener('mousemove', onMove)
    overlayNode.removeEventListener('mouseleave', onLeave)
  }
}

/**
 * Sets up proximity-based tooltip and crosshair for line charts.
 * Instead of requiring hover over tiny dot elements, this creates a
 * transparent overlay that finds the nearest data point by x-position.
 */
export function setupProximityInteraction(
  chartArea: SVGGElement,
  options: ProximityOptions,
): () => void {
  const { points, crosshairStyle = 'dashed', format = defaultFormat } = options

  if (points.length === 0) {
    return () => {}
  }

  const dashArray = toDashArray(crosshairStyle)
  const xPositions = [...new Set(points.map(p => p.cx))].sort((a, b) => a - b)
  const g = d3.select(chartArea)
  const els = createProximityElements(g, options, dashArray)
  const overlayNode = els.overlay.node()!
  const removeListeners = attachProximityListeners(overlayNode, chartArea, xPositions, points, els, format)

  return () => {
    removeListeners()
    cleanupProximityElements(els)
  }
}
