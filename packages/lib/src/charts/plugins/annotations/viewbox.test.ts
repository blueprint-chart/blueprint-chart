import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as d3 from 'd3'
import { createAnnotationPlugin } from '../annotations'
import { makeChartStub } from '../test-helpers'
import { AnnotationKind } from '../../../enums'

const SVG_W = 628
const SVG_H = 400

describe('viewBox expansion for annotations', () => {
  let svg: SVGSVGElement
  let g: SVGGElement

  function stubBBox(node: Element, box: { x: number, y: number, width: number, height: number }) {
    Object.defineProperty(node, 'getBBox', { value: () => box, configurable: true })
  }

  function plugin() {
    const x = d3.scaleBand<string>().domain(['A', 'B']).range([0, SVG_W]).padding(0.2)
    const y = d3.scaleLinear().domain([0, 100]).range([SVG_H, 0])
    return createAnnotationPlugin(
      [{ kind: AnnotationKind.Free, text: 'note', x: 10, y: 90 }],
      { scaleX: x, scaleY: y, data: [{ label: 'A', value: 50 }], width: SVG_W, height: SVG_H },
    )
  }

  beforeEach(() => {
    vi.useFakeTimers()
    ;(window.SVGElement.prototype as unknown as { getBBox: () => DOMRect }).getBBox
      = () => ({ x: 0, y: 0, width: 0, height: 0 }) as DOMRect
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', String(SVG_W))
    svg.setAttribute('height', String(SVG_H))
    g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    svg.appendChild(g)
    document.body.appendChild(svg)
  })

  afterEach(() => {
    vi.useRealTimers()
    svg.remove()
  })

  // #44: an off-canvas annotation must not scale the chart down without bound.
  it('caps the expansion so the chart keeps at least 80% of its scale', () => {
    // The measured worst case from #47: a range band ~2000px above the plot.
    stubBBox(svg, { x: 0, y: -2058.7, width: SVG_W, height: 2458.7 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin().postDraw!(makeChartStub(g) as any, undefined as any)

    const viewBox = svg.getAttribute('viewBox')
    expect(viewBox).not.toBeNull()
    const [, , vbW, vbH] = viewBox!.split(' ').map(Number)
    const scale = Math.min(SVG_W / vbW, SVG_H / vbH)
    expect(scale).toBeGreaterThanOrEqual(0.8)
  })

  // #81: the expansion must be cleared once the geometry no longer needs it.
  it('removes viewBox and preserveAspectRatio when nothing overflows any more', () => {
    stubBBox(svg, { x: -100, y: 0, width: SVG_W + 100, height: SVG_H })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin().postDraw!(makeChartStub(g) as any, undefined as any)
    expect(svg.getAttribute('viewBox')).not.toBeNull()

    stubBBox(svg, { x: 0, y: 0, width: SVG_W, height: SVG_H })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin().postDraw!(makeChartStub(g) as any, undefined as any)

    expect(svg.getAttribute('viewBox')).toBeNull()
    expect(svg.getAttribute('preserveAspectRatio')).toBeNull()
  })

  // #81: getBBox must not be read while a scene transition is still tweening.
  it('does not measure mid-transition: the expansion waits for the tween to settle', () => {
    stubBBox(svg, { x: 0, y: -2058.7, width: SVG_W, height: 2458.7 })

    const p = createAnnotationPlugin(
      [{ kind: AnnotationKind.Free, text: 'note', x: 10, y: 90 }],
      {
        scaleX: d3.scaleBand<string>().domain(['A']).range([0, SVG_W]),
        scaleY: d3.scaleLinear().domain([0, 100]).range([SVG_H, 0]),
        data: [{ label: 'A', value: 50 }],
        width: SVG_W,
        height: SVG_H,
        transition: true,
      },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    p.postDraw!(makeChartStub(g) as any, undefined as any)

    // Mid-tween geometry must not be committed to the viewBox.
    expect(svg.getAttribute('viewBox')).toBeNull()

    // Once the transition has settled the geometry fits again, so no expansion.
    stubBBox(svg, { x: 0, y: 0, width: SVG_W, height: SVG_H })
    vi.advanceTimersByTime(1000)
    expect(svg.getAttribute('viewBox')).toBeNull()
  })
})
