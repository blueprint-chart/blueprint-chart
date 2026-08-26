import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderBpc } from './render-bpc'

// #67: below ~430px the horizontal bar family collapsed its left gutter to 2px
// (labelPositionMargins resolves `auto` to `inside`) while the axis kept
// drawing the category labels outside at x=-9, so every label ended up left of
// the SVG. bar-horizontal already moves them above their bars instead.
const HORIZONTAL_BAR_TYPES = ['bar-horizontal', 'bar-stacked', 'bar-grouped', 'bar-split']

const PHONE_WIDTH = 390
// Same generous per-glyph advance the value-label clip test uses, so a label
// that measures wider in the real font still satisfies these bounds.
const GENEROUS_GLYPH_PX = 7

function bpc(type: string): string {
  return `chart ${type} {
  data {
    "Alphabetical" = 10
    "Beta" = 20
  }
}`
}

function translateX(el: Element | null): number {
  const transform = el?.getAttribute('transform') ?? ''
  const match = /translate\(([-\d.]+)/.exec(transform)
  return match ? Number(match[1]) : 0
}

/** Left edge of every category label, in SVG coordinates. */
function categoryLabelLeftEdges(container: HTMLElement): { text: string, left: number }[] {
  const plot = container.querySelector('svg > g')
  const axis = container.querySelector('.bc-axis-vertical')
  const axisAnchor = axis?.getAttribute('text-anchor')
  const labels = [
    ...[...container.querySelectorAll('.bc-axis-vertical .tick text')].map(t => ({ el: t, offset: translateX(axis) })),
    ...[...container.querySelectorAll('.bc-category-label')].map(t => ({ el: t, offset: 0 })),
  ]
  return labels.map(({ el, offset }) => {
    const text = el.textContent ?? ''
    const width = text.length * GENEROUS_GLYPH_PX
    const x = translateX(plot) + offset + Number(el.getAttribute('x') ?? 0)
    const anchor = el.getAttribute('text-anchor') ?? axisAnchor
    return { text, left: anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x }
  })
}

describe('a horizontal bar chart keeps its category labels on a phone', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 0, width: PHONE_WIDTH, height: 400, top: 0, left: 0, right: PHONE_WIDTH, bottom: 400, toJSON: () => ({}),
    } as DOMRect)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  for (const type of HORIZONTAL_BAR_TYPES) {
    it(`${type}: every category label starts inside the SVG at ${PHONE_WIDTH}px`, () => {
      renderBpc(container, bpc(type))
      const edges = categoryLabelLeftEdges(container)
      expect(edges.map(e => e.text).filter(Boolean)).toEqual(['Alphabetical', 'Beta'])
      for (const { text, left } of edges) {
        expect(left, `left edge of "${text}"`).toBeGreaterThanOrEqual(0)
      }
    })
  }
})
