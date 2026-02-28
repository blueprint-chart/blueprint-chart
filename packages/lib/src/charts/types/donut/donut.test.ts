import { describe, it, expect } from 'vitest'
import { render } from './donut'

const DATA = { labels: ['A', 'B', 'C'], values: [30, 50, 20] }

function createContainer(): HTMLElement {
  const container = document.createElement('div')
  document.body.appendChild(container)
  return container
}

describe('donut chart rendering', () => {
  it('renders arc paths', () => {
    const container = createContainer()
    render(container, DATA)
    const arcs = container.querySelectorAll('.bc-arc')
    expect(arcs).toHaveLength(3)
  })

  it('each arc has a d attribute', () => {
    const container = createContainer()
    render(container, DATA)
    const arcs = container.querySelectorAll('.bc-arc')
    arcs.forEach((arc) => {
      expect(arc.getAttribute('d')).toBeTruthy()
    })
  })
})

describe('donut chart legend and frame', () => {
  it('renders a legend', () => {
    const container = createContainer()
    render(container, DATA)
    const items = container.querySelectorAll('.bc-legend-item')
    expect(items).toHaveLength(3)
  })

  it('creates frame structure', () => {
    const container = createContainer()
    render(container, DATA, { frame: { title: 'Donut' } })
    expect(container.querySelector('.bc-frame-title')?.textContent).toBe('Donut')
  })
})
