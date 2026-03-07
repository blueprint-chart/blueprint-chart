import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from './bar-horizontal'

describe('bar-horizontal', () => {
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

  it('renders horizontal bars', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar')
    expect(bars).toHaveLength(3)
  })

  it('creates frame and SVG', () => {
    render(container, data)
    expect(container.querySelector('.bc-frame')).not.toBeNull()
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('bars have horizontal orientation (width varies)', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar')
    const widths = Array.from(bars).map(b => Number(b.getAttribute('width')))
    expect(widths.some(w => w > 0)).toBe(true)
    // All bars start at x=0
    const xs = Array.from(bars).map(b => Number(b.getAttribute('x')))
    expect(xs.every(x => x === 0)).toBe(true)
  })

  it('applies highlight colors', () => {
    render(container, data, {
      highlights: [{ target: 'A', color: '#00ff00' }],
    })
    const bars = container.querySelectorAll('.bc-bar')
    const fills = Array.from(bars).map(b => b.getAttribute('fill'))
    expect(fills).toContain('#00ff00')
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

  it('shows horizontal axis tick labels by default', () => {
    render(container, data)
    const hAxis = container.querySelector('.bc-axis-horizontal')
    expect(hAxis).not.toBeNull()
    const tickTexts = hAxis!.querySelectorAll('.tick text')
    expect(tickTexts.length).toBeGreaterThan(0)
  })

  it('hides horizontal axis tick labels when showAxis is false', () => {
    render(container, data, {
      horizontalAxis: { showAxis: false },
    })
    const hAxis = container.querySelector('.bc-axis-horizontal')
    expect(hAxis).not.toBeNull()
    const tickTexts = hAxis!.querySelectorAll('.tick text')
    expect(tickTexts).toHaveLength(0)
  })

  it('hides horizontal axis domain line when showAxis is false', () => {
    render(container, data, {
      horizontalAxis: { showAxis: false },
    })
    const hAxis = container.querySelector('.bc-axis-horizontal')
    expect(hAxis).not.toBeNull()
    const domain = hAxis!.querySelector('.domain')
    expect(domain).toBeNull()
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

      // Fresh re-render with ascending sort (container cleared like useChartPreview does)
      container.replaceChildren()
      render(container, data, { valueLabels: true, sort: 'ascending' })

      const textsAfter = Array.from(container.querySelectorAll('.bc-value-label'))
        .map(el => el.textContent)

      // Same labels should exist but in different order (ascending: 10, 20, 30)
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

      // Labels should still be present and match count (data-join preserves them)
      const countAfter = container.querySelectorAll('.bc-value-label').length
      expect(countAfter).toBe(countBefore)
    })
  })
})
