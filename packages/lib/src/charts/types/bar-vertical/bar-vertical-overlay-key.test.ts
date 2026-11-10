import { describe, it, expect, beforeEach } from 'vitest'
import { render } from './bar-vertical'

describe('bar-vertical overlay key hover', () => {
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
    render(container, data, { overlays })
    const items = container.querySelectorAll('.bc-legend-item')
    items[0].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await new Promise(resolve => setTimeout(resolve, 800))
    const range = container.querySelector<SVGElement>('rect.bc-overlay-range')!
    const value = container.querySelector<SVGElement>('line.bc-overlay-value')!
    expect(range.style.opacity).toBe('1')
    expect(value.style.opacity).toBe('0.2')
  })

  it('lists cue entries after their overlay', () => {
    const overlays = [
      { columns: ['Min', 'Max'], title: 'Lo to Hi' },
      { columns: ['Last'], title: 'T', aboveColor: '#00ff00', belowColor: '#ff0000', belowTitle: 'Missed' },
    ]
    render(container, data, { overlays })
    const items = Array.from(container.querySelectorAll('.bc-legend-item'))
    const labels = items.map(item => item.textContent)
    expect(labels).toEqual(['Lo to Hi', 'T', 'Above T', 'Missed'])
    const swatch = items[2].querySelector('rect')!
    expect(swatch.getAttribute('fill')).toBe('#00ff00')
  })
})
