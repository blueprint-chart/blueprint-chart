import * as d3 from 'd3'
import type { AnnotationConfig } from '../../types'
import { resolvePosition, resolveMaxWidth } from './position-helpers'
import type { AnnotationContext } from './context'
import { renderAnnotationText } from './shared'

// ---------------------------------------------------------------------------
// Free annotation renderer
// ---------------------------------------------------------------------------

export function renderFreeAnnotation(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  ann: AnnotationConfig,
  ctx: AnnotationContext,
  index: number,
): void {
  if (ann.kind !== 'free') {
    return
  }

  const annG = g.append('g').attr('data-annotation-index', String(index))
  const annotationKey = ann.key
  if (annotationKey) {
    annG.attr('data-annotation-id', annotationKey)
  }

  const px = resolvePosition(ann.x, ctx.width)
  const py = resolvePosition(ann.y, ctx.height)

  if (ann.text) {
    renderAnnotationText(annG, ann.text, px, py, {
      textColor: ann.textColor,
      maxWidth: resolveMaxWidth(ann.maxWidth, ctx.width),
      textAnchor: 'middle',
      backgroundColor: ctx.backgroundColor,
      textOutline: ann.textOutline,
    })

    const textEl = annG.select('.bc-annotation-text').node() as SVGTextElement | null
    if (textEl) {
      try {
        const bbox = textEl.getBBox()
        const dy = py - (bbox.y + bbox.height / 2)
        if (Math.abs(dy) > 0.5) {
          textEl.setAttribute('transform', `translate(0, ${dy})`)
        }
      }
      catch { /* getBBox can throw if not in DOM */ }
    }
  }
}
