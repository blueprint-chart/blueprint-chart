import * as d3 from 'd3'
import type { D3Blueprint, Plugin } from 'd3-blueprint'

function styleToDash(style?: string): string {
  switch (style) {
    case 'solid': return ''
    case 'dotted': return '2,2'
    case 'dashed':
    default: return '4,3'
  }
}

type LineSelection = d3.Selection<SVGLineElement, unknown, null, undefined> | null

function createCrosshairLine(
  base: d3.Selection<SVGElement, unknown, null, undefined>,
  cls: string, color: string, dashArray: string,
  axis: 'v' | 'h', size: number,
): d3.Selection<SVGLineElement, unknown, null, undefined> {
  const line = base.append('line')
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

function getElementCenter(el: SVGElement): { cx: number, cy: number } {
  const sel = d3.select(el)
  if (el.tagName === 'circle') {
    return {
      cx: parseFloat(sel.attr('cx')),
      cy: parseFloat(sel.attr('cy')),
    }
  }
  const x = parseFloat(sel.attr('x'))
  const bw = parseFloat(sel.attr('width'))
  const y = parseFloat(sel.attr('y'))
  return { cx: x + bw / 2, cy: y }
}

function showCrosshairLines(vLine: LineSelection, hLine: LineSelection, cx: number, cy: number): void {
  if (vLine) {
    vLine.attr('x1', cx).attr('x2', cx).style('display', null)
  }
  if (hLine) {
    hLine.attr('y1', cy).attr('y2', cy).style('display', null)
  }
}

function hideCrosshairLines(vLine: LineSelection, hLine: LineSelection): void {
  if (vLine) {
    vLine.style('display', 'none')
  }
  if (hLine) {
    hLine.style('display', 'none')
  }
}

function attachCrosshairListeners(
  el: SVGElement, vLine: LineSelection, hLine: LineSelection,
  cleanups: (() => void)[],
): void {
  const onEnter = () => {
    const { cx, cy } = getElementCenter(el)
    showCrosshairLines(vLine, hLine, cx, cy)
  }

  const onLeave = () => {
    hideCrosshairLines(vLine, hLine)
  }

  el.addEventListener('mouseenter', onEnter)
  el.addEventListener('mouseleave', onLeave)
  cleanups.push(() => {
    el.removeEventListener('mouseenter', onEnter)
    el.removeEventListener('mouseleave', onLeave)
  })
}

interface CrosshairOptions {
  width?: number
  height?: number
  direction?: 'both' | 'vertical' | 'horizontal'
  style?: 'solid' | 'dashed' | 'dotted'
  color?: string
  dashArray?: string
}

function runCleanups(cleanups: (() => void)[]): void {
  for (const cleanup of cleanups) {
    cleanup()
  }
  cleanups.length = 0
}

function drawCrosshair(
  chart: D3Blueprint, direction: string, color: string,
  dashArray: string, options: { width?: number, height?: number } | undefined,
  cleanups: (() => void)[],
): void {
  const base = (chart as unknown as { base: d3.Selection<SVGElement, unknown, null, undefined> }).base
  const w = options?.width ?? 0
  const h = options?.height ?? 0

  const showV = direction === 'both' || direction === 'vertical'
  const showH = direction === 'both' || direction === 'horizontal'

  const vLine = showV ? createCrosshairLine(base, 'bc-crosshair-v', color, dashArray, 'v', h) : null
  const hLine = showH ? createCrosshairLine(base, 'bc-crosshair-h', color, dashArray, 'h', w) : null

  base.selectAll<SVGElement, unknown>('.bc-dot, .bc-bar').each(function () {
    attachCrosshairListeners(this, vLine, hLine, cleanups)
  })
}

export function createCrosshairPlugin(options?: CrosshairOptions): Plugin {
  const color = options?.color ?? '#999'
  const dashArray = options?.dashArray ?? styleToDash(options?.style)
  const direction = options?.direction ?? 'both'
  const cleanups: (() => void)[] = []

  return {
    name: 'crosshair',
    install() {},
    postDraw(chart: D3Blueprint) {
      drawCrosshair(chart, direction, color, dashArray, options, cleanups)
    },
    destroy() { runCleanups(cleanups) },
  }
}
