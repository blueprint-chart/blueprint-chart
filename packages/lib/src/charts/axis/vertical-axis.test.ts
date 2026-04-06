import { describe, it, expect, beforeEach } from 'vitest'
import * as d3 from 'd3'
import { renderVerticalAxis } from './vertical-axis'

describe('renderVerticalAxis', () => {
  let chartArea: SVGGElement
  let scale: d3.ScaleLinear<number, number>

  beforeEach(() => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    chartArea = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement
    svg.appendChild(chartArea)
    document.body.appendChild(svg)
    scale = d3.scaleLinear().domain([0, 100]).range([300, 0])
  })

  it('creates a vertical axis group', () => {
    const g = renderVerticalAxis(chartArea, scale, 300)
    expect(g.classList.contains('bc-axis-vertical')).toBe(true)
  })

  it('removes tick lines by default', () => {
    const g = renderVerticalAxis(chartArea, scale, 300)
    const tickLines = g.querySelectorAll('.tick line')
    expect(tickLines).toHaveLength(0)
  })

  it('keeps tick lines when showTicks is true', () => {
    const g = renderVerticalAxis(chartArea, scale, 300, { showTicks: true })
    const tickLines = g.querySelectorAll('.tick line')
    expect(tickLines.length).toBeGreaterThan(0)
  })

  it('keeps domain line as solid by default', () => {
    const g = renderVerticalAxis(chartArea, scale, 300)
    const domain = g.querySelector('.domain')
    expect(domain).not.toBeNull()
    expect(domain?.getAttribute('stroke-dasharray')).toBeNull()
  })

  it('renders dashed grid lines when gridWidth is provided', () => {
    const g = renderVerticalAxis(chartArea, scale, 300, { gridWidth: 500 })
    const gridLines = g.querySelectorAll('.bc-grid-line')
    expect(gridLines.length).toBeGreaterThan(0)
    gridLines.forEach((line) => {
      expect(line.getAttribute('stroke-dasharray')).toBe('4,4')
    })
  })

  it('renders no grid lines when gridStyle is none', () => {
    const g = renderVerticalAxis(chartArea, scale, 300, { gridStyle: 'none', gridWidth: 500 })
    const gridLines = g.querySelectorAll('.bc-grid-line')
    expect(gridLines).toHaveLength(0)
  })

  it('applies numberFormat to tick labels', () => {
    const g = renderVerticalAxis(chartArea, scale, 300, { numberFormat: ',.0f' })
    const tickTexts = Array.from(g.querySelectorAll('.tick text')).map(t => t.textContent)
    // With ,.0f format, numbers should have comma separators and no decimals
    // D3 default ticks for domain [0,100] are 0, 20, 40, 60, 80, 100
    expect(tickTexts).toContain('0')
    expect(tickTexts).toContain('100')
    // Verify none have decimal points (,.0f removes them)
    expect(tickTexts.every(t => !t!.includes('.'))).toBe(true)
  })

  it('applies prefix/suffix numberFormat via pipe syntax', () => {
    scale = d3.scaleLinear().domain([0, 10000]).range([300, 0])
    const g = renderVerticalAxis(chartArea, scale, 300, { numberFormat: '$|,.0f|' })
    const tickTexts = Array.from(g.querySelectorAll('.tick text')).map(t => t.textContent)
    // Should have dollar prefix and comma separators
    expect(tickTexts.some(t => t!.startsWith('$'))).toBe(true)
    expect(tickTexts.some(t => t!.includes(','))).toBe(true)
  })

  it('limits ticks based on height: fewer ticks at small height than at large height', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const areaShort = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement
    svg.appendChild(areaShort)
    document.body.appendChild(svg)

    const scaleTall = d3.scaleLinear().domain([0, 100]).range([300, 0])
    const scaleShort = d3.scaleLinear().domain([0, 100]).range([60, 0])
    const gTall = renderVerticalAxis(chartArea, scaleTall, 300)
    const gShort = renderVerticalAxis(areaShort, scaleShort, 60)
    const ticksTall = gTall.querySelectorAll('.tick').length
    const ticksShort = gShort.querySelectorAll('.tick').length
    // Small height should produce fewer ticks than large height
    expect(ticksShort).toBeLessThan(ticksTall)
  })

  it('does not limit ticks when height is 0', () => {
    // height=0 → no constraint applied, D3 picks defaults
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const areaUnconstrained = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement
    svg.appendChild(areaUnconstrained)
    document.body.appendChild(svg)

    const scaleConstrained = d3.scaleLinear().domain([0, 100]).range([60, 0])
    const scaleUnconstrained = d3.scaleLinear().domain([0, 100]).range([300, 0])
    const gConstrained = renderVerticalAxis(chartArea, scaleConstrained, 60)
    const gUnconstrained = renderVerticalAxis(areaUnconstrained, scaleUnconstrained, 0)
    const ticksConstrained = gConstrained.querySelectorAll('.tick').length
    const ticksUnconstrained = gUnconstrained.querySelectorAll('.tick').length
    expect(ticksConstrained).toBeLessThanOrEqual(ticksUnconstrained)
  })

  it('respects explicit ticks over height-based limiting', () => {
    scale = d3.scaleLinear().domain([0, 100]).range([60, 0])
    const explicitTicks = [0, 25, 50, 75, 100]
    const g = renderVerticalAxis(chartArea, scale, 60, { ticks: explicitTicks })
    const tickTexts = Array.from(g.querySelectorAll('.tick text')).map(t => t.textContent)
    expect(tickTexts).toContain('0')
    expect(tickTexts).toContain('100')
    expect(tickTexts.length).toBe(explicitTicks.length)
  })

  it('hides tick lines on re-render when showTicks is false and labelPosition is off', () => {
    const opts = { showTicks: false, showAxis: false, labelPosition: 'off' as const }
    const g = renderVerticalAxis(chartArea, scale, 300, opts)
    // Re-render with prior element (exercises merge:transition path)
    const g2 = renderVerticalAxis(chartArea, scale, 300, opts, g)
    const visibleTickLines = Array.from(g2.querySelectorAll('.tick line'))
      .filter(el => el.getAttribute('opacity') !== '0')
    expect(visibleTickLines).toHaveLength(0)
  })
})
