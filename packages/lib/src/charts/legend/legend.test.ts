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

  describe('frame alignment', () => {
    // Legend item width formula: 16 (swatch+gap) + len*7 (text) + 12 (trailing gap)
    // "A" → 16 + 7 + 12 = 35

    it('aligns horizontal legend start-anchor flush with frame left edge', () => {
      const g = renderLegend(
        chartArea, ['A'], undefined, -10, 'top', 'start', 400, 300, 0, [], { left: 50, right: 20 },
      )
      expect(g.getAttribute('transform')).toBe('translate(-50,-10)')
    })

    it('aligns horizontal legend end-anchor flush with frame right edge', () => {
      const g = renderLegend(
        chartArea, ['A'], undefined, -10, 'top', 'end', 400, 300, 0, [], { left: 50, right: 20 },
      )
      // tx = chartWidth + right - legendWidth = 400 + 20 - 35 = 385
      expect(g.getAttribute('transform')).toBe('translate(385,-10)')
    })

    it('centers horizontal legend middle-anchor within the extended frame', () => {
      const g = renderLegend(
        chartArea, ['A'], undefined, -10, 'top', 'middle', 400, 300, 0, [], { left: 50, right: 20 },
      )
      // tx = -left + (chartWidth + left + right - legendWidth)/2 = -50 + (400 + 70 - 35)/2 = -50 + 217.5 = 167.5
      expect(g.getAttribute('transform')).toBe('translate(167.5,-10)')
    })

    it('falls back to chart alignment when no frameInset is provided', () => {
      const g = renderLegend(
        chartArea, ['A'], undefined, -10, 'top', 'start', 400, 300, 0, [],
      )
      expect(g.getAttribute('transform')).toBe('translate(0,-10)')
    })

    it('does not shift vertical legends horizontally', () => {
      const g = renderLegend(
        chartArea, ['A'], undefined, 0, 'left', 'start', 400, 300, -50, [], { left: 50, right: 20 },
      )
      // vertical layout: tx stays at xOffset (-50), unaffected by frameInset
      expect(g.getAttribute('transform')).toBe('translate(-50,0)')
    })
  })
})

describe('setupLegendHighlight (via renderLegend)', () => {
  let chartArea: SVGGElement

  beforeEach(() => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    chartArea = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement
    svg.appendChild(chartArea)
    document.body.appendChild(svg)
  })

  function addSeriesElement(cls: string, seriesIndex: number): SVGElement {
    const el = document.createElementNS('http://www.w3.org/2000/svg', cls === 'bc-value-label' || cls === 'bc-direct-label' ? 'text' : 'rect')
    el.setAttribute('class', cls)
    el.setAttribute('data-series', String(seriesIndex))
    chartArea.appendChild(el)
    return el
  }

  const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

  async function triggerHighlight(legendItem: Element) {
    legendItem.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    // HOVER_DELAY (200ms) + D3 transition (150ms) + buffer
    await wait(500)
  }

  async function triggerRestore(legendItem: Element) {
    legendItem.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
    await wait(500)
  }

  it('hides non-highlighted value labels (opacity 0)', async () => {
    addSeriesElement('bc-bar', 0)
    addSeriesElement('bc-bar', 1)
    addSeriesElement('bc-value-label', 0)
    addSeriesElement('bc-value-label', 1)

    renderLegend(chartArea, ['Series A', 'Series B'])
    const items = chartArea.querySelectorAll('.bc-legend-item')

    await triggerHighlight(items[0])

    const valueLabels = chartArea.querySelectorAll('.bc-value-label')
    expect(valueLabels[0].style.opacity).toBe('1')
    expect(valueLabels[1].style.opacity).toBe('0')
  })

  it('hides non-highlighted direct labels (opacity 0)', async () => {
    addSeriesElement('bc-direct-label', 0)
    addSeriesElement('bc-direct-label', 1)

    renderLegend(chartArea, ['Series A', 'Series B'])
    const items = chartArea.querySelectorAll('.bc-legend-item')

    await triggerHighlight(items[0])

    const directLabels = chartArea.querySelectorAll('.bc-direct-label')
    expect(directLabels[0].style.opacity).toBe('1')
    expect(directLabels[1].style.opacity).toBe('0')
  })

  it('reveals labels hidden for space on highlight and re-hides on restore', async () => {
    addSeriesElement('bc-bar', 0)
    const hiddenLabel = addSeriesElement('bc-value-label', 0)
    // Simulate a label hidden by chart rendering (attr opacity=0)
    hiddenLabel.setAttribute('opacity', '0')

    renderLegend(chartArea, ['Series A', 'Series B'])
    const items = chartArea.querySelectorAll('.bc-legend-item')

    await triggerHighlight(items[0])

    // Inline style overrides SVG attribute → label revealed
    expect(hiddenLabel.style.opacity).toBe('1')

    await triggerRestore(items[0])

    // Inline style removed → SVG attribute opacity=0 takes over → hidden again
    expect(hiddenLabel.style.opacity).toBe('')
    expect(hiddenLabel.getAttribute('opacity')).toBe('0')
  })

  it('dims non-highlighted bars with DIM_OPACITY instead of hiding', async () => {
    addSeriesElement('bc-bar', 0)
    addSeriesElement('bc-bar', 1)

    renderLegend(chartArea, ['Series A', 'Series B'])
    const items = chartArea.querySelectorAll('.bc-legend-item')

    await triggerHighlight(items[0])

    const bars = chartArea.querySelectorAll('.bc-bar')
    expect(bars[0].style.opacity).toBe('1')
    expect(bars[1].style.opacity).toBe('0.2')
  })

  it('restores all opacities on mouseleave', async () => {
    addSeriesElement('bc-bar', 0)
    addSeriesElement('bc-bar', 1)
    addSeriesElement('bc-value-label', 0)
    addSeriesElement('bc-value-label', 1)

    renderLegend(chartArea, ['Series A', 'Series B'])
    const items = chartArea.querySelectorAll('.bc-legend-item')

    await triggerHighlight(items[0])
    await triggerRestore(items[0])

    const bars = chartArea.querySelectorAll('.bc-bar')
    const valueLabels = chartArea.querySelectorAll('.bc-value-label')
    expect(bars[0].style.opacity).toBe('')
    expect(bars[1].style.opacity).toBe('')
    expect(valueLabels[0].style.opacity).toBe('')
    expect(valueLabels[1].style.opacity).toBe('')
  })
})
