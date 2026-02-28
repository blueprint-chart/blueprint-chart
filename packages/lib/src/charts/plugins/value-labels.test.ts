import { describe, it, expect, beforeEach } from 'vitest'
import * as d3 from 'd3'
import { createValueLabelPlugin } from './value-labels'

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

describe('createValueLabelPlugin: bar labels', () => {
  let g: SVGGElement
  beforeEach(() => {
    g = createSvgSetup().g
  })

  it('adds labels to bars', () => {
    const barG = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.appendChild(barG)
    d3.select(barG).append('rect')
      .attr('class', 'bc-bar')
      .attr('x', 10).attr('y', 20).attr('width', 50).attr('height', 80)
      .datum({ label: 'A', value: 42 })

    const plugin = createValueLabelPlugin({ orientation: 'vertical' })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const labels = g.querySelectorAll('.bc-value-label')
    expect(labels).toHaveLength(1)
    expect(labels[0].textContent).toBe('42')
  })
})

describe('createValueLabelPlugin: dot labels', () => {
  let g: SVGGElement
  beforeEach(() => {
    g = createSvgSetup().g
  })

  it('adds labels to dots', () => {
    const dotG = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.appendChild(dotG)
    d3.select(dotG).append('circle')
      .attr('class', 'bc-dot')
      .attr('cx', 50).attr('cy', 100).attr('r', 3)
      .datum({ label: 'B', value: 7 })

    const plugin = createValueLabelPlugin()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const labels = g.querySelectorAll('.bc-value-label')
    expect(labels).toHaveLength(1)
    expect(labels[0].textContent).toBe('7')
  })
})

describe('createValueLabelPlugin: custom format', () => {
  let g: SVGGElement
  beforeEach(() => {
    g = createSvgSetup().g
  })

  it('uses custom format', () => {
    const barG = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.appendChild(barG)
    d3.select(barG).append('rect')
      .attr('class', 'bc-bar')
      .attr('x', 0).attr('y', 0).attr('width', 50).attr('height', 80)
      .datum({ label: 'A', value: 1234.5 })

    const plugin = createValueLabelPlugin({ format: ',.1f' })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const label = g.querySelector('.bc-value-label')
    expect(label?.textContent).toBe('1,234.5')
  })
})
