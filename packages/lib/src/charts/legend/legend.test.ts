import { describe, it, expect, beforeEach } from 'vitest'
import { renderLegend } from './legend'

describe('renderLegend', () => {
  let chartArea: SVGGElement

  beforeEach(() => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    chartArea = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement
    svg.appendChild(chartArea)
    document.body.appendChild(svg)
  })

  it('creates a legend group', () => {
    const g = renderLegend(chartArea, ['A', 'B'])
    expect(g.classList.contains('bc-legend')).toBe(true)
  })

  it('creates one item per label', () => {
    const g = renderLegend(chartArea, ['Series A', 'Series B', 'Series C'])
    const items = g.querySelectorAll('.bc-legend-item')
    expect(items).toHaveLength(3)
  })

  it('each item has a colored rect and text', () => {
    const g = renderLegend(chartArea, ['Alpha'], ['#ff0000'])
    const rect = g.querySelector('rect')
    const text = g.querySelector('text')
    expect(rect?.getAttribute('fill')).toBe('#ff0000')
    expect(text?.textContent).toBe('Alpha')
  })

  it('uses default colors when none provided', () => {
    const g = renderLegend(chartArea, ['A'])
    const rect = g.querySelector('rect')
    expect(rect?.getAttribute('fill')).toBe('#4e79a7')
  })
})
