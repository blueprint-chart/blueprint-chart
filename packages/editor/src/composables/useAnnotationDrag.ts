import { watch, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import type { AnnotationConfig } from '@blueprint-chart/lib'

const LINE_PAD = 4

function computeElbowPath(
  from: { x: number, y: number },
  to: { x: number, y: number },
  departVertical: boolean,
): string {
  const COT_40 = 1 / Math.tan(40 * Math.PI / 180)

  if (departVertical) {
    const vSign = to.y >= from.y ? 1 : -1
    const dy = Math.abs(to.y - from.y)
    const dx = Math.abs(to.x - from.x)
    const segLen = Math.max(dy - dx * COT_40, 12)
    const midX = from.x
    const midY = from.y + vSign * segLen
    return `M ${from.x} ${from.y} L ${midX} ${midY} L ${to.x} ${to.y}`
  }

  const hSign = to.x >= from.x ? 1 : -1
  const dx = Math.abs(to.x - from.x)
  const dy = Math.abs(to.y - from.y)
  const segLen = Math.max(dx - dy * COT_40, 12)
  const midX = from.x + hSign * segLen
  const midY = from.y
  return `M ${from.x} ${from.y} L ${midX} ${midY} L ${to.x} ${to.y}`
}

function buildPathD(
  from: { x: number, y: number },
  to: { x: number, y: number },
  style: string,
  departVertical: boolean,
): string {
  switch (style) {
    case 'curve-left':
    case 'curve-right': {
      const dx = to.x - from.x
      const dy = to.y - from.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const r = dist * 0.8
      const sweep = style === 'curve-right' ? 1 : 0
      return `M ${from.x} ${from.y} A ${r} ${r} 0 0 ${sweep} ${to.x} ${to.y}`
    }
    case 'elbow':
      return computeElbowPath(from, to, departVertical)
    default:
      return `M ${from.x} ${from.y} L ${to.x} ${to.y}`
  }
}

function shortenToward(
  anchor: { x: number, y: number },
  from: { x: number, y: number },
  distance: number,
): { x: number, y: number } {
  const dx = anchor.x - from.x
  const dy = anchor.y - from.y
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0 || distance <= 0) {
    return anchor
  }
  return {
    x: anchor.x - (dx / len) * distance,
    y: anchor.y - (dy / len) * distance,
  }
}

function findNearestMidpoint(
  midpoints: { x: number, y: number }[],
  targetX: number,
  targetY: number,
): { x: number, y: number } {
  let best = midpoints[0]
  let bestDist = (best.x - targetX) ** 2 + (best.y - targetY) ** 2
  for (let i = 1; i < midpoints.length; i++) {
    const d = (midpoints[i].x - targetX) ** 2 + (midpoints[i].y - targetY) ** 2
    if (d < bestDist) {
      best = midpoints[i]
      bestDist = d
    }
  }
  return best
}

type Side = { x: number, y: number, dist: number }

function nsCandidate(
  bbox: { x: number, y: number, width: number, height: number },
  targetY: number,
  cx: number,
  cy: number,
): Side {
  if (targetY < cy) {
    return { x: cx, y: bbox.y - LINE_PAD, dist: Math.abs(cy - targetY) }
  }
  return { x: cx, y: bbox.y + bbox.height + LINE_PAD, dist: Math.abs(targetY - cy) }
}

function ewCandidate(
  bbox: { x: number, y: number, width: number, height: number },
  targetX: number,
  cx: number,
  cy: number,
): Side {
  if (targetX > cx) {
    return { x: bbox.x + bbox.width + LINE_PAD, y: cy, dist: Math.abs(targetX - cx) }
  }
  return { x: bbox.x - LINE_PAD, y: cy, dist: Math.abs(cx - targetX) }
}

function collectEdgeCandidates(
  bbox: { x: number, y: number, width: number, height: number },
  targetX: number,
  targetY: number,
  cx: number,
  cy: number,
): Side[] {
  const candidates: Side[] = []
  if (targetX >= bbox.x && targetX <= bbox.x + bbox.width) {
    candidates.push(nsCandidate(bbox, targetY, cx, cy))
  }
  if (targetY >= bbox.y && targetY <= bbox.y + bbox.height) {
    candidates.push(ewCandidate(bbox, targetX, cx, cy))
  }
  return candidates
}

function bboxEdgeToward(
  bbox: { x: number, y: number, width: number, height: number },
  targetX: number,
  targetY: number,
): { x: number, y: number } {
  const cx = bbox.x + bbox.width / 2
  const cy = bbox.y + bbox.height / 2

  if (targetX === cx && targetY === cy) {
    return { x: cx, y: cy }
  }

  const candidates = collectEdgeCandidates(bbox, targetX, targetY, cx, cy)

  if (candidates.length > 0) {
    candidates.sort((a, b) => a.dist - b.dist)
    return { x: candidates[0].x, y: candidates[0].y }
  }

  const midpoints = [
    { x: cx, y: bbox.y - LINE_PAD },
    { x: cx, y: bbox.y + bbox.height + LINE_PAD },
    { x: bbox.x + bbox.width + LINE_PAD, y: cy },
    { x: bbox.x - LINE_PAD, y: cy },
  ]
  return findNearestMidpoint(midpoints, targetX, targetY)
}

interface AnchorInfo {
  anchorX: number | null
  anchorY: number | null
  circleRadius: number
}

function findAnchorFromCircle(circleEl: SVGCircleElement | null): AnchorInfo {
  if (!circleEl) {
    return { anchorX: null, anchorY: null, circleRadius: 0 }
  }
  return {
    anchorX: parseFloat(circleEl.getAttribute('cx') || '0'),
    anchorY: parseFloat(circleEl.getAttribute('cy') || '0'),
    circleRadius: parseFloat(circleEl.getAttribute('r') || '0'),
  }
}

function findAnchorFromLine(lineEl: SVGPathElement | null): { x: number, y: number } | null {
  if (!lineEl) {
    return null
  }
  const d = lineEl.getAttribute('d') || ''
  const parts = d.split(/[MLA]\s*/).filter(Boolean)
  if (parts.length >= 2) {
    const last = parts[parts.length - 1].trim().split(/[\s,]+/)
    if (last.length >= 2) {
      return {
        x: parseFloat(last[last.length - 2]),
        y: parseFloat(last[last.length - 1]),
      }
    }
  }
  return null
}

function getTransformOffset(el: SVGElement): { dx: number, dy: number } {
  const transformAttr = el.getAttribute('transform') || ''
  const match = transformAttr.match(/translate\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)/)
  return {
    dx: match ? parseFloat(match[1]) : 0,
    dy: match ? parseFloat(match[2]) : 0,
  }
}

function resolveMaxWidthPx(
  rawMaxWidth: number | string | undefined,
  fallbackWidth: number,
  chartWidth: number,
): number {
  if (rawMaxWidth == null) {
    return fallbackWidth
  }
  if (typeof rawMaxWidth === 'number' && rawMaxWidth > 0) {
    return rawMaxWidth
  }
  if (typeof rawMaxWidth === 'string') {
    if (rawMaxWidth.endsWith('%') && chartWidth > 0) {
      return (parseFloat(rawMaxWidth) / 100) * chartWidth
    }
    const parsed = parseFloat(rawMaxWidth)
    if (parsed > 0) {
      return parsed
    }
  }
  return fallbackWidth
}

function computeOverlayX(textAnchor: string, textX: number, width: number): number {
  if (textAnchor === 'middle') {
    return textX - width / 2
  }
  if (textAnchor === 'end') {
    return textX - width
  }
  return textX
}

function createOverlayRect(
  overlayX: number,
  bboxY: number,
  overlayWidth: number,
  bboxHeight: number,
  pad: number,
): SVGRectElement {
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  rect.setAttribute('x', String(overlayX - pad))
  rect.setAttribute('y', String(bboxY - pad))
  rect.setAttribute('width', String(overlayWidth + pad * 2))
  rect.setAttribute('height', String(bboxHeight + pad * 2))
  rect.setAttribute('fill', 'rgba(255,245,157,0.4)')
  rect.setAttribute('rx', '3')
  rect.style.cursor = 'grab'
  rect.style.pointerEvents = 'all'
  return rect
}

function updateTextPosition(textEl: SVGTextElement, x: number, y: number) {
  textEl.setAttribute('x', String(x))
  textEl.setAttribute('y', String(y))
  const tspans = textEl.querySelectorAll('tspan')
  for (const ts of tspans) {
    ts.setAttribute('x', String(x))
  }
}

function updateOverlayRect(
  rect: SVGRectElement,
  textX: number,
  bboxY: number,
  overlayWidth: number,
  bboxHeight: number,
  pad: number,
  textAnchor: string,
) {
  const newOverlayX = computeOverlayX(textAnchor, textX, overlayWidth)
  rect.setAttribute('x', String(newOverlayX - pad))
  rect.setAttribute('y', String(bboxY - pad))
  rect.setAttribute('width', String(overlayWidth + pad * 2))
  rect.setAttribute('height', String(bboxHeight + pad * 2))
}

function updateConnectingLine(
  lineEl: SVGPathElement,
  newBbox: { x: number, y: number, width: number, height: number },
  anchorX: number,
  anchorY: number,
  lineTargetDist: number,
  lineStyle: string,
) {
  const edge = bboxEdgeToward(newBbox, anchorX, anchorY)
  const lineEnd = lineTargetDist > 0
    ? shortenToward({ x: anchorX, y: anchorY }, edge, lineTargetDist)
    : { x: anchorX, y: anchorY }
  const bboxCx = newBbox.x + newBbox.width / 2
  const departVertical = Math.abs(edge.x - bboxCx) < 1
  lineEl.setAttribute('d', buildPathD(edge, lineEnd, lineStyle, departVertical))
}

function computeUpdatedFreeCoord(
  prev: unknown,
  delta: number,
  ctxSize: number,
): number | string {
  if (typeof prev === 'number') {
    return +(prev + (delta / ctxSize) * 100).toFixed(1)
  }
  const str = String(prev)
  if (str.endsWith('px')) {
    return `${Math.round(parseFloat(str) + delta)}px`
  }
  return +((parseFloat(str) || 0) + (delta / ctxSize) * 100).toFixed(1)
}

function buildFreeUpdate(
  ann: AnnotationConfig,
  dx: number,
  dy: number,
  annG: SVGGElement,
  svg: SVGSVGElement,
): Record<string, unknown> {
  const updated = { ...ann } as Record<string, unknown>
  const annGroup = annG.closest('.bc-annotations') as SVGGElement | null
  const ctxW = parseFloat(annGroup?.getAttribute('data-ctx-width') || '') || parseFloat(svg.getAttribute('width') || '600')
  const ctxH = parseFloat(annGroup?.getAttribute('data-ctx-height') || '') || parseFloat(svg.getAttribute('height') || '400')
  updated.x = computeUpdatedFreeCoord(ann.x, dx, ctxW)
  updated.y = computeUpdatedFreeCoord(ann.y, dy, ctxH)
  return updated
}

function buildPointUpdate(
  ann: AnnotationConfig,
  dx: number,
  dy: number,
): Record<string, unknown> {
  const updated = { ...ann } as Record<string, unknown>
  const prevOffsetX = (updated.textOffsetX as number | undefined) ?? -42
  const prevOffsetY = (updated.textOffsetY as number | undefined) ?? -42
  updated.textOffsetX = Math.round(prevOffsetX + dx)
  updated.textOffsetY = Math.round(prevOffsetY + dy)
  return updated
}

interface DragContext {
  textEl: SVGTextElement
  lineEl: SVGPathElement | null
  overlay: SVGRectElement
  svg: SVGSVGElement
  annG: SVGGElement
  origTextX: number
  origTextY: number
  overlayWidth: number
  pad: number
  transformDx: number
  transformDy: number
  hasAnchor: boolean
  anchorX: number
  anchorY: number
  lineTargetDist: number
  lineStyle: string
}

interface DragState {
  dragging: boolean
  startX: number
  startY: number
  rafId: number
  lastClientX: number
  lastClientY: number
}

function handleDragVisuals(ctx: DragContext, state: DragState) {
  const ctm = ctx.svg.getScreenCTM()
  if (!ctm) {
    return
  }

  const dx = (state.lastClientX - state.startX) / ctm.a
  const dy = (state.lastClientY - state.startY) / ctm.d
  const newTextX = ctx.origTextX + dx
  const newTextY = ctx.origTextY + dy

  updateTextPosition(ctx.textEl, newTextX, newTextY)

  const newRawBbox = ctx.textEl.getBBox()
  const newBbox = { x: newRawBbox.x + ctx.transformDx, y: newRawBbox.y + ctx.transformDy, width: newRawBbox.width, height: newRawBbox.height }
  const anchor = ctx.textEl.getAttribute('text-anchor') || 'middle'
  updateOverlayRect(ctx.overlay, newTextX, newBbox.y, ctx.overlayWidth, newBbox.height, ctx.pad, anchor)

  if (ctx.lineEl && ctx.hasAnchor) {
    updateConnectingLine(ctx.lineEl, newBbox, ctx.anchorX, ctx.anchorY, ctx.lineTargetDist, ctx.lineStyle)
  }

  state.rafId = 0
}

function finishDragState(ctx: DragContext, state: DragState): boolean {
  if (!state.dragging) {
    return false
  }
  state.dragging = false
  ctx.overlay.style.cursor = 'grab'
  if (state.rafId) {
    cancelAnimationFrame(state.rafId)
    state.rafId = 0
  }
  return true
}

function applyDragUpdate(
  ann: AnnotationConfig,
  dx: number,
  dy: number,
  ctx: DragContext,
  index: number,
  onUpdate: (index: number, ann: AnnotationConfig) => void,
) {
  let updated: Record<string, unknown>
  if (ann.kind === 'free') {
    updated = buildFreeUpdate(ann, dx, dy, ctx.annG, ctx.svg)
  }
  else if (ann.kind === 'point') {
    updated = buildPointUpdate(ann, dx, dy)
  }
  else {
    return
  }
  onUpdate(index, updated as AnnotationConfig)
}

function computeSvgDelta(e: PointerEvent, state: DragState, svg: SVGSVGElement): { dx: number, dy: number } | null {
  const ctm = svg.getScreenCTM()
  if (!ctm) {
    return null
  }
  return {
    dx: (e.clientX - state.startX) / ctm.a,
    dy: (e.clientY - state.startY) / ctm.d,
  }
}

function handlePointerUp(
  e: PointerEvent,
  ctx: DragContext,
  state: DragState,
  annotations: Ref<AnnotationConfig[]>,
  index: number,
  onUpdate: (index: number, ann: AnnotationConfig) => void,
) {
  if (!finishDragState(ctx, state)) {
    return
  }
  const delta = computeSvgDelta(e, state, ctx.svg)
  if (!delta) {
    return
  }
  if (Math.abs(delta.dx) < 1 && Math.abs(delta.dy) < 1) {
    updateTextPosition(ctx.textEl, ctx.origTextX, ctx.origTextY)
    return
  }
  const ann = annotations.value[index]
  if (!ann) {
    return
  }
  applyDragUpdate(ann, delta.dx, delta.dy, ctx, index, onUpdate)
}

function findAnnotationElements(container: HTMLElement, index: number) {
  const svg = container.querySelector('svg')
  if (!svg) {
    return null
  }
  const annG = svg.querySelector(`g[data-annotation-index="${index}"]`) as SVGGElement | null
  if (!annG) {
    return null
  }
  const textEl = annG.querySelector('.bc-annotation-text') as SVGTextElement | null
  if (!textEl) {
    return null
  }
  return { svg, annG, textEl }
}

function resolveAnchor(annG: SVGGElement): AnchorInfo & { lineEl: SVGPathElement | null } {
  const circleEl = annG.querySelector('.bc-annotation-circle') as SVGCircleElement | null
  const lineEl = annG.querySelector('.bc-annotation-line') as SVGPathElement | null
  const info = findAnchorFromCircle(circleEl)

  if (info.anchorX === null && lineEl) {
    const lineAnchor = findAnchorFromLine(lineEl)
    if (lineAnchor) {
      info.anchorX = lineAnchor.x
      info.anchorY = lineAnchor.y
    }
  }

  return { ...info, lineEl }
}

function readLineConfig(ann: AnnotationConfig): { lineStyle: string, lineTargetDist: number, circleRadius: number } {
  const lineStyle: string = ('lineStyle' in ann ? (ann as Record<string, unknown>).lineStyle : 'direct') as string || 'direct'
  const circleRadius = 0
  const lineTargetDist = circleRadius > 0
    ? circleRadius + (('lineTargetDistance' in ann ? (ann as Record<string, unknown>).lineTargetDistance : 5) as number || 5)
    : 0
  return { lineStyle, lineTargetDist, circleRadius }
}

function computeTextLayout(textEl: SVGTextElement, svg: SVGSVGElement, ann: AnnotationConfig) {
  const { dx: transformDx, dy: transformDy } = getTransformOffset(textEl)
  const rawBbox = textEl.getBBox()
  const bbox = { x: rawBbox.x + transformDx, y: rawBbox.y + transformDy, width: rawBbox.width, height: rawBbox.height }
  const rawMaxWidth = (ann as Record<string, unknown>).maxWidth as number | string | undefined
  const chartWidth = parseFloat(svg.getAttribute('width') || '0')
  const overlayWidth = resolveMaxWidthPx(rawMaxWidth, bbox.width, chartWidth)
  const origTextX = parseFloat(textEl.getAttribute('x') || '0')
  const origTextY = parseFloat(textEl.getAttribute('y') || '0')
  return { transformDx, transformDy, bbox, overlayWidth, origTextX, origTextY }
}

function resolveLineTargetDist(ann: AnnotationConfig, circleRadius: number): number {
  if (circleRadius <= 0) {
    return 0
  }
  const raw = ('lineTargetDistance' in ann ? (ann as Record<string, unknown>).lineTargetDistance : 5) as number || 5
  return circleRadius + raw
}

function buildDragContext(
  elements: { svg: SVGSVGElement, annG: SVGGElement, textEl: SVGTextElement },
  ann: AnnotationConfig,
  anchorResult: AnchorInfo & { lineEl: SVGPathElement | null },
): DragContext {
  const { textEl, svg, annG } = elements
  const pad = 4
  const layout = computeTextLayout(textEl, svg, ann)
  const textAnchor = textEl.getAttribute('text-anchor') || 'middle'
  const overlayX = computeOverlayX(textAnchor, layout.origTextX, layout.overlayWidth)
  const overlayRect = createOverlayRect(overlayX, layout.bbox.y, layout.overlayWidth, layout.bbox.height, pad)
  annG.appendChild(overlayRect)
  const lineConfig = readLineConfig(ann)
  const lineTargetDist = resolveLineTargetDist(ann, anchorResult.circleRadius)

  return {
    textEl, lineEl: anchorResult.lineEl, overlay: overlayRect, svg, annG,
    origTextX: layout.origTextX, origTextY: layout.origTextY,
    overlayWidth: layout.overlayWidth, pad,
    transformDx: layout.transformDx, transformDy: layout.transformDy,
    hasAnchor: anchorResult.anchorX !== null && anchorResult.anchorY !== null,
    anchorX: anchorResult.anchorX ?? 0, anchorY: anchorResult.anchorY ?? 0,
    lineTargetDist, lineStyle: lineConfig.lineStyle,
  }
}

function createDragState(): DragState {
  return { dragging: false, startX: 0, startY: 0, rafId: 0, lastClientX: 0, lastClientY: 0 }
}

function makePointerDownHandler(ctx: DragContext, state: DragState) {
  return (e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    state.dragging = true
    state.startX = e.clientX
    state.startY = e.clientY
    state.lastClientX = e.clientX
    state.lastClientY = e.clientY
    ctx.overlay.style.cursor = 'grabbing'
    ctx.overlay.setPointerCapture(e.pointerId)
  }
}

function makePointerMoveHandler(ctx: DragContext, state: DragState) {
  return (e: PointerEvent) => {
    if (!state.dragging) {
      return
    }
    e.preventDefault()
    state.lastClientX = e.clientX
    state.lastClientY = e.clientY
    if (!state.rafId) {
      state.rafId = requestAnimationFrame(() => handleDragVisuals(ctx, state))
    }
  }
}

function attachDragListeners(
  ctx: DragContext,
  annotations: Ref<AnnotationConfig[]>,
  index: number,
  onUpdate: (index: number, ann: AnnotationConfig) => void,
): () => void {
  const state = createDragState()
  const onDown = makePointerDownHandler(ctx, state)
  const onMove = makePointerMoveHandler(ctx, state)
  const onUp = (e: PointerEvent) => handlePointerUp(e, ctx, state, annotations, index, onUpdate)

  ctx.overlay.addEventListener('pointerdown', onDown)
  ctx.overlay.addEventListener('pointermove', onMove)
  ctx.overlay.addEventListener('pointerup', onUp)

  return () => {
    if (state.rafId) {
      cancelAnimationFrame(state.rafId)
    }
    ctx.overlay.removeEventListener('pointerdown', onDown)
    ctx.overlay.removeEventListener('pointermove', onMove)
    ctx.overlay.removeEventListener('pointerup', onUp)
  }
}

interface OverlayState {
  overlay: SVGRectElement | null
  cleanup: (() => void) | null
}

function removeOverlay(os: OverlayState) {
  if (os.overlay?.parentNode) {
    os.overlay.parentNode.removeChild(os.overlay)
  }
  os.overlay = null
  if (os.cleanup) {
    os.cleanup()
    os.cleanup = null
  }
}

function findDraggableAnnotation(
  containerRef: Ref<HTMLElement | null>,
  annotations: Ref<AnnotationConfig[]>,
  selectedIndex: Ref<number | null>,
) {
  const container = containerRef.value
  const index = selectedIndex.value
  if (!container || index === null) {
    return null
  }
  const ann = annotations.value[index]
  if (!ann || ann.kind === 'range') {
    return null
  }
  const elements = findAnnotationElements(container, index)
  if (!elements) {
    return null
  }
  return { ann, elements, index }
}

function setupOverlay(
  os: OverlayState,
  containerRef: Ref<HTMLElement | null>,
  annotations: Ref<AnnotationConfig[]>,
  selectedIndex: Ref<number | null>,
  onUpdate: (index: number, ann: AnnotationConfig) => void,
) {
  removeOverlay(os)
  const target = findDraggableAnnotation(containerRef, annotations, selectedIndex)
  if (!target) {
    return
  }
  const anchorResult = resolveAnchor(target.elements.annG)
  const ctx = buildDragContext(target.elements, target.ann, anchorResult)
  os.overlay = ctx.overlay
  os.cleanup = attachDragListeners(ctx, annotations, target.index, onUpdate)
}

export function useAnnotationDrag(
  containerRef: Ref<HTMLElement | null>,
  annotations: Ref<AnnotationConfig[]>,
  selectedIndex: Ref<number | null>,
  onUpdate: (index: number, ann: AnnotationConfig) => void,
) {
  const os: OverlayState = { overlay: null, cleanup: null }
  const refresh = () => setupOverlay(os, containerRef, annotations, selectedIndex, onUpdate)

  watch(selectedIndex, () => {
    requestAnimationFrame(refresh)
  })

  watch(annotations, () => {
    if (selectedIndex.value !== null) {
      requestAnimationFrame(refresh)
    }
  }, { deep: true })

  onUnmounted(() => removeOverlay(os))
}
