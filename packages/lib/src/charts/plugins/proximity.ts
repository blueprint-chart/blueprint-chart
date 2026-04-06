import * as d3 from 'd3'
import { computePosition, flip, offset, shift } from '@floating-ui/dom'
import { CrosshairDirection, CrosshairStyle } from '../../enums'

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

/**
 * Sets up proximity-based tooltip and crosshair for line charts.
 * Instead of requiring hover over tiny dot elements, this creates a
 * transparent overlay that finds the nearest data point by x-position.
 */
export function setupProximityInteraction(
  chartArea: SVGGElement,
  options: ProximityOptions,
): () => void {
  const {
    width,
    height,
    points,
    tooltip = true,
    crosshair = false,
    crosshairDirection = CrosshairDirection.Both,
    crosshairStyle = CrosshairStyle.Dashed,
    crosshairColor = '#999',
    format = defaultFormat,
  } = options

  if (points.length === 0) {
    return () => {}
  }

  const dashArray = crosshairStyle === CrosshairStyle.Solid ? 'none' : crosshairStyle === CrosshairStyle.Dotted ? '2,2' : '4,3'

  // Pre-compute sorted unique x-positions for bisection
  const xPositions = [...new Set(points.map(p => p.cx))].sort((a, b) => a - b)

  const g = d3.select(chartArea)

  // Tooltip div
  let tooltipEl: HTMLDivElement | null = null
  if (tooltip) {
    ensureStyles()
    tooltipEl = document.createElement('div')
    tooltipEl.className = TOOLTIP_CLASS
    document.body.appendChild(tooltipEl)
  }

  // Insert proximity elements before annotations (if present) so the
  // annotation layer stays on top and remains interactive.
  const annSel = '.bc-annotations'
  const hasAnn = !g.select(annSel).empty()
  const ins = <T extends SVGElement>(tag: string) =>
    (hasAnn ? g.insert(tag, annSel) : g.append(tag)) as unknown as d3.Selection<T, unknown, null, undefined>

  // Crosshair lines
  const showV = crosshair && (crosshairDirection === CrosshairDirection.Both || crosshairDirection === CrosshairDirection.Vertical)
  const showH = crosshair && (crosshairDirection === CrosshairDirection.Both || crosshairDirection === CrosshairDirection.Horizontal)
  let vLine: d3.Selection<SVGLineElement, unknown, null, undefined> | null = null
  let hLine: d3.Selection<SVGLineElement, unknown, null, undefined> | null = null
  if (showV) {
    vLine = ins<SVGLineElement>('line')
      .attr('class', 'bc-crosshair bc-crosshair-v')
      .attr('y1', 0).attr('y2', height)
      .attr('stroke', crosshairColor)
      .attr('stroke-width', 1)
      .style('stroke-dasharray', dashArray)
      .attr('pointer-events', 'none')
      .style('display', 'none')
  }
  if (showH) {
    hLine = ins<SVGLineElement>('line')
      .attr('class', 'bc-crosshair bc-crosshair-h')
      .attr('x1', 0).attr('x2', width)
      .attr('stroke', crosshairColor)
      .attr('stroke-width', 1)
      .style('stroke-dasharray', dashArray)
      .attr('pointer-events', 'none')
      .style('display', 'none')
  }

  // Highlight dot shown at the nearest point
  const highlightDot = ins<SVGCircleElement>('circle')
    .attr('class', 'bc-proximity-dot')
    .attr('r', 6)
    .attr('fill', 'none')
    .attr('stroke', '#333')
    .attr('stroke-width', 1)
    .attr('opacity', 0.45)
    .attr('pointer-events', 'none')
    .style('display', 'none')

  // Transparent overlay for mouse tracking
  const overlay = ins<SVGRectElement>('rect')
    .attr('class', 'bc-proximity-overlay')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'none')
    .attr('pointer-events', 'all')

  function findNearest(mouseX: number, mouseY: number): ProximityPoint | null {
    if (xPositions.length === 0) {
      return null
    }

    // Find nearest x-column via bisection
    const bisect = d3.bisectCenter(xPositions, mouseX)
    const nearestX = xPositions[bisect]

    // Among points at that x, find closest by y
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

  const onMove = (event: MouseEvent) => {
    const [mouseX, mouseY] = d3.pointer(event, chartArea)
    const nearest = findNearest(mouseX, mouseY)
    if (!nearest) {
      return
    }

    highlightDot
      .attr('cx', nearest.cx)
      .attr('cy', nearest.cy)
      .attr('stroke', nearest.color)
      .style('display', null)

    if (tooltipEl) {
      tooltipEl.textContent = format(nearest)
      tooltipEl.style.display = 'block'

      // Position tooltip relative to the highlight dot
      computePosition(highlightDot.node()!, tooltipEl, {
        placement: 'top',
        middleware: [offset(8), flip(), shift()],
      }).then(({ x, y }) => {
        if (!tooltipEl) {
          return
        }
        tooltipEl.style.left = `${x}px`
        tooltipEl.style.top = `${y}px`
      })
    }

    if (vLine) {
      vLine.attr('x1', nearest.cx).attr('x2', nearest.cx).style('display', null)
    }
    if (hLine) {
      hLine.attr('y1', nearest.cy).attr('y2', nearest.cy).style('display', null)
    }
  }

  const onLeave = () => {
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

  const overlayNode = overlay.node()!
  overlayNode.addEventListener('mousemove', onMove)
  overlayNode.addEventListener('mouseleave', onLeave)

  return () => {
    overlayNode.removeEventListener('mousemove', onMove)
    overlayNode.removeEventListener('mouseleave', onLeave)
    overlay.remove()
    highlightDot.remove()
    if (tooltipEl) {
      tooltipEl.remove()
      tooltipEl = null
    }
    if (vLine) {
      vLine.remove()
    }
    if (hLine) {
      hLine.remove()
    }
  }
}
