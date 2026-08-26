import { describe, it, expect, beforeEach } from 'vitest'
import { renderLegend } from './legend'
import { measureTextWidth } from '../text-measure'

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
    // Legend item width: 16 (swatch+gap) + measured text + 12 (trailing gap)
    // "A" → 16 + 6 + 12 = 34

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
      // tx = chartWidth + right - legendWidth = 400 + 20 - 34 = 386
      expect(g.getAttribute('transform')).toBe('translate(386,-10)')
    })

    it('centers horizontal legend middle-anchor within the extended frame', () => {
      const g = renderLegend(
        chartArea, ['A'], undefined, -10, 'top', 'middle', 400, 300, 0, [], { left: 50, right: 20 },
      )
      // tx = -left + (chartWidth + left + right - legendWidth)/2 = -50 + (400 + 70 - 34)/2 = -50 + 218 = 168
      expect(g.getAttribute('transform')).toBe('translate(168,-10)')
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

  function addSeriesElement(cls: string, seriesKey: string): SVGElement {
    const el = document.createElementNS('http://www.w3.org/2000/svg', cls === 'bc-value-label' || cls === 'bc-direct-label' ? 'text' : 'rect')
    el.setAttribute('class', cls)
    el.setAttribute('data-series', seriesKey)
    chartArea.appendChild(el)
    return el
  }

  const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

  async function triggerHighlight(legendItem: Element) {
    legendItem.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    // HOVER_DELAY (200ms) + D3 transition (150ms) + generous buffer for
    // heavily-loaded CI / shared-environment runs.
    await wait(800)
  }

  async function triggerRestore(legendItem: Element) {
    legendItem.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
    await wait(800)
  }

  it('hides non-highlighted value labels (opacity 0)', async () => {
    addSeriesElement('bc-bar', 'Series A')
    addSeriesElement('bc-bar', 'Series B')
    addSeriesElement('bc-value-label', 'Series A')
    addSeriesElement('bc-value-label', 'Series B')

    renderLegend(chartArea, ['Series A', 'Series B'])
    const items = chartArea.querySelectorAll('.bc-legend-item')

    await triggerHighlight(items[0])

    const valueLabels = chartArea.querySelectorAll('.bc-value-label')
    expect(valueLabels[0].style.opacity).toBe('1')
    expect(valueLabels[1].style.opacity).toBe('0')
  })

  it('hides non-highlighted direct labels (opacity 0)', async () => {
    addSeriesElement('bc-direct-label', 'Series A')
    addSeriesElement('bc-direct-label', 'Series B')

    renderLegend(chartArea, ['Series A', 'Series B'])
    const items = chartArea.querySelectorAll('.bc-legend-item')

    await triggerHighlight(items[0])

    const directLabels = chartArea.querySelectorAll('.bc-direct-label')
    expect(directLabels[0].style.opacity).toBe('1')
    expect(directLabels[1].style.opacity).toBe('0')
  })

  it('reveals labels hidden for space on highlight and re-hides on restore', async () => {
    addSeriesElement('bc-bar', 'Series A')
    const hiddenLabel = addSeriesElement('bc-value-label', 'Series A')
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
    addSeriesElement('bc-bar', 'Series A')
    addSeriesElement('bc-bar', 'Series B')

    renderLegend(chartArea, ['Series A', 'Series B'])
    const items = chartArea.querySelectorAll('.bc-legend-item')

    await triggerHighlight(items[0])

    const bars = chartArea.querySelectorAll('.bc-bar')
    expect(bars[0].style.opacity).toBe('1')
    expect(bars[1].style.opacity).toBe('0.2')
  })

  it('restores all opacities on mouseleave', async () => {
    addSeriesElement('bc-bar', 'Series A')
    addSeriesElement('bc-bar', 'Series B')
    addSeriesElement('bc-value-label', 'Series A')
    addSeriesElement('bc-value-label', 'Series B')

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

  // ── Listener stability across re-renders (L3) ─────────────────

  it('does not accumulate mouse listeners across repeated renderLegend calls', async () => {
    addSeriesElement('bc-bar', 'Series A')
    addSeriesElement('bc-bar', 'Series B')

    // Render once to establish the legend items, then count how often
    // highlight() fires on a single mouseenter. With the namespaced D3
    // handler (.on('mouseenter.bcHighlight', …)) every re-render should
    // replace the previous handler, so the listener count stays at 1
    // and highlight() runs exactly once per event.
    for (let i = 0; i < 10; i++) {
      renderLegend(chartArea, ['Series A', 'Series B'])
    }

    // The namespaced handler (.on('mouseenter.bcHighlight', …)) means every
    // re-render REPLACES the previous closure instead of stacking. D3 stores
    // active handlers on each node under the `__on` property; we assert that
    // the bcHighlight slot has exactly one enter + one leave handler after
    // many renders.
    const items = chartArea.querySelectorAll('.bc-legend-item')
    const target = items[0] as SVGGElement
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onRegistry = (target as any).__on as Array<{ type: string, name: string }> | undefined
    expect(onRegistry).toBeDefined()
    const enterHandlers = (onRegistry ?? []).filter(h => h.type === 'mouseenter' && h.name === 'bcHighlight')
    const leaveHandlers = (onRegistry ?? []).filter(h => h.type === 'mouseleave' && h.name === 'bcHighlight')
    expect(enterHandlers).toHaveLength(1)
    expect(leaveHandlers).toHaveLength(1)
  })

  it('renderLegend re-renders update swatch and label by series name', () => {
    renderLegend(chartArea, ['Series A', 'Series B'], ['#ff0000', '#00ff00'])
    // Re-render with swapped order — keyed by name, items should preserve
    // identity so Series A keeps #ff0000 not whatever index it now occupies.
    renderLegend(chartArea, ['Series B', 'Series A'], ['#00ff00', '#ff0000'])

    const items = chartArea.querySelectorAll('.bc-legend-item')
    // Find Series A item by its data-series attribute
    const seriesA = Array.from(items).find(it => it.getAttribute('data-series') === 'Series A')
    const seriesB = Array.from(items).find(it => it.getAttribute('data-series') === 'Series B')
    expect(seriesA).toBeDefined()
    expect(seriesB).toBeDefined()
    expect(seriesA!.querySelector('rect')?.getAttribute('fill')).toBe('#ff0000')
    expect(seriesB!.querySelector('rect')?.getAttribute('fill')).toBe('#00ff00')
  })

  it('uses the series name as the data-series attribute on legend items', () => {
    renderLegend(chartArea, ['Alpha', 'Beta'])
    const items = chartArea.querySelectorAll('.bc-legend-item')
    const keys = Array.from(items).map(i => i.getAttribute('data-series'))
    expect(keys).toEqual(['Alpha', 'Beta'])
  })
})

describe('legend item width is measured, not counted (#35)', () => {
  let chartArea: SVGGElement

  beforeEach(() => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    chartArea = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement
    svg.appendChild(chartArea)
    document.body.appendChild(svg)
  })

  function itemXs(g: SVGGElement): number[] {
    return [...g.querySelectorAll('.bc-legend-item')].map((el) => {
      const match = /translate\(([-\d.]+),/.exec(el.getAttribute('transform') ?? '')
      return match ? Number(match[1]) : 0
    })
  }

  it('advances past a CJK label instead of painting the next swatch on top of it', () => {
    const labels = ['日本語のラベル', 'Русский текст', '中文標籤']
    const g = renderLegend(chartArea, labels, undefined, -10, 'top', 'start', 900)
    const xs = itemXs(g)
    expect(xs[1] - xs[0]).toBeGreaterThanOrEqual(16 + measureTextWidth(labels[0], 12))
    expect(xs[2] - xs[1]).toBeGreaterThanOrEqual(16 + measureTextWidth(labels[1], 12))
  })

  it('truncates a label wider than the row with an ellipsis', () => {
    const label = 'Federal Government and Local Government Agencies'
    const g = renderLegend(chartArea, [label], undefined, -10, 'top', 'start', 310)
    const text = g.querySelector('text')?.textContent ?? ''
    expect(text.endsWith('…')).toBe(true)
    expect(16 + measureTextWidth(text, 12) + 12).toBeLessThanOrEqual(310)
  })

  it('keeps the value suffix when the label is truncated', () => {
    const g = renderLegend(
      chartArea, ['Federal Government and Local Government Agencies'], undefined,
      -10, 'top', 'start', 310, 0, 0, ['(42%)'],
    )
    expect(g.querySelector('text')?.textContent).toContain('(42%)')
  })
})
