import { describe, it, expect, beforeEach } from 'vitest'
import * as d3 from 'd3'
import { createValueLabelPlugin } from './value-labels'

function makeChartStub(g: SVGGElement) {
  return { base: d3.select(g) } as unknown
}

describe('createValueLabelPlugin', () => {
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

  // --- Negative value positioning (vertical) ---

  it('places label below bar for negative vertical values (outside)', () => {
    const barG = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.appendChild(barG)
    // Negative bar: y is the zero line (100), extends down by 60px
    d3.select(barG).append('rect')
      .attr('class', 'bc-bar')
      .attr('x', 10).attr('y', 100).attr('width', 50).attr('height', 15)
      .datum({ label: 'A', value: -20 })

    const plugin = createValueLabelPlugin({ orientation: 'vertical' })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const label = g.querySelector('.bc-value-label')!
    const ly = parseFloat(label.getAttribute('y')!)
    // Should be below the bar bottom (100 + 15 + 4 = 119)
    expect(ly).toBe(119)
    expect(label.getAttribute('dominant-baseline')).toBe('hanging')
  })

  it('places label above bar for positive vertical values (outside)', () => {
    const barG = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.appendChild(barG)
    // Small positive bar (outside mode: height < 20)
    d3.select(barG).append('rect')
      .attr('class', 'bc-bar')
      .attr('x', 10).attr('y', 85).attr('width', 50).attr('height', 15)
      .datum({ label: 'A', value: 10 })

    const plugin = createValueLabelPlugin({ orientation: 'vertical' })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const label = g.querySelector('.bc-value-label')!
    const ly = parseFloat(label.getAttribute('y')!)
    // Should be above the bar top (85 - 4 = 81)
    expect(ly).toBe(81)
    expect(label.getAttribute('dominant-baseline')).toBe('auto')
  })

  // --- Negative value positioning (horizontal) ---

  it('places label to the left of bar for negative horizontal values (outside)', () => {
    const barG = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.appendChild(barG)
    // Negative horizontal bar: x is at the left edge, width extends to zero line
    d3.select(barG).append('rect')
      .attr('class', 'bc-bar')
      .attr('x', 50).attr('y', 10).attr('width', 30).attr('height', 20)
      .datum({ label: 'A', value: -15 })

    const plugin = createValueLabelPlugin({ orientation: 'horizontal' })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const label = g.querySelector('.bc-value-label')!
    const lx = parseFloat(label.getAttribute('x')!)
    // Should be to the left of bar (50 - 4 = 46)
    expect(lx).toBe(46)
    expect(label.getAttribute('text-anchor')).toBe('end')
  })

  it('places label to the right of bar for positive horizontal values (outside)', () => {
    const barG = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.appendChild(barG)
    // Small positive horizontal bar (outside mode: width < 40)
    d3.select(barG).append('rect')
      .attr('class', 'bc-bar')
      .attr('x', 80).attr('y', 10).attr('width', 30).attr('height', 20)
      .datum({ label: 'A', value: 15 })

    const plugin = createValueLabelPlugin({ orientation: 'horizontal' })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const label = g.querySelector('.bc-value-label')!
    const lx = parseFloat(label.getAttribute('x')!)
    // Should be to the right of bar (80 + 30 + 4 = 114)
    expect(lx).toBe(114)
    expect(label.getAttribute('text-anchor')).toBe('start')
  })

  it('places label outside negative horizontal bar on the left side in auto mode', () => {
    const barG = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.appendChild(barG)
    // Wide negative bar — auto resolves to outside
    d3.select(barG).append('rect')
      .attr('class', 'bc-bar')
      .attr('x', 20).attr('y', 10).attr('width', 60).attr('height', 20)
      .datum({ label: 'A', value: -50 })

    const plugin = createValueLabelPlugin({ orientation: 'horizontal' })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const label = g.querySelector('.bc-value-label')!
    const lx = parseFloat(label.getAttribute('x')!)
    // Outside negative: left edge - 4 = 16
    expect(lx).toBe(16)
    expect(label.getAttribute('text-anchor')).toBe('end')
  })

  it('places label outside negative vertical bar in auto mode', () => {
    const barG = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.appendChild(barG)
    // Tall negative bar — auto resolves to outside
    d3.select(barG).append('rect')
      .attr('class', 'bc-bar')
      .attr('x', 10).attr('y', 100).attr('width', 50).attr('height', 60)
      .datum({ label: 'A', value: -40 })

    const plugin = createValueLabelPlugin({ orientation: 'vertical' })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const label = g.querySelector('.bc-value-label')!
    const ly = parseFloat(label.getAttribute('y')!)
    // Outside: below bar at 100 + 60 + 4 = 164
    expect(ly).toBe(164)
    expect(label.getAttribute('dominant-baseline')).toBe('hanging')
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
