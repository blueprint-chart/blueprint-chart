import * as d3 from 'd3'
import { describe, it, expect, afterEach } from 'vitest'
import { renderFreeAnnotation } from './free-renderer'
import { AnnotationKind } from '../../../enums'
import type { AnnotationContext } from './context'

const WIDTH = 628
const HEIGHT = 400

function setup(): { g: d3.Selection<SVGGElement, unknown, null, undefined>, ctx: AnnotationContext } {
  const svg = d3.select(document.body).append('svg').attr('width', WIDTH).attr('height', HEIGHT)
  const g = svg.append('g')
  const ctx: AnnotationContext = {
    scaleX: d3.scaleBand<string>().domain(['Alpha', 'Beta']).range([0, WIDTH]),
    scaleY: d3.scaleLinear().domain([0, 30]).range([HEIGHT, 0]),
    data: [{ label: 'Alpha', value: 30 }, { label: 'Beta', value: 20 }],
    width: WIDTH,
    height: HEIGHT,
  }
  return { g, ctx }
}

type Ann = Parameters<typeof renderFreeAnnotation>[1]

afterEach(() => {
  document.body.replaceChildren()
})

describe('renderFreeAnnotation', () => {
  // #45: percentages were centre-relative, so the documented 10%/90% note was
  // painted below the plot and dragged the whole chart down with it.
  it('places the documented 10%/90% note inside the plot box', () => {
    const { g, ctx } = setup()
    renderFreeAnnotation(g, { kind: AnnotationKind.Free, text: 'A short note', x: '10%', y: '90%' } as Ann, ctx, 0)
    const text = document.querySelector('.bc-annotation-text')!
    expect(Number(text.getAttribute('x'))).toBeCloseTo(62.8, 5)
    expect(Number(text.getAttribute('y'))).toBeCloseTo(360, 5)
  })

  it('places 0%/0% at the top left of the plot box', () => {
    const { g, ctx } = setup()
    renderFreeAnnotation(g, { kind: AnnotationKind.Free, text: 'corner', x: 0, y: 0 } as Ann, ctx, 0)
    const text = document.querySelector('.bc-annotation-text')!
    expect(Number(text.getAttribute('x'))).toBe(0)
    expect(Number(text.getAttribute('y'))).toBe(0)
  })
})
