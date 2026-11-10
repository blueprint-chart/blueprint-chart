import { describe, it, expect, beforeEach } from 'vitest'
import { render } from './bar-horizontal'

describe('bar-horizontal overlay key hover', () => {
  let container: HTMLElement

  const data = {
    labels: ['A', 'B', 'C'],
    values: [5, 8, 6],
    series: [
      { name: 'V', values: [5, 8, 6] },
      { name: 'Min', values: [4, 6, 5] },
      { name: 'Max', values: [7, 9, 8] },
      { name: 'Last', values: [6, 7, 5] },
    ],
  }

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  it('dims other overlay marks when a key entry is hovered', async () => {
    const overlays = [
      { columns: ['Min', 'Max'], title: '95% CI' },
      { columns: ['Last'], title: '2022' },
    ]
    render(container, data, { overlays, directLabelling: '' })
    const items = container.querySelectorAll('.bc-legend-item')
    items[0].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await new Promise(resolve => setTimeout(resolve, 800))
    const range = container.querySelector<SVGElement>('rect.bc-overlay-range')!
    const value = container.querySelector<SVGElement>('line.bc-overlay-value')!
    expect(range.style.opacity).toBe('1')
    expect(value.style.opacity).toBe('0.2')
  })

  const cueOverlays = [{ columns: ['Last'], title: 'T', aboveColor: '#00ff00', belowColor: '#ff0000', belowTitle: 'Missed' }]

  it('keeps the overlay as a direct label and lists only cue entries in the key', () => {
    render(container, data, { overlays: cueOverlays })
    const direct = Array.from(container.querySelectorAll('.bc-overlay-label')).map(node => node.textContent)
    const keys = Array.from(container.querySelectorAll('.bc-legend-item')).map(node => node.textContent)
    expect(direct).toContain('T')
    expect(keys).toEqual(['Above T', 'Missed'])
  })

  it('hides cue entries when legend is false', () => {
    render(container, data, { overlays: cueOverlays, legend: false })
    expect(container.querySelectorAll('.bc-legend-item').length).toBe(0)
  })
})
