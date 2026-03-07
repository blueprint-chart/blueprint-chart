import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from './bar-vertical'

describe('bar-vertical', () => {
  let container: HTMLElement

  const data = {
    labels: ['A', 'B', 'C'],
    values: [10, 30, 20],
  }

  beforeEach(() => {
    vi.useFakeTimers()
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    vi.useRealTimers()
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

  describe('value label transitions', () => {
    it('preserves value labels during scene transition', () => {
      render(container, data, { valueLabels: true })
      const labelsBefore = container.querySelectorAll('.bc-value-label')
      expect(labelsBefore.length).toBeGreaterThan(0)

      render(container, data, {
        valueLabels: true,
        highlights: [{ target: 'A', color: '#ff0000' }],
      }, true)

      const labelsAfter = container.querySelectorAll('.bc-value-label')
      expect(labelsAfter.length).toBe(labelsBefore.length)
    })

    it('value labels reflect new sort order after re-render', () => {
      render(container, data, { valueLabels: true })
      const textsBefore = Array.from(container.querySelectorAll('.bc-value-label'))
        .map(el => el.textContent)

      container.replaceChildren()
      render(container, data, { valueLabels: true, sort: 'ascending' })

      const textsAfter = Array.from(container.querySelectorAll('.bc-value-label'))
        .map(el => el.textContent)

      expect(textsAfter).toHaveLength(textsBefore.length)
      expect(textsAfter).toEqual(['10', '20', '30'])
    })

    it('uses data-join for value labels during transition (not recreated from scratch)', () => {
      render(container, data, { valueLabels: true })
      const countBefore = container.querySelectorAll('.bc-value-label').length

      render(container, data, {
        valueLabels: true,
        highlights: [{ target: 'B', color: '#ff0000' }],
      }, true)

      const countAfter = container.querySelectorAll('.bc-value-label').length
      expect(countAfter).toBe(countBefore)
    })
  })
})
