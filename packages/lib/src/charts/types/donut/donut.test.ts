import { describe, it, expect, beforeEach } from 'vitest'
import { render } from './donut'

describe('donut chart', () => {
  let container: HTMLElement

  const data = {
    labels: ['A', 'B', 'C'],
    values: [30, 50, 20],
  }

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  it('renders arc paths', () => {
    render(container, data)
    const arcs = container.querySelectorAll('.bc-arc')
    expect(arcs).toHaveLength(3)
  })

  it('each arc has a d attribute', () => {
    render(container, data)
    const arcs = container.querySelectorAll('.bc-arc')
    arcs.forEach((arc) => {
      expect(arc.getAttribute('d')).toBeTruthy()
    })
  })

  it('renders a legend', () => {
    render(container, data)
    const items = container.querySelectorAll('.bc-legend-item')
    expect(items).toHaveLength(3)
  })

  it('creates frame structure', () => {
    render(container, data, { frame: { title: 'Donut' } })
    expect(container.querySelector('.bc-frame-title')?.textContent).toBe('Donut')
  })

  it('supports transition parameter on second render', () => {
    render(container, data)
    render(container, { labels: ['X', 'Y'], values: [40, 60] }, {}, true)
    const arcs = container.querySelectorAll('.bc-arc')
    expect(arcs.length).toBeGreaterThan(0)
  })
})
