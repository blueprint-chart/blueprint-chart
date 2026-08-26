import * as d3 from 'd3'
import { CompassDirection, AnnotationLineStyle } from '../../types'
import type { AnnotationConfig, StrokeStyle } from '../../types'
import { DIRECTION_VECTORS, computeDirectionOffset } from './direction-helpers'
import { resolveMaxWidth, DEFAULT_MAX_WIDTH_RATIO } from './position-helpers'
import type { AnnotationContext } from './context'
import {
  computeAnchorPoint,
  bboxEdgeToward,
  renderTargetCircle,
  resolveCircleRadius,
  renderAnnotationText,
  renderConnectingLine,
  scaleXValue,
} from './shared'

// ---------------------------------------------------------------------------
// Infer text anchor from offset vector
// ---------------------------------------------------------------------------

function inferTextAnchorFromOffset(offsetX: number): string {
  if (offsetX < -4) {
    return 'end'
  }
  if (offsetX > 4) {
    return 'start'
  }
  return 'middle'
}

// ---------------------------------------------------------------------------
// Datum center helper
// ---------------------------------------------------------------------------

function datumCenter(
  datum: { label: string, value: number },
  scaleX: AnnotationContext['scaleX'],
  scaleY: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
): { x: number, y: number } {
  if ('bandwidth' in scaleX) {
    const band = scaleX as d3.ScaleBand<string>
    return { x: (band(datum.label) ?? 0) + band.bandwidth() / 2, y: scaleY(datum.value) }
  }
  return { x: scaleXValue(scaleX, datum.label), y: scaleY(datum.value) }
}

// ---------------------------------------------------------------------------
// Point annotation renderer
// ---------------------------------------------------------------------------

export function renderPointAnnotation(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  ann: AnnotationConfig & { target?: string },
  ctx: AnnotationContext,
  index: number,
): void {
  const target = 'target' in ann ? (ann as { target: string }).target : undefined
  if (!target) {
    return
  }

  const datum = ctx.data.find(d => d.label === target)
  if (!datum) {
    return
  }

  const annG = g.append('g').attr('data-annotation-index', String(index))
  const annotationKey = ann.key
  if (annotationKey) {
    annG.attr('data-annotation-id', annotationKey)
  }

  const lineConfig = ann as { showLine?: boolean, showArrow?: boolean, lineStyle?: AnnotationLineStyle, lineWeight?: number, lineTargetDistance?: number, showCircle?: boolean, circleSize?: number, anchorDirection?: CompassDirection, textOffsetX?: number, textOffsetY?: number }
  const anchorDir = lineConfig.anchorDirection ?? CompassDirection.N
  const anchor = computeAnchorPoint(datum, ctx.scaleX, ctx.scaleY, anchorDir, ctx.orientation)

  let tx: number
  let ty: number
  const legacyAnn = ann as unknown as Record<string, unknown>

  if (legacyAnn.dx != null || legacyAnn.dy != null) {
    const { x: cx, y: cy } = datumCenter(datum, ctx.scaleX, ctx.scaleY)
    tx = cx + (Number(legacyAnn.dx) || 40)
    ty = cy + (Number(legacyAnn.dy) || -40)
  }
  else if (legacyAnn.direction != null && legacyAnn.textOffsetX == null) {
    const { x: cx, y: cy } = datumCenter(datum, ctx.scaleX, ctx.scaleY)
    const direction = legacyAnn.direction as CompassDirection
    const distance = (legacyAnn.anchorDistance as number | undefined) ?? 60
    const offset = computeDirectionOffset(direction, distance)
    tx = cx + offset.dx
    ty = cy + offset.dy
  }
  else {
    tx = anchor.x + (lineConfig.textOffsetX ?? -42)
    ty = anchor.y + (lineConfig.textOffsetY ?? -42)
  }

  const lineColor = (ann as unknown as Record<string, unknown>).circleColor as string | undefined ?? '#666'

  const circleConfig = ann as { showCircle?: boolean, circleSize?: number, circleStyle?: StrokeStyle }
  if (circleConfig.showCircle) {
    renderTargetCircle(annG, anchor.x, anchor.y, {
      size: circleConfig.circleSize,
      style: circleConfig.circleStyle,
      color: lineColor,
    })
  }

  // Clamp the label (and the connector's fallback start) to the canvas so a
  // large textOffsetY / legacy dy can't push it off-screen. textAnchor stays
  // keyed off the unclamped offset so alignment relative to the target holds.
  const clampedX = Math.max(4, Math.min(tx, ctx.width - 4))
  const clampedY = Math.max(4, Math.min(ty, ctx.height - 4))

  if (ann.text) {
    const textAnchor = inferTextAnchorFromOffset(tx - anchor.x)
    renderAnnotationText(annG, ann.text, clampedX, clampedY - 4, {
      textColor: ann.textColor,
      maxWidth: resolveMaxWidth(ann.maxWidth, ctx.width) ?? ctx.width * DEFAULT_MAX_WIDTH_RATIO,
      textAnchor,
      backgroundColor: ctx.backgroundColor,
      textOutline: ann.textOutline,
    })
  }

  const isLegacy = legacyAnn.dx != null || legacyAnn.dy != null
  // An arrowhead needs a connector to orient it, so showArrow implies showLine
  // for modern annotations (legacy dx/dy already defaults showLine on).
  const showLine = isLegacy
    ? (lineConfig.showLine !== false)
    : (lineConfig.showLine === true || lineConfig.showArrow === true)
  if (showLine) {
    let lineStart = { x: clampedX, y: clampedY }
    let departVertical = false
    const textNode = annG.select('.bc-annotation-text').node() as SVGTextElement | null
    if (textNode) {
      try {
        const tBBox = textNode.getBBox()
        if (tBBox.width > 0 && tBBox.height > 0) {
          lineStart = bboxEdgeToward(tBBox, anchor.x, anchor.y)
          const bboxCx = tBBox.x + tBBox.width / 2
          departVertical = Math.abs(lineStart.x - bboxCx) < 1
        }
      }
      catch { /* getBBox can throw if not in DOM */ }
    }

    const ltd = lineConfig.showCircle
      ? resolveCircleRadius(lineConfig.circleSize) + (lineConfig.lineTargetDistance ?? 5)
      : (lineConfig.lineTargetDistance ?? 0)
    let toX = anchor.x
    let toY = anchor.y
    if (ltd > 0) {
      const dx = anchor.x - lineStart.x
      const dy = anchor.y - lineStart.y
      const len = Math.sqrt(dx * dx + dy * dy)
      if (len > 0) {
        const rawToX = anchor.x - (dx / len) * ltd
        const rawToY = anchor.y - (dy / len) * ltd
        const v = DIRECTION_VECTORS[anchorDir] ?? DIRECTION_VECTORS.N
        toX = Math.abs(v.dx) > 0.01 ? rawToX : anchor.x
        toY = Math.abs(v.dy) > 0.01 ? rawToY : anchor.y
      }
    }

    renderConnectingLine(annG, lineStart, { x: toX, y: toY }, lineConfig.lineStyle ?? AnnotationLineStyle.Direct, {
      showArrow: lineConfig.showArrow,
      lineWeight: lineConfig.lineWeight,
      color: lineColor,
      departVertical,
    })
  }
}
