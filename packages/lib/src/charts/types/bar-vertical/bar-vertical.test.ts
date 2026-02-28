import { describe, it, expect } from 'vitest'
import { render } from './bar-vertical'

const DATA = { labels: ['A', 'B', 'C'], values: [10, 30, 20] }

function createContainer(): HTMLElement {
  const container = document.createElement('div')
  document.body.appendChild(container)
  return container
}

describe('bar-vertical rendering', () => {
  it('renders bars into the container', () => {
    const container = createContainer()
    render(container, DATA)
    const bars = container.querySelectorAll('.bc-bar')
    expect(bars).toHaveLength(3)
  })

  it('creates an SVG element', () => {
    const container = createContainer()
    render(container, DATA)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
  })

  it('creates frame structure', () => {
    const container = createContainer()
    render(container, DATA, { frame: { title: 'Test' } })
    const title = container.querySelector('.bc-frame-title')
    expect(title?.textContent).toBe('Test')
  })
})

describe('bar-vertical options', () => {
  it('applies highlight colors', () => {
    const container = createContainer()
    render(container, DATA, { highlights: [{ target: 'B', color: '#ff0000' }] })
    const bars = container.querySelectorAll('.bc-bar')
    const fills = Array.from(bars).map(b => b.getAttribute('fill'))
    expect(fills).toContain('#ff0000')
  })

  it('sorts bars in descending order', () => {
    const container = createContainer()
    render(container, DATA, { sort: 'descending' })
    const bars = container.querySelectorAll('.bc-bar')
    const heights = Array.from(bars).map(b => Number(b.getAttribute('height')))
    expect(heights[0]).toBeGreaterThanOrEqual(heights[1])
    expect(heights[1]).toBeGreaterThanOrEqual(heights[2])
  })
})
