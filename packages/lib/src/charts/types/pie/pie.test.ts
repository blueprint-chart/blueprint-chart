import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from './pie'

describe('pie chart', () => {
  let container: HTMLElement

  const data = {
    labels: ['X', 'Y', 'Z'],
    values: [40, 35, 25],
  }

  beforeEach(() => {
    vi.useFakeTimers()
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders arc paths', () => {
    render(container, data)
    const arcs = container.querySelectorAll('.bc-arc')
    expect(arcs).toHaveLength(3)
  })

  it('creates frame and SVG', () => {
    render(container, data)
    expect(container.querySelector('.bc-frame')).not.toBeNull()
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('renders a legend', () => {
    render(container, data)
    const items = container.querySelectorAll('.bc-legend-item')
    expect(items).toHaveLength(3)
  })

  it('supports transition parameter on second render', () => {
    render(container, data)
    render(container, { labels: ['A', 'B'], values: [50, 50] }, {}, true)
    const arcs = container.querySelectorAll('.bc-arc')
    expect(arcs.length).toBeGreaterThan(0)
  })
})
