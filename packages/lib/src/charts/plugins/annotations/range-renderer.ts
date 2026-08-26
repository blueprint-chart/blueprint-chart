import * as d3 from 'd3'
import type { AnnotationConfig } from '../../types'
import { AnnotationKind, Orientation } from '../../../enums'
import { DIRECTION_VECTORS } from './direction-helpers'
import { resolveMaxWidth } from './position-helpers'
import type { AnnotationContext } from './context'
import { resolveXPosition, resolveYPosition, renderAnnotationText } from './shared'

// ---------------------------------------------------------------------------
// Range annotation renderer
// ---------------------------------------------------------------------------

export function renderRangeAnnotation(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  ann: AnnotationConfig,
  ctx: AnnotationContext,
  index: number,
  labelGroup?: d3.Selection<SVGGElement, unknown, null, undefined>,
): void {
  if (ann.kind !== AnnotationKind.Range) {
    return
  }

  const onCategoryAxis = (ann.orientation ?? Orientation.Vertical) === Orientation.Vertical

  const p1 = onCategoryAxis
    ? resolveXPosition(ann.start, ctx.scaleX, ann.startAnchor)
    : resolveYPosition(ann.start, ctx.scaleY)
  const p2 = onCategoryAxis
    ? resolveXPosition(ann.end, ctx.scaleX, ann.endAnchor)
    : resolveYPosition(ann.end, ctx.scaleY)

  // An endpoint that resolves to nothing (a category outside the data, or a
  // category name on the value axis) draws no band: inventing geometry from the
  // plot origin highlights a category the author never named.
  if (p1 === null || p2 === null) {
    return
  }

  const annG = g.append('g').attr('data-annotation-index', String(index))
  const annotationKey = ann.key
  if (annotationKey) {
    annG.attr('data-annotation-id', annotationKey)
  }

  // The category axis runs vertically on a horizontal chart and horizontally
  // otherwise, so the band's extent follows whichever axis its endpoints sit on.
  const extentIsVertical = (ctx.orientation === Orientation.Horizontal) === onCategoryAxis

  let x: number, y: number, w: number, h: number

  if (extentIsVertical) {
    y = Math.min(p1, p2)
    h = Math.abs(p2 - p1)
    x = 0
    w = ctx.width
  }
  else {
    x = Math.min(p1, p2)
    w = Math.abs(p2 - p1)
    y = 0
    h = ctx.height
  }

  annG.append('rect')
    .attr('class', 'bc-annotation-range')
    .attr('x', x)
    .attr('y', y)
    .attr('width', w)
    .attr('height', h)
    .attr('fill', ann.bgColor ?? '#ccc')
    .attr('opacity', (ann.bgOpacity ?? 20) / 100)

  if (ann.text) {
    const bandWidth = onCategoryAxis ? w : h
    const rangeMaxWidth = resolveMaxWidth(ann.maxWidth, ctx.width) ?? Math.max(bandWidth, 50)

    const dir = ann.direction ?? 'center'
    const pad = 4

    const v = DIRECTION_VECTORS[dir] ?? DIRECTION_VECTORS.center
    const nx = 0.5 + v.dx * 0.5
    const ny = 0.5 + v.dy * 0.5

    const textX = Math.max(pad, Math.min(x + w * nx, ctx.width - pad))

    let textAnchor = 'middle'
    if (nx < 0.25) {
      textAnchor = 'start'
    }
    else if (nx > 0.75) {
      textAnchor = 'end'
    }

    const fontSize = 12
    const textY = y + pad + fontSize

    const textTarget = labelGroup
      ? labelGroup.append('g').attr('data-annotation-index', String(index))
      : annG

    renderAnnotationText(textTarget, ann.text, textX, textY, {
      textColor: ann.textColor,
      maxWidth: rangeMaxWidth,
      textAnchor,
      backgroundColor: ctx.backgroundColor,
      textOutline: ann.textOutline,
    })

    if (ny > 0.25) {
      const textEl = textTarget.select('.bc-annotation-text').node() as SVGTextElement | null
      if (textEl) {
        try {
          const tBBox = textEl.getBBox()
          let dy = 0
          if (ny > 0.75) {
            dy = (y + h - pad) - (tBBox.y + tBBox.height)
          }
          else {
            dy = (y + h / 2) - (tBBox.y + tBBox.height / 2)
          }
          if (Math.abs(dy) > 0.5) {
            textEl.setAttribute('transform', `translate(0, ${dy})`)
          }
        }
        catch { /* getBBox can throw if not in DOM */ }
      }
    }
  }
}
