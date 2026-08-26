import * as d3 from 'd3'
import { describe, it, expect, afterEach } from 'vitest'
import { renderPointAnnotation } from './point-renderer'
import { AnnotationKind } from '../../../enums'
import { measureTextWidth } from '../../text-measure'
import type { AnnotationContext } from './context'

const WIDTH = 400
const HEIGHT = 300

function setup(): { g: d3.Selection<SVGGElement, unknown, null, undefined>, ctx: AnnotationContext } {
  const svg = d3.select(document.body).append('svg').attr('width', WIDTH).attr('height', HEIGHT)
  const g = svg.append('g')
  const scaleX = d3.scaleBand<string>().domain(['A', 'B', 'C']).range([0, WIDTH])
  const scaleY = d3.scaleLinear().domain([0, 30]).range([HEIGHT, 0])
  const ctx: AnnotationContext = {
    scaleX,
    scaleY,
    data: [{ label: 'A', value: 10 }, { label: 'B', value: 30 }, { label: 'C', value: 20 }],
    width: WIDTH,
    height: HEIGHT,
  }
  return { g, ctx }
}

type Ann = Parameters<typeof renderPointAnnotation>[1]

afterEach(() => {
  document.body.replaceChildren()
})

describe('renderPointAnnotation', () => {
  it('renders a connecting line with an arrow marker when showArrow is set without showLine', () => {
    const { g, ctx } = setup()
    renderPointAnnotation(g, { target: 'B', text: 'peak', showArrow: true } as Ann, ctx, 0)
    const line = document.querySelector('.bc-annotation-line')
    expect(line).not.toBeNull()
    expect(line!.getAttribute('marker-end')).toBeTruthy()
  })

  it('renders no connecting line when neither showLine nor showArrow is set', () => {
    const { g, ctx } = setup()
    renderPointAnnotation(g, { target: 'B', text: 'peak' } as Ann, ctx, 0)
    expect(document.querySelector('.bc-annotation-line')).toBeNull()
  })

  it('clamps annotation text and connector start to the canvas height', () => {
    const { g, ctx } = setup()
    renderPointAnnotation(g, { target: 'B', text: 'peak', showArrow: true, textOffsetY: -9999 } as Ann, ctx, 0)
    const text = document.querySelector('.bc-annotation-text')
    expect(text).not.toBeNull()
    const textY = Number(text!.getAttribute('y'))
    expect(textY).toBeGreaterThanOrEqual(0)
    expect(textY).toBeLessThanOrEqual(HEIGHT)
    const line = document.querySelector('.bc-annotation-line')
    expect(line).not.toBeNull()
    const fromY = Number(line!.getAttribute('data-line-from-y'))
    expect(fromY).toBeGreaterThanOrEqual(0)
    expect(fromY).toBeLessThanOrEqual(HEIGHT)
  })

  it('wraps long text onto several lines when no maxWidth is set', () => {
    const { g, ctx } = setup()
    const long = 'En juillet 2024, deux subventions ont ete attribuees au syndicat departemental de l energie de l Allier'
    renderPointAnnotation(g, { target: 'B', text: long } as Ann, ctx, 0)
    const tspans = [...document.querySelectorAll('.bc-annotation-text tspan')]
    expect(tspans.length).toBeGreaterThan(1)
    // Every line stays within the default wrap width (40% of the chart width).
    for (const tspan of tspans) {
      expect(measureTextWidth(tspan.textContent ?? '', 12)).toBeLessThanOrEqual(WIDTH * 0.4)
    }
    // Wrapping splits on spaces, so the lines rejoin into the original text.
    expect(tspans.map(t => t.textContent).join(' ')).toBe(long)
  })

  it('honours explicit newlines alongside an explicit maxWidth', () => {
    const { g, ctx } = setup()
    renderPointAnnotation(g, { target: 'B', text: 'Line one\nline two', maxWidth: 300 } as Ann, ctx, 0)
    const lines = [...document.querySelectorAll('.bc-annotation-text tspan')].map(t => t.textContent)
    expect(lines).toEqual(['Line one', 'line two'])
  })

  it('honours explicit newlines as hard line breaks', () => {
    const { g, ctx } = setup()
    renderPointAnnotation(g, { target: 'B', text: 'Line one\nline two' } as Ann, ctx, 0)
    const lines = [...document.querySelectorAll('.bc-annotation-text tspan')].map(t => t.textContent)
    expect(lines).toEqual(['Line one', 'line two'])
  })

  it('wraps within each explicit line when a line is too long', () => {
    const { g, ctx } = setup()
    // 160px budget at 7px/char ≈ 22 chars, so the first line breaks in two and
    // the newline still forces a break before "short".
    renderPointAnnotation(g, { target: 'B', text: 'aaa bbb ccc ddd eee fff ggg\nshort' } as Ann, ctx, 0)
    const lines = [...document.querySelectorAll('.bc-annotation-text tspan')].map(t => t.textContent)
    expect(lines.length).toBeGreaterThan(2)
    expect(lines.at(-1)).toBe('short')
  })

  it('leaves short text on a single line', () => {
    const { g, ctx } = setup()
    renderPointAnnotation(g, { target: 'B', text: 'peak' } as Ann, ctx, 0)
    expect(document.querySelectorAll('.bc-annotation-text tspan')).toHaveLength(1)
  })

  it('still renders a connecting line for a legacy dy annotation', () => {
    const { g, ctx } = setup()
    renderPointAnnotation(g, { target: 'B', text: 'peak', dy: -40 } as Ann, ctx, 0)
    expect(document.querySelector('.bc-annotation-line')).not.toBeNull()
  })

  it('uses the internal key for data-annotation-id', () => {
    const { g, ctx } = setup()
    const ann = { kind: AnnotationKind.Point, target: 'A', text: 'hi', key: 's0:0:point' } as Ann
    renderPointAnnotation(g, ann, ctx, 0)
    const annGEl = document.querySelector('[data-annotation-index="0"]')
    expect(annGEl).not.toBeNull()
    expect(annGEl!.getAttribute('data-annotation-id')).toBe('s0:0:point')
  })
})
