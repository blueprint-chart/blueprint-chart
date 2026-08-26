import * as d3 from 'd3'
import { describe, it, expect, afterEach } from 'vitest'
import { renderRangeAnnotation } from './range-renderer'
import { AnnotationKind, Orientation } from '../../../enums'
import type { AnnotationContext } from './context'

const WIDTH = 400
const HEIGHT = 300

function setup(orientation?: AnnotationContext['orientation']): { g: d3.Selection<SVGGElement, unknown, null, undefined>, ctx: AnnotationContext } {
  const svg = d3.select(document.body).append('svg').attr('width', WIDTH).attr('height', HEIGHT)
  const g = svg.append('g')
  const scaleX = d3.scaleBand<string>().domain(['Alpha', 'Bravo', 'Charlie']).range([0, WIDTH])
  const scaleY = d3.scaleLinear().domain([0, 30]).range([HEIGHT, 0])
  const ctx: AnnotationContext = {
    scaleX,
    scaleY,
    data: [{ label: 'Alpha', value: 30 }, { label: 'Bravo', value: 20 }, { label: 'Charlie', value: 25 }],
    width: WIDTH,
    height: HEIGHT,
    orientation,
  }
  return { g, ctx }
}

type Ann = Parameters<typeof renderRangeAnnotation>[1]

function range(props: Record<string, unknown>): Ann {
  return { kind: AnnotationKind.Range, ...props } as Ann
}

afterEach(() => {
  document.body.replaceChildren()
})

describe('renderRangeAnnotation', () => {
  // #48: an endpoint naming a category outside the data anchored at x=0 and
  // highlighted a category the author never named.
  it('skips the band when one endpoint names a nonexistent category', () => {
    const { g, ctx } = setup()
    renderRangeAnnotation(g, range({ start: 'Bravo', end: 'Zulu', text: 'window' }), ctx, 0)
    expect(document.querySelector('.bc-annotation-range')).toBeNull()
    expect(document.querySelector('.bc-annotation-text')).toBeNull()
  })

  it('skips the band when both endpoints name nonexistent categories', () => {
    const { g, ctx } = setup()
    renderRangeAnnotation(g, range({ start: 'Zulu', end: 'Yankee', text: 'window' }), ctx, 0)
    expect(document.querySelector('.bc-annotation-range')).toBeNull()
  })

  it('still draws a band whose endpoints both resolve', () => {
    const { g, ctx } = setup()
    renderRangeAnnotation(g, range({ start: 'Alpha', end: 'Bravo' }), ctx, 0)
    const rect = document.querySelector('.bc-annotation-range')
    expect(rect).not.toBeNull()
    expect(Number(rect!.getAttribute('width'))).toBeGreaterThan(0)
  })

  // #109: an orientation pointing at the value axis while the endpoints name
  // categories emitted y="NaN" height="NaN" and four Chromium console errors.
  it('skips the band when the endpoints do not resolve on the value axis', () => {
    const { g, ctx } = setup()
    renderRangeAnnotation(g, range({ orientation: Orientation.Horizontal, start: 'Alpha', end: 'Bravo' }), ctx, 0)
    expect(document.querySelector('.bc-annotation-range')).toBeNull()
  })

  it('skips the band on a horizontal chart when the endpoints miss the category scale', () => {
    const { g, ctx } = setup(Orientation.Horizontal)
    renderRangeAnnotation(g, range({ orientation: Orientation.Vertical, start: '10', end: '20' }), ctx, 0)
    // A band scale keyed by category name cannot resolve "10"/"20".
    expect(document.querySelector('.bc-annotation-range')).toBeNull()
  })

  // #47: out-of-domain numeric endpoints placed the band ~2000px off the plot.
  it('clamps out-of-domain numeric endpoints to the value scale', () => {
    const { g, ctx } = setup()
    renderRangeAnnotation(g, range({ orientation: Orientation.Horizontal, start: 100, end: 200 }), ctx, 0)
    const rect = document.querySelector('.bc-annotation-range')
    expect(rect).not.toBeNull()
    const y = Number(rect!.getAttribute('y'))
    const height = Number(rect!.getAttribute('height'))
    expect(y).toBeGreaterThanOrEqual(0)
    expect(y + height).toBeLessThanOrEqual(HEIGHT)
  })

  it('clamps only the out-of-domain end of a partially valid band', () => {
    const { g, ctx } = setup()
    renderRangeAnnotation(g, range({ orientation: Orientation.Horizontal, start: 20, end: 200 }), ctx, 0)
    const rect = document.querySelector('.bc-annotation-range')
    expect(rect).not.toBeNull()
    const y = Number(rect!.getAttribute('y'))
    const height = Number(rect!.getAttribute('height'))
    expect(y).toBe(0)
    expect(y + height).toBeCloseTo(ctx.scaleY(20) as number, 5)
  })
})
