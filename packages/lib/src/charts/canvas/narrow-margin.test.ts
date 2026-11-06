import { describe, it, expect, afterEach } from 'vitest'
import { parse } from '../../dsl/parser'
import { astToDefinition } from '../../render/ast-to-definition'
import { renderChart } from '../../render/render-chart'

const realGetBoundingClientRect = Element.prototype.getBoundingClientRect

afterEach(() => {
  Element.prototype.getBoundingClientRect = realGetBoundingClientRect
  document.body.innerHTML = ''
})

function withViewport(width: number, height: number): void {
  Element.prototype.getBoundingClientRect = function () {
    return { x: 0, y: 0, top: 0, left: 0, right: width, bottom: height, width, height, toJSON: () => ({}) } as DOMRect
  }
}

function draw(source: string): HTMLElement {
  const host = document.createElement('div')
  document.body.appendChild(host)
  renderChart(host, astToDefinition(parse(source)))
  return host
}

const SOURCE = `chart line {
  data {
    "1980" = 100000
    "2000" = 120000
    "2017" = 140000
  }
}`

describe('narrow widths keep axis labels readable (#68)', () => {
  it('anchors the first horizontal tick label inward so it is not chopped', () => {
    withViewport(360, 640)
    const host = draw(SOURCE)
    const first = host.querySelector('.bc-axis-horizontal .tick text')
    expect(first?.getAttribute('text-anchor')).toBe('start')
  })

  it('anchors the last horizontal tick label inward too', () => {
    withViewport(360, 640)
    const host = draw(SOURCE)
    const ticks = [...host.querySelectorAll('.bc-axis-horizontal .tick text')]
    expect(ticks.at(-1)?.getAttribute('text-anchor')).toBe('end')
  })

  it('gives a vertical label moved inside the plot a halo to read against', () => {
    withViewport(360, 640)
    const host = draw(SOURCE)
    const inside = [...host.querySelectorAll('.bc-axis-vertical .tick text')]
    expect(inside.length).toBeGreaterThan(0)
    expect(inside.every(t => t.classList.contains('bc-axis-label-inside'))).toBe(true)
  })

  it('leaves a wide chart\u2019s labels outside, with no halo', () => {
    withViewport(1280, 720)
    const host = draw(SOURCE)
    const outside = [...host.querySelectorAll('.bc-axis-vertical .tick text')]
    expect(outside.some(t => t.classList.contains('bc-axis-label-inside'))).toBe(false)
  })
})
