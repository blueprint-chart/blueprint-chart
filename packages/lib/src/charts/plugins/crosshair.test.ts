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
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild)
    }
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

  it('positions crosshair at bar center for vertical bars (default)', () => {
    const barG = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.appendChild(barG)
    d3.select(barG).append('rect')
      .attr('class', 'bc-bar')
      .attr('x', 20).attr('y', 50)
      .attr('width', 40).attr('height', 100)

    const plugin = createCrosshairPlugin({ width: 400, height: 300 })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const bar = barG.querySelector('.bc-bar') as SVGRectElement
    bar.dispatchEvent(new MouseEvent('mouseenter'))

    const vLine = g.querySelector('.bc-crosshair-v') as SVGLineElement
    const hLine = g.querySelector('.bc-crosshair-h') as SVGLineElement
    // Vertical crosshair at x-center of bar: 20 + 40/2 = 40
    expect(vLine.getAttribute('x1')).toBe('40')
    // Horizontal crosshair at top of bar
    expect(hLine.getAttribute('y1')).toBe('50')
  })

  it('positions crosshair at bar y-center for horizontal orientation', () => {
    const barG = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.appendChild(barG)
    d3.select(barG).append('rect')
      .attr('class', 'bc-bar')
      .attr('x', 0).attr('y', 30)
      .attr('width', 120).attr('height', 25)

    const plugin = createCrosshairPlugin({ width: 400, height: 300, orientation: 'horizontal' })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const bar = barG.querySelector('.bc-bar') as SVGRectElement
    bar.dispatchEvent(new MouseEvent('mouseenter'))

    const vLine = g.querySelector('.bc-crosshair-v') as SVGLineElement
    const hLine = g.querySelector('.bc-crosshair-h') as SVGLineElement
    // Vertical crosshair at right edge of bar: 0 + 120 = 120
    expect(vLine.getAttribute('x1')).toBe('120')
    // Horizontal crosshair at y-center of bar: 30 + 25/2 = 42.5
    expect(hLine.getAttribute('y1')).toBe('42.5')
  })
})
