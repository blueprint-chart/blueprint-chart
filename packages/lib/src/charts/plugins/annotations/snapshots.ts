// ---------------------------------------------------------------------------
// Annotation snapshot types and helpers
// ---------------------------------------------------------------------------

export interface LineGeometry {
  style: string
  fromX: number
  fromY: number
  toX: number
  toY: number
  departVertical: boolean
}

export interface AnnotationSnapshot {
  id: string
  element: Element
  rect: { x: number, y: number, width: number, height: number }
  line?: LineGeometry
}

export function readLineGeometry(el: Element): LineGeometry | undefined {
  const lineEl = el.querySelector('.bc-annotation-line')
  if (!lineEl || !lineEl.hasAttribute('data-line-style')) {
    return undefined
  }
  return {
    style: lineEl.getAttribute('data-line-style')!,
    fromX: parseFloat(lineEl.getAttribute('data-line-from-x') || '0'),
    fromY: parseFloat(lineEl.getAttribute('data-line-from-y') || '0'),
    toX: parseFloat(lineEl.getAttribute('data-line-to-x') || '0'),
    toY: parseFloat(lineEl.getAttribute('data-line-to-y') || '0'),
    departVertical: lineEl.getAttribute('data-line-depart-vertical') === 'true',
  }
}

export function snapshotAnnotations(container: Element): Map<string, AnnotationSnapshot> {
  const map = new Map<string, AnnotationSnapshot>()
  const groups = container.querySelectorAll('g[data-annotation-id]')
  for (const el of groups) {
    const id = el.getAttribute('data-annotation-id')!
    const line = readLineGeometry(el)
    try {
      const rect = (el as SVGGraphicsElement).getBBox()
      map.set(id, { id, element: el, rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }, line })
    }
    catch {
      map.set(id, { id, element: el, rect: { x: 0, y: 0, width: 0, height: 0 }, line })
    }
  }
  return map
}
