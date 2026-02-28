import { describe, it, expect } from 'vitest'
import { renderLegend } from './legend'

function createLegendFixture() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  const chartArea = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement
  svg.appendChild(chartArea)
  document.body.appendChild(svg)
  return chartArea
}

describe('renderLegend basic rendering', () => {
  it('creates a legend group', () => {
    const chartArea = createLegendFixture()
    const g = renderLegend(chartArea, ['A', 'B'])
    expect(g.classList.contains('bc-legend')).toBe(true)
  })

  it('creates one item per label', () => {
    const chartArea = createLegendFixture()
    const g = renderLegend(chartArea, ['Series A', 'Series B', 'Series C'])
    const items = g.querySelectorAll('.bc-legend-item')
    expect(items).toHaveLength(3)
  })
})

describe('renderLegend colors', () => {
  it('each item has a colored rect and text', () => {
    const chartArea = createLegendFixture()
    const g = renderLegend(chartArea, ['Alpha'], ['#ff0000'])
    const rect = g.querySelector('rect')
    const text = g.querySelector('text')
    expect(rect?.getAttribute('fill')).toBe('#ff0000')
    expect(text?.textContent).toBe('Alpha')
  })

  it('uses default colors when none provided', () => {
    const chartArea = createLegendFixture()
    const g = renderLegend(chartArea, ['A'])
    const rect = g.querySelector('rect')
    expect(rect?.getAttribute('fill')).toBe('#4e79a7')
  })
})
