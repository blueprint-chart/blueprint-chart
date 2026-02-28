import { describe, it, expect, beforeEach } from 'vitest'
import * as d3 from 'd3'
import { createCrosshairPlugin } from './crosshair'

function makeChartStub(g: SVGGElement) {
  return { base: d3.select(g) } as unknown
}

describe('createCrosshairPlugin', () => {
  let svg: SVGSVGElement
  let g: SVGGElement

  beforeEach(() => {
    while (document.body.firstChild) { document.body.removeChild(document.body.firstChild) }
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    svg.appendChild(g)
    document.body.appendChild(svg)
  })

  it('creates crosshair lines hidden by default', () => {
    const dotG = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.appendChild(dotG)
    d3.select(dotG).append('circle')
      .attr('class', 'bc-dot')
      .attr('cx', 50).attr('cy', 100).attr('r', 3)
      .datum({ label: 'A', value: 10 })

    const plugin = createCrosshairPlugin({ width: 400, height: 300 })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const vLine = g.querySelector('.bc-crosshair-v') as SVGLineElement
    const hLine = g.querySelector('.bc-crosshair-h') as SVGLineElement
    expect(vLine).not.toBeNull()
    expect(hLine).not.toBeNull()
    expect(vLine.style.display).toBe('none')
    expect(hLine.style.display).toBe('none')
  })

  it('uses custom color and dash', () => {
    const dotG = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.appendChild(dotG)
    d3.select(dotG).append('circle')
      .attr('class', 'bc-dot')
      .attr('cx', 50).attr('cy', 100).attr('r', 3)

    const plugin = createCrosshairPlugin({ width: 400, height: 300, color: '#f00', dashArray: '2,2' })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const vLine = g.querySelector('.bc-crosshair-v')
    expect(vLine?.getAttribute('stroke')).toBe('#f00')
    expect(vLine?.getAttribute('stroke-dasharray')).toBe('2,2')
  })
})
