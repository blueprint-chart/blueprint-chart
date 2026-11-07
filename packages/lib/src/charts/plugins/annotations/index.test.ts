import * as d3 from 'd3'
import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { renderAnnotations } from './index'
import { AnnotationKind, Orientation } from '../../../enums'
import type { AnnotationConfig } from '../../types'
import type { AnnotationContext } from './context'

const point: AnnotationConfig = { kind: AnnotationKind.Point, key: 'p', target: 'B', text: 'peak', showArrow: true }
const range: AnnotationConfig = { kind: AnnotationKind.Range, key: 'r', orientation: Orientation.Horizontal, start: 20, end: 40 }

function ctx(max: number, transition: boolean): AnnotationContext {
  return {
    scaleX: d3.scaleBand<string>().domain(['A', 'B']).range([0, 400]),
    scaleY: d3.scaleLinear().domain([0, max]).range([300, 0]),
    data: [{ label: 'A', value: 10 }, { label: 'B', value: 30 }],
    width: 400,
    height: 300,
    transition,
  }
}

describe('renderAnnotations scene transitions', () => {
  let g: SVGGElement

  beforeAll(() => {
    ;(window.SVGElement.prototype as unknown as { getBBox: () => DOMRect }).getBBox = () => ({ x: 0, y: 0, width: 0, height: 0 }) as DOMRect
  })

  afterEach(() => {
    document.body.replaceChildren()
  })

  function renderTwice(annotations: AnnotationConfig[]) {
    g = d3.select(document.body).append('svg').attr('width', 400).attr('height', 300).append('g').node()!
    renderAnnotations(g, annotations, ctx(30, false))
    const before = g.cloneNode(true) as SVGGElement
    renderAnnotations(g, annotations, ctx(60, true))
    return before
  }

  it('starts a moved point label from its previous position', () => {
    const before = renderTwice([point])
    const oldY = Number(before.querySelector('.bc-annotation-text')!.getAttribute('y'))
    const text = g.querySelector('.bc-annotation-text')!
    const newY = Number(text.getAttribute('y'))
    expect(text.getAttribute('transform')).toBe(`translate(0, ${oldY - newY})`)
  })

  it('starts a moved range band from its previous geometry', () => {
    const before = renderTwice([range])
    const rect = g.querySelector('.bc-annotation-range')!
    expect(rect.getAttribute('y')).toBe(before.querySelector('.bc-annotation-range')!.getAttribute('y'))
    expect(rect.getAttribute('height')).toBe(before.querySelector('.bc-annotation-range')!.getAttribute('height'))
  })
})
