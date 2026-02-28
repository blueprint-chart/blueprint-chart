import { describe, it, expect, beforeEach } from 'vitest'
import * as d3 from 'd3'
import { createAnnotationPlugin } from './annotations'

function makeChartStub(g: SVGGElement) {
  return { base: d3.select(g) } as unknown
}

function createSvgSetup(): { svg: SVGSVGElement, g: SVGGElement } {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild)
  }
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  svg.appendChild(g)
  document.body.appendChild(svg)
  return { svg, g }
}

describe('createAnnotationPlugin: text and arrow', () => {
  let g: SVGGElement
  beforeEach(() => {
    g = createSvgSetup().g
  })

  it('renders annotation text and arrow', () => {
    const x = d3.scaleBand<string>().domain(['A', 'B']).range([0, 200]).padding(0.2)
    const y = d3.scaleLinear().domain([0, 100]).range([200, 0])
    const data = [{ label: 'A', value: 50 }, { label: 'B', value: 80 }]

    const plugin = createAnnotationPlugin(
      [{ target: 'A', text: 'Note here', dx: 30, dy: -30 }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const texts = g.querySelectorAll('.bc-annotation-text')
    expect(texts).toHaveLength(1)
    expect(texts[0].textContent).toBe('Note here')

    const lines = g.querySelectorAll('.bc-annotation-line')
    expect(lines).toHaveLength(1)
  })
})

describe('createAnnotationPlugin: unknown target', () => {
  let g: SVGGElement
  beforeEach(() => {
    g = createSvgSetup().g
  })

  it('skips annotation for unknown target', () => {
    const x = d3.scaleBand<string>().domain(['A']).range([0, 100])
    const y = d3.scaleLinear().domain([0, 100]).range([100, 0])

    const plugin = createAnnotationPlugin(
      [{ target: 'Z', text: 'Missing' }],
      { scaleX: x, scaleY: y, data: [{ label: 'A', value: 50 }], width: 100, height: 100 },
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    expect(g.querySelectorAll('.bc-annotation-text')).toHaveLength(0)
  })
})

describe('createAnnotationPlugin: showArrow option', () => {
  let g: SVGGElement
  beforeEach(() => {
    g = createSvgSetup().g
  })

  it('hides arrow when showArrow is false', () => {
    const x = d3.scaleBand<string>().domain(['A']).range([0, 100]).padding(0.2)
    const y = d3.scaleLinear().domain([0, 100]).range([100, 0])

    const plugin = createAnnotationPlugin(
      [{ target: 'A', text: 'No arrow', showArrow: false }],
      { scaleX: x, scaleY: y, data: [{ label: 'A', value: 50 }], width: 100, height: 100 },
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    expect(g.querySelectorAll('.bc-annotation-text')).toHaveLength(1)
    expect(g.querySelectorAll('.bc-annotation-line[marker-end]')).toHaveLength(0)
  })
})
