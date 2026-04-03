import { watch, onScopeDispose } from 'vue'
import type { Ref } from 'vue'
import type { AnnotationConfig } from '@blueprint-chart/lib'
import { computeElbowPath, buildPathD, shortenToward, bboxEdgeToward } from '@/utils/geometry'

export { computeElbowPath, buildPathD, shortenToward, bboxEdgeToward } from '@/utils/geometry'

export function useAnnotationDrag(
  containerRef: Ref<HTMLElement | null>,
  annotations: Ref<AnnotationConfig[]>,
  selectedIndex: Ref<number | null>,
  onUpdate: (index: number, ann: AnnotationConfig) => void,
) {
  let overlay: SVGRectElement | null = null
  let cleanup: (() => void) | null = null

  function removeOverlay() {
    if (overlay?.parentNode) {
      overlay.parentNode.removeChild(overlay)
    }
    overlay = null
    if (cleanup) {
      cleanup()
      cleanup = null
    }
  }

  function setupOverlay() {
    removeOverlay()

    const container = containerRef.value
    const index = selectedIndex.value
    if (!container || index === null) {
      return
    }

    // Only point and free annotations support drag — skip range
    const ann = annotations.value[index]
    if (!ann || ann.kind === 'range') {
      return
    }

    const svg = container.querySelector('svg')
    if (!svg) {
      return
    }

    // Prefer lookup by annotation id (stable across hidden-annotation filtering)
    // and fall back to index only when the annotation has no id.
    const annId = ann.id
    const annG = (annId
      ? svg.querySelector(`g[data-annotation-id="${annId}"]`)
      : svg.querySelector(`g[data-annotation-index="${index}"]`)) as SVGGElement | null
    if (!annG) {
      return
    }

    const textEl = annG.querySelector('.bc-annotation-text') as SVGTextElement | null
    if (!textEl) {
      return
    }

    // Find the anchor point — circle center or line endpoint
    const circleEl = annG.querySelector('.bc-annotation-circle') as SVGCircleElement | null
    const lineEl = annG.querySelector('.bc-annotation-line') as SVGPathElement | null

    let anchorX: number | null = null
    let anchorY: number | null = null

    // Circle radius for shortening the line endpoint
    let circleRadius = 0
    if (circleEl) {
      anchorX = parseFloat(circleEl.getAttribute('cx') || '0')
      anchorY = parseFloat(circleEl.getAttribute('cy') || '0')
      circleRadius = parseFloat(circleEl.getAttribute('r') || '0')
    }

    if (anchorX === null && lineEl) {
      // Line goes from text to anchor — last point in the path is the anchor
      const d = lineEl.getAttribute('d') || ''
      const parts = d.split(/[MLA]\s*/).filter(Boolean)
      if (parts.length >= 2) {
        const last = parts[parts.length - 1].trim().split(/[\s,]+/)
        if (last.length >= 2) {
          anchorX = parseFloat(last[last.length - 2])
          anchorY = parseFloat(last[last.length - 1])
        }
      }
    }

    const hasAnchor = anchorX !== null && anchorY !== null

    // Read the line style from the annotation config
    const lineStyle: string = (ann && 'lineStyle' in ann ? (ann as Record<string, unknown>).lineStyle : 'direct') as string || 'direct'
    // Line target distance: when circle is present, shorten by circle radius + gap
    const lineTargetDist = circleRadius > 0
      ? circleRadius + ((ann && 'lineTargetDistance' in ann ? (ann as Record<string, unknown>).lineTargetDistance : 5) as number || 5)
      : 0

    // Record original text position
    const origTextX = parseFloat(textEl.getAttribute('x') || '0')
    const origTextY = parseFloat(textEl.getAttribute('y') || '0')

    const rawBbox = textEl.getBBox()
    // Account for transform translate on the text element (used by free annotation vertical centering)
    const transformAttr = textEl.getAttribute('transform') || ''
    const translateMatch = transformAttr.match(/translate\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)/)
    const transformDx = translateMatch ? parseFloat(translateMatch[1]) : 0
    const transformDy = translateMatch ? parseFloat(translateMatch[2]) : 0
    const bbox = { x: rawBbox.x + transformDx, y: rawBbox.y + transformDy, width: rawBbox.width, height: rawBbox.height }
    const pad = 4

    // Resolve maxWidth to pixels for the overlay width
    const rawMaxWidth = ann ? (ann as Record<string, unknown>).maxWidth as number | string | undefined : undefined
    let overlayWidth = bbox.width
    if (rawMaxWidth != null) {
      const chartWidth = parseFloat(svg.getAttribute('width') || '0')
      if (typeof rawMaxWidth === 'number' && rawMaxWidth > 0) {
        overlayWidth = rawMaxWidth
      }
      else if (typeof rawMaxWidth === 'string') {
        if (rawMaxWidth.endsWith('%') && chartWidth > 0) {
          overlayWidth = (parseFloat(rawMaxWidth) / 100) * chartWidth
        }
        else {
          const parsed = parseFloat(rawMaxWidth)
          if (parsed > 0) {
            overlayWidth = parsed
          }
        }
      }
    }

    // Anchor the overlay around the text anchor point (x attr), not the bbox left edge
    const textAnchor = textEl.getAttribute('text-anchor') || 'middle'
    let overlayX: number
    if (textAnchor === 'middle') {
      overlayX = origTextX - overlayWidth / 2
    }
    else if (textAnchor === 'end') {
      overlayX = origTextX - overlayWidth
    }
    else {
      overlayX = origTextX
    }

    // Create overlay rect on the text
    overlay = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    overlay.setAttribute('x', String(overlayX - pad))
    overlay.setAttribute('y', String(bbox.y - pad))
    overlay.setAttribute('width', String(overlayWidth + pad * 2))
    overlay.setAttribute('height', String(bbox.height + pad * 2))
    overlay.setAttribute('fill', 'rgba(255,245,157,0.4)')
    overlay.setAttribute('rx', '3')
    overlay.style.cursor = 'grab'
    overlay.style.pointerEvents = 'all'
    annG.appendChild(overlay)

    let dragging = false
    let startX = 0
    let startY = 0
    let rafId = 0
    let lastClientX = 0
    let lastClientY = 0

    function getScreenCTM() {
      return svg!.getScreenCTM()
    }

    function updateDragVisuals() {
      const ctm = getScreenCTM()
      if (!ctm) {
        return
      }

      const dx = (lastClientX - startX) / ctm.a
      const dy = (lastClientY - startY) / ctm.d

      // Move only the text and overlay — not the circle
      const newTextX = origTextX + dx
      const newTextY = origTextY + dy

      textEl!.setAttribute('x', String(newTextX))
      textEl!.setAttribute('y', String(newTextY))
      const tspans = textEl!.querySelectorAll('tspan')
      for (const ts of tspans) {
        ts.setAttribute('x', String(newTextX))
      }

      // Update overlay position — keep maxWidth-based width, recompute x from text anchor
      const newRawBbox = textEl!.getBBox()
      const newBbox = { x: newRawBbox.x + transformDx, y: newRawBbox.y + transformDy, width: newRawBbox.width, height: newRawBbox.height }
      let newOverlayX: number
      const anchor = textEl!.getAttribute('text-anchor') || 'middle'
      if (anchor === 'middle') {
        newOverlayX = newTextX - overlayWidth / 2
      }
      else if (anchor === 'end') {
        newOverlayX = newTextX - overlayWidth
      }
      else {
        newOverlayX = newTextX
      }
      overlay!.setAttribute('x', String(newOverlayX - pad))
      overlay!.setAttribute('y', String(newBbox.y - pad))
      overlay!.setAttribute('width', String(overlayWidth + pad * 2))
      overlay!.setAttribute('height', String(newBbox.height + pad * 2))

      // Update the actual connecting line in realtime — from text bbox edge to anchor
      if (lineEl && hasAnchor) {
        const edge = bboxEdgeToward(newBbox, anchorX!, anchorY!)
        const lineEnd = lineTargetDist > 0
          ? shortenToward({ x: anchorX!, y: anchorY! }, edge, lineTargetDist)
          : { x: anchorX!, y: anchorY! }
        // N/S exit → vertical departure for elbow
        const bboxCx = newBbox.x + newBbox.width / 2
        const departVertical = Math.abs(edge.x - bboxCx) < 1
        lineEl.setAttribute('d', buildPathD(edge, lineEnd, lineStyle, departVertical))
      }

      rafId = 0
    }

    function onPointerDown(e: PointerEvent) {
      e.preventDefault()
      e.stopPropagation()
      dragging = true
      startX = e.clientX
      startY = e.clientY
      lastClientX = e.clientX
      lastClientY = e.clientY
      overlay!.style.cursor = 'grabbing'
      overlay!.setPointerCapture(e.pointerId)
    }

    function onPointerMove(e: PointerEvent) {
      if (!dragging) {
        return
      }
      e.preventDefault()

      lastClientX = e.clientX
      lastClientY = e.clientY

      if (!rafId) {
        rafId = requestAnimationFrame(updateDragVisuals)
      }
    }

    function onPointerUp(e: PointerEvent) {
      if (!dragging) {
        return
      }
      dragging = false
      overlay!.style.cursor = 'grab'

      if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = 0
      }

      const ctm = getScreenCTM()
      if (!ctm) {
        return
      }

      const dx = (e.clientX - startX) / ctm.a
      const dy = (e.clientY - startY) / ctm.d

      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
        // Restore positions — no meaningful drag
        textEl!.setAttribute('x', String(origTextX))
        textEl!.setAttribute('y', String(origTextY))
        const tspans = textEl!.querySelectorAll('tspan')
        for (const ts of tspans) {
          ts.setAttribute('x', String(origTextX))
        }
        return
      }

      const ann = annotations.value[index!]
      if (!ann) {
        return
      }

      const updated = { ...ann } as Record<string, unknown>

      if (ann.kind === 'free') {
        // Use plot area dimensions (from annotation context) not SVG dimensions
        const annGroup = annG!.closest('.bc-annotations') as SVGGElement | null
        const ctxW = parseFloat(annGroup?.getAttribute('data-ctx-width') || '') || parseFloat(svg!.getAttribute('width') || '600')
        const ctxH = parseFloat(annGroup?.getAttribute('data-ctx-height') || '') || parseFloat(svg!.getAttribute('height') || '400')
        const prevX = ann.x
        const prevY = ann.y
        if (typeof prevX === 'number') {
          updated.x = +(prevX + (dx / ctxW) * 100).toFixed(1)
        }
        else {
          const str = String(prevX)
          if (str.endsWith('px')) {
            updated.x = `${Math.round(parseFloat(str) + dx)}px`
          }
          else {
            updated.x = +((parseFloat(str) || 0) + (dx / ctxW) * 100).toFixed(1)
          }
        }
        if (typeof prevY === 'number') {
          updated.y = +(prevY + (dy / ctxH) * 100).toFixed(1)
        }
        else {
          const str = String(prevY)
          if (str.endsWith('px')) {
            updated.y = `${Math.round(parseFloat(str) + dy)}px`
          }
          else {
            updated.y = +((parseFloat(str) || 0) + (dy / ctxH) * 100).toFixed(1)
          }
        }
      }
      else if (ann.kind === 'point') {
        const prevOffsetX = (updated.textOffsetX as number | undefined) ?? -42
        const prevOffsetY = (updated.textOffsetY as number | undefined) ?? -42
        updated.textOffsetX = Math.round(prevOffsetX + dx)
        updated.textOffsetY = Math.round(prevOffsetY + dy)
      }

      // Config update triggers full re-render — no need to restore DOM manually
      onUpdate(index!, updated as AnnotationConfig)
    }

    overlay.addEventListener('pointerdown', onPointerDown)
    overlay.addEventListener('pointermove', onPointerMove)
    overlay.addEventListener('pointerup', onPointerUp)

    cleanup = () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
      overlay?.removeEventListener('pointerdown', onPointerDown)
      overlay?.removeEventListener('pointermove', onPointerMove)
      overlay?.removeEventListener('pointerup', onPointerUp)
    }
  }

  watch(selectedIndex, () => {
    requestAnimationFrame(setupOverlay)
  })

  watch(annotations, () => {
    if (selectedIndex.value !== null) {
      requestAnimationFrame(setupOverlay)
    }
  }, { deep: true })

  onScopeDispose(removeOverlay)
}
