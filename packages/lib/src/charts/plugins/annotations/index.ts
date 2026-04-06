import * as d3 from 'd3'
import type { D3Blueprint, Plugin } from 'd3-blueprint'
import type { AnnotationConfig } from '../../types'
import { AnnotationKind, AnnotationLineStyle } from '../../../enums'
import { getTransitionDuration, DEFAULT_TRANSITION_MS } from '../../motion'
import type { AnnotationContext } from './context'
import { snapshotAnnotations, readLineGeometry } from './snapshots'
import type { AnnotationSnapshot, LineGeometry } from './snapshots'
import { ensureArrowMarker } from './shared'
import { renderPointAnnotation } from './point-renderer'
import { renderRangeAnnotation } from './range-renderer'
import { renderFreeAnnotation } from './free-renderer'

// Public re-exports
export type { AnnotationContext } from './context'
export type { LineGeometry, AnnotationSnapshot } from './snapshots'
export { snapshotAnnotations } from './snapshots'
export { computeDirectionOffset, rotateDirectionForHorizontal } from './direction-helpers'
export {
  computeAnchorPoint,
  bboxEdgeToward,
  ensureArrowMarker,
  renderTargetCircle,
  renderConnectingLine,
  renderAnnotationText,
} from './shared'

// ---------------------------------------------------------------------------
// Elbow path from interpolated coordinates
// ---------------------------------------------------------------------------

function elbowPathFromCoords(
  calloutX: number,
  calloutY: number,
  tipX: number,
  tipY: number,
): string {
  const midX = tipX + 0.45 * (calloutX - tipX)
  return `M ${calloutX} ${calloutY} L ${midX} ${calloutY} L ${tipX} ${tipY}`
}

// ---------------------------------------------------------------------------
// Draw entrance for lines (stroke-dashoffset animation)
// ---------------------------------------------------------------------------

function applyDrawEntrance(lineEl: SVGElement, durationMs: number): void {
  const hasArrow = lineEl.hasAttribute('marker-end')
  const geo = readLineGeometry(lineEl.parentElement!)

  if (hasArrow && geo) {
    const sel = d3.select(lineEl)
    const finalD = lineEl.getAttribute('d')!
    const startD = `M ${geo.fromX} ${geo.fromY} L ${geo.fromX} ${geo.fromY}`
    sel.attr('d', startD)

    if (geo.style === AnnotationLineStyle.Elbow) {
      const endCoords = { tipX: geo.toX, tipY: geo.toY, calloutX: geo.fromX, calloutY: geo.fromY }
      const startCoords = { tipX: geo.fromX, tipY: geo.fromY, calloutX: geo.fromX, calloutY: geo.fromY }
      sel.transition()
        .duration(durationMs)
        .ease(d3.easeCubicOut)
        .attrTween('d', () => {
          const interp = d3.interpolateObject(startCoords, endCoords)
          return (t: number) => {
            const c = interp(t)
            return elbowPathFromCoords(c.calloutX, c.calloutY, c.tipX, c.tipY)
          }
        })
    }
    else if (geo.style === AnnotationLineStyle.CurveLeft || geo.style === AnnotationLineStyle.CurveRight) {
      const from = { x: geo.fromX, y: geo.fromY }
      const to = { x: geo.toX, y: geo.toY }
      const dx = to.x - from.x
      const dy = to.y - from.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const r = dist * 0.8
      const sweep = geo.style === AnnotationLineStyle.CurveRight ? 1 : 0

      const halfChord = dist / 2
      const h = halfChord < r ? Math.sqrt(r * r - halfChord * halfChord) : 0
      const midX = (from.x + to.x) / 2
      const midY = (from.y + to.y) / 2
      const perpX = dist > 0 ? -dy / dist : 0
      const perpY = dist > 0 ? dx / dist : 0
      const centerSign = sweep === 1 ? 1 : -1
      const cx = midX + centerSign * h * perpX
      const cy = midY + centerSign * h * perpY

      const startAngle = Math.atan2(from.y - cy, from.x - cx)
      const endAngle = Math.atan2(to.y - cy, to.x - cx)
      let delta = endAngle - startAngle
      if (sweep === 1 && delta <= 0) {
        delta += 2 * Math.PI
      }
      if (sweep === 0 && delta >= 0) {
        delta -= 2 * Math.PI
      }

      sel.transition()
        .duration(durationMs)
        .ease(d3.easeCubicOut)
        .attrTween('d', () => (t: number) => {
          if (t >= 0.98) {
            return finalD
          }
          const angle = startAngle + t * delta
          const px = cx + r * Math.cos(angle)
          const py = cy + r * Math.sin(angle)
          return `M ${from.x} ${from.y} A ${r} ${r} 0 0 ${sweep} ${px} ${py}`
        })
    }
    else {
      sel.transition()
        .duration(durationMs)
        .ease(d3.easeCubicOut)
        .attrTween('d', () => {
          const interpX = d3.interpolateNumber(geo.fromX, geo.toX)
          const interpY = d3.interpolateNumber(geo.fromY, geo.toY)
          return (t: number) => `M ${geo.fromX} ${geo.fromY} L ${interpX(t)} ${interpY(t)}`
        })
    }
  }
  else {
    lineEl.setAttribute('stroke-dasharray', '1')
    lineEl.setAttribute('stroke-dashoffset', '1')

    const sel = d3.select(lineEl)
    sel.transition()
      .duration(durationMs)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', '0')
      .on('end', () => {
        lineEl.removeAttribute('stroke-dasharray')
        lineEl.removeAttribute('stroke-dashoffset')
      })
  }
}

// ---------------------------------------------------------------------------
// Line move transition (tween path d attribute)
// ---------------------------------------------------------------------------

function applyLineMoveTransition(
  lineEl: SVGElement,
  oldLine: LineGeometry,
  durationMs: number,
): void {
  const newLine = readLineGeometry(lineEl.parentElement!)
  if (!newLine) {
    return
  }

  const sel = d3.select(lineEl)

  if (oldLine.style === AnnotationLineStyle.Elbow && newLine.style === AnnotationLineStyle.Elbow) {
    const oldCoords = { tipX: oldLine.toX, tipY: oldLine.toY, calloutX: oldLine.fromX, calloutY: oldLine.fromY }
    const newCoords = { tipX: newLine.toX, tipY: newLine.toY, calloutX: newLine.fromX, calloutY: newLine.fromY }

    sel.attr('d', elbowPathFromCoords(oldCoords.calloutX, oldCoords.calloutY, oldCoords.tipX, oldCoords.tipY))

    sel.transition()
      .duration(durationMs)
      .ease(d3.easeCubicInOut)
      .attrTween('d', () => {
        const interp = d3.interpolateObject(oldCoords, newCoords)
        return (t: number) => {
          const c = interp(t)
          return elbowPathFromCoords(c.calloutX, c.calloutY, c.tipX, c.tipY)
        }
      })
  }
  else {
    const oldFrom = { x: oldLine.fromX, y: oldLine.fromY }
    const oldTo = { x: oldLine.toX, y: oldLine.toY }
    const newFrom = { x: newLine.fromX, y: newLine.fromY }
    const newTo = { x: newLine.toX, y: newLine.toY }

    const newD = lineEl.getAttribute('d')!
    const oldD = `M ${oldFrom.x} ${oldFrom.y} L ${oldTo.x} ${oldTo.y}`
    sel.attr('d', oldD)

    sel.transition()
      .duration(durationMs)
      .ease(d3.easeCubicInOut)
      .attrTween('d', () => {
        const interpFrom = d3.interpolateObject(oldFrom, newFrom)
        const interpTo = d3.interpolateObject(oldTo, newTo)
        return (t: number) => {
          if (t >= 0.98) {
            return newD
          }
          const f = interpFrom(t)
          const tt = interpTo(t)
          if (newLine.style === AnnotationLineStyle.Direct || oldLine.style === AnnotationLineStyle.Direct) {
            return `M ${f.x} ${f.y} L ${tt.x} ${tt.y}`
          }
          const dx = tt.x - f.x
          const dy = tt.y - f.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const r = dist * 0.8
          const sweep = newLine.style === AnnotationLineStyle.CurveRight ? 1 : 0
          return `M ${f.x} ${f.y} A ${r} ${r} 0 0 ${sweep} ${tt.x} ${tt.y}`
        }
      })
  }
}

// ---------------------------------------------------------------------------
// Apply annotation transitions
// ---------------------------------------------------------------------------

function applyAnnotationTransitions(
  container: Element,
  rangeContainer: Element,
  oldSnapshots: Map<string, AnnotationSnapshot>,
  durationMs: number,
): void {
  if (durationMs <= 0) {
    return
  }

  const newGroups = [
    ...container.querySelectorAll('g[data-annotation-id]'),
    ...rangeContainer.querySelectorAll('g[data-annotation-id]'),
  ]

  const newIds = new Set<string>()
  for (const el of newGroups) {
    const id = el.getAttribute('data-annotation-id')!
    newIds.add(id)

    const old = oldSnapshots.get(id)
    if (old) {
      const lineEl = el.querySelector('.bc-annotation-line') as SVGElement | null
      if (lineEl && old.line) {
        applyLineMoveTransition(lineEl, old.line, durationMs)
      }

      try {
        const newRect = (el as SVGGraphicsElement).getBBox()
        const dx = old.rect.x - newRect.x
        const dy = old.rect.y - newRect.y
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          const children = el.querySelectorAll('.bc-annotation-text, .bc-annotation-circle')
          for (const child of children) {
            const g = child as SVGElement
            g.style.transition = 'none'
            g.setAttribute('transform', `translate(${dx}, ${dy})`)
            void g.getBoundingClientRect()
            g.style.transition = `transform ${durationMs}ms ease`
            g.setAttribute('transform', 'translate(0, 0)')
          }
        }
      }
      catch { /* getBBox may fail */ }
    }
    else {
      const lineEl = el.querySelector('.bc-annotation-line') as SVGElement | null
      if (lineEl) {
        applyDrawEntrance(lineEl, durationMs)
      }

      const textAndCircle = el.querySelectorAll('.bc-annotation-text, .bc-annotation-circle')
      for (const child of textAndCircle) {
        const g = child as SVGElement
        g.style.opacity = '0'
        void g.getBoundingClientRect()
        g.style.transition = `opacity ${durationMs}ms ease`
        g.style.opacity = '1'
      }
    }
  }

  for (const [id, snapshot] of oldSnapshots) {
    if (!newIds.has(id)) {
      const clone = snapshot.element.cloneNode(true) as SVGElement
      container.appendChild(clone)
      clone.style.opacity = '1'
      void clone.getBoundingClientRect()
      clone.style.transition = `opacity ${durationMs}ms ease`
      clone.style.opacity = '0'
      setTimeout(() => clone.remove(), durationMs)
    }
  }
}

// ---------------------------------------------------------------------------
// Dynamic viewBox expansion
// ---------------------------------------------------------------------------

function expandSvgToFitAnnotations(svg: SVGSVGElement | null): void {
  if (!svg) {
    return
  }

  const svgW = parseFloat(svg.getAttribute('width') || '0')
  const svgH = parseFloat(svg.getAttribute('height') || '0')
  if (!svgW || !svgH) {
    return
  }

  const totalBBox = svg.getBBox()
  if (totalBBox.width === 0 && totalBBox.height === 0) {
    return
  }

  const pad = 8
  const rawMinX = totalBBox.x
  const rawMinY = totalBBox.y
  const rawMaxX = totalBBox.x + totalBBox.width
  const rawMaxY = totalBBox.y + totalBBox.height

  const vbMinX = rawMinX < 0 ? rawMinX - pad : 0
  const vbMinY = rawMinY < 0 ? rawMinY - pad : 0
  const vbMaxX = rawMaxX > svgW ? rawMaxX + pad : svgW
  const vbMaxY = rawMaxY > svgH ? rawMaxY + pad : svgH

  const needsExpand = vbMinX < 0 || vbMinY < 0 || vbMaxX > svgW || vbMaxY > svgH

  if (needsExpand) {
    d3.select(svg)
      .attr('viewBox', `${vbMinX} ${vbMinY} ${vbMaxX - vbMinX} ${vbMaxY - vbMinY}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
  }
}

// ---------------------------------------------------------------------------
// Standalone render (outside clip group)
// ---------------------------------------------------------------------------

export function renderAnnotations(
  parent: SVGGElement,
  annotations: AnnotationConfig[],
  ctx: AnnotationContext,
): void {
  const svg = parent.ownerSVGElement ?? parent
  d3.select(svg).style('overflow', 'visible')
  ensureArrowMarker(svg)

  const base = d3.select(parent)

  let oldSnapshots: Map<string, AnnotationSnapshot> | undefined
  if (ctx.transition) {
    if (ctx.priorAnnotations && ctx.priorAnnotations.size > 0) {
      oldSnapshots = ctx.priorAnnotations
    }
    else {
      const existingContainer = parent.querySelector('.bc-annotations')
      const existingRangeContainer = parent.querySelector('.bc-annotations-range')
      if (existingContainer || existingRangeContainer) {
        oldSnapshots = new Map()
        if (existingContainer) {
          for (const [k, v] of snapshotAnnotations(existingContainer)) {
            oldSnapshots.set(k, v)
          }
        }
        if (existingRangeContainer) {
          for (const [k, v] of snapshotAnnotations(existingRangeContainer)) {
            oldSnapshots.set(k, v)
          }
        }
      }
    }
  }

  parent.querySelectorAll('.bc-annotations, .bc-annotations-range').forEach(el => el.remove())

  const rangeGroup = base.insert('g', ':first-child').attr('class', 'bc-annotations-range') as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
  const g = base.append('g')
    .attr('class', 'bc-annotations')
    .attr('data-ctx-width', String(ctx.width))
    .attr('data-ctx-height', String(ctx.height)) as unknown as d3.Selection<SVGGElement, unknown, null, undefined>

  for (let i = 0; i < annotations.length; i++) {
    const ann = annotations[i]
    const kind = ann.kind ?? AnnotationKind.Point

    switch (kind) {
      case AnnotationKind.Point:
        renderPointAnnotation(g, ann, ctx, i)
        break
      case AnnotationKind.Range:
        renderRangeAnnotation(rangeGroup, ann, ctx, i, g)
        break
      case AnnotationKind.Free:
        renderFreeAnnotation(g, ann, ctx, i)
        break
    }
  }

  if (ctx.transition) {
    const duration = getTransitionDuration(DEFAULT_TRANSITION_MS)
    applyAnnotationTransitions(g.node()!, rangeGroup.node()!, oldSnapshots ?? new Map(), duration)
  }

  expandSvgToFitAnnotations(svg as SVGSVGElement | null)
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function createAnnotationPlugin(
  annotations: AnnotationConfig[],
  ctx: AnnotationContext,
): Plugin {
  return {
    name: 'annotations',

    install() {},

    postDraw(chart: D3Blueprint) {
      const base = (chart as unknown as { base: d3.Selection<SVGElement, unknown, null, undefined> }).base

      const svg = base.node()?.ownerSVGElement ?? base.node()
      if (svg) {
        d3.select(svg).style('overflow', 'visible')
      }
      ensureArrowMarker(svg)

      const baseNode = base.node()
      const parentNode = baseNode?.parentNode as SVGGElement | null
      const target = parentNode && parentNode !== svg
        ? d3.select(parentNode) as unknown as d3.Selection<SVGElement, unknown, null, undefined>
        : base

      const targetEl = target.node() as Element
      let oldSnapshots: Map<string, AnnotationSnapshot> | undefined
      if (ctx.transition) {
        if (ctx.priorAnnotations && ctx.priorAnnotations.size > 0) {
          oldSnapshots = ctx.priorAnnotations
        }
        else if (targetEl) {
          const existingContainer = targetEl.querySelector('.bc-annotations')
          const existingRangeContainer = targetEl.querySelector('.bc-annotations-range')
          if (existingContainer || existingRangeContainer) {
            oldSnapshots = new Map()
            if (existingContainer) {
              for (const [k, v] of snapshotAnnotations(existingContainer)) {
                oldSnapshots.set(k, v)
              }
            }
            if (existingRangeContainer) {
              for (const [k, v] of snapshotAnnotations(existingRangeContainer)) {
                oldSnapshots.set(k, v)
              }
            }
          }
        }
      }

      if (targetEl) {
        targetEl.querySelectorAll('.bc-annotations, .bc-annotations-range').forEach(el => el.remove())
      }

      const rangeGroup = target.insert('g', ':first-child').attr('class', 'bc-annotations-range') as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
      const g = target.append('g')
        .attr('class', 'bc-annotations')
        .attr('data-ctx-width', String(ctx.width))
        .attr('data-ctx-height', String(ctx.height)) as unknown as d3.Selection<SVGGElement, unknown, null, undefined>

      for (let i = 0; i < annotations.length; i++) {
        const ann = annotations[i]
        const kind = ann.kind ?? AnnotationKind.Point

        switch (kind) {
          case AnnotationKind.Point:
            renderPointAnnotation(g, ann, ctx, i)
            break
          case AnnotationKind.Range:
            renderRangeAnnotation(rangeGroup, ann, ctx, i, g)
            break
          case AnnotationKind.Free:
            renderFreeAnnotation(g, ann, ctx, i)
            break
        }
      }

      if (ctx.transition) {
        const duration = getTransitionDuration(DEFAULT_TRANSITION_MS)
        applyAnnotationTransitions(g.node()!, rangeGroup.node()!, oldSnapshots ?? new Map(), duration)
      }

      expandSvgToFitAnnotations(svg as SVGSVGElement | null)
    },
  }
}
