import { describe, it, expect, beforeEach } from 'vitest'
import * as d3 from 'd3'
import { renderVerticalAxis } from './vertical-axis'

function createVerticalAxisFixture() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  const chartArea = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement
  svg.appendChild(chartArea)
  document.body.appendChild(svg)
  const scale = d3.scaleLinear().domain([0, 100]).range([300, 0])
  return { chartArea, scale }
}

describe('vertical axis group and ticks', () => {
  let chartArea: SVGGElement
  let scale: d3.ScaleLinear<number, number>

  beforeEach(() => {
    ({ chartArea, scale } = createVerticalAxisFixture())
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
})

describe('vertical axis domain line', () => {
  let chartArea: SVGGElement
  let scale: d3.ScaleLinear<number, number>

  beforeEach(() => {
    ({ chartArea, scale } = createVerticalAxisFixture())
  })

  it('keeps domain line as solid by default', () => {
    const g = renderVerticalAxis(chartArea, scale, 300)
    const domain = g.querySelector('.domain')
    expect(domain).not.toBeNull()
    expect(domain?.getAttribute('stroke-dasharray')).toBeNull()
  })
})

describe('vertical axis grid lines', () => {
  let chartArea: SVGGElement
  let scale: d3.ScaleLinear<number, number>

  beforeEach(() => {
    ({ chartArea, scale } = createVerticalAxisFixture())
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
})
