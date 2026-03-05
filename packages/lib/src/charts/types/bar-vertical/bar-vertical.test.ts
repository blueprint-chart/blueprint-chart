import { describe, it, expect, beforeEach } from 'vitest'
import { render } from './bar-vertical'

describe('bar-vertical', () => {
  let container: HTMLElement

  const data = {
    labels: ['A', 'B', 'C'],
    values: [10, 30, 20],
  }

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  it('renders bars into the container', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar')
    expect(bars).toHaveLength(3)
  })

  it('creates an SVG element', () => {
    render(container, data)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
  })

  it('creates frame structure', () => {
    render(container, data, { frame: { title: 'Test' } })
    const title = container.querySelector('.bc-frame-title')
    expect(title?.textContent).toBe('Test')
  })

  it('applies highlight colors', () => {
    render(container, data, {
      highlights: [{ target: 'B', color: '#ff0000' }],
    })
    const bars = container.querySelectorAll('.bc-bar')
    const fills = Array.from(bars).map(b => b.getAttribute('fill'))
    expect(fills).toContain('#ff0000')
  })

  it('sorts bars in descending order', () => {
    render(container, data, { sort: 'descending' })
    const bars = container.querySelectorAll('.bc-bar')
    const heights = Array.from(bars).map(b => Number(b.getAttribute('height')))
    expect(heights[0]).toBeGreaterThanOrEqual(heights[1])
    expect(heights[1]).toBeGreaterThanOrEqual(heights[2])
  })

  it('supports transition parameter on second render', () => {
    render(container, data)
    render(container, { labels: ['A', 'B'], values: [15, 25] }, {}, true)
    const bars = container.querySelectorAll('.bc-bar')
    expect(bars.length).toBeGreaterThanOrEqual(2)
  })

  it('clips bars to the chart area', () => {
    render(container, data)
    const clipPath = container.querySelector('clipPath')
    expect(clipPath).not.toBeNull()
    const barGroup = clipPath!.id
      ? container.querySelector(`[clip-path="url(#${clipPath!.id})"]`)
      : null
    expect(barGroup).not.toBeNull()
    expect(barGroup!.querySelector('.bc-bar')).not.toBeNull()
  })
})
