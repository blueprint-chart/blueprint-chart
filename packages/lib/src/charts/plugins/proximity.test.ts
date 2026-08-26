import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setupProximityInteraction, makeDefaultFormat, disposeProximityFor } from './proximity'
import { CrosshairDirection, CrosshairStyle } from '../../enums'

describe('makeDefaultFormat (proximity)', () => {
  it('formats value with numberFormat for single-series point', () => {
    const fmt = makeDefaultFormat(',.0f')
    expect(fmt({ cx: 0, cy: 0, label: 'Jan', value: 1234, color: '#000' })).toBe('Jan: 1,234')
  })

  it('formats value with numberFormat for multi-series point', () => {
    const fmt = makeDefaultFormat(',.0f')
    expect(fmt({ cx: 0, cy: 0, label: 'Jan', value: 1234, series: 'GDP', color: '#000' })).toBe('GDP – Jan: 1,234')
  })

  it('formats with pipe-delimited suffix', () => {
    const fmt = makeDefaultFormat('|.1f|%')
    expect(fmt({ cx: 0, cy: 0, label: 'Jan 2023', value: 6.4, color: '#000' })).toBe('Jan 2023: 6.4%')
  })

  it('falls back to String() without numberFormat', () => {
    const fmt = makeDefaultFormat()
    expect(fmt({ cx: 0, cy: 0, label: 'Jan', value: 1234, color: '#000' })).toBe('Jan: 1234')
  })
})

describe('setupProximityInteraction', () => {
  let svg: SVGSVGElement
  let g: SVGGElement

  beforeEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild)
    }
    const existing = document.getElementById('bc-tooltip-styles')
    if (existing) {
      existing.remove()
    }
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    svg.appendChild(g)
    document.body.appendChild(svg)
  })

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild)
    }
    const existing = document.getElementById('bc-tooltip-styles')
    if (existing) {
      existing.remove()
    }
  })

  const points = [
    { cx: 50, cy: 100, label: 'A', value: 10, color: '#4e79a7' },
    { cx: 150, cy: 80, label: 'B', value: 20, color: '#4e79a7' },
    { cx: 250, cy: 60, label: 'C', value: 30, color: '#4e79a7' },
  ]

  // ── Element creation ─────────────────────────────────────────────

  it('creates overlay rect and highlight dot', () => {
    setupProximityInteraction(g, { width: 400, height: 300, points })

    expect(g.querySelector('.bc-proximity-overlay')).not.toBeNull()
    expect(g.querySelector('.bc-proximity-dot')).not.toBeNull()
  })

  it('creates crosshair lines when crosshair is enabled', () => {
    setupProximityInteraction(g, { width: 400, height: 300, points, crosshair: true })

    expect(g.querySelector('.bc-crosshair-v')).not.toBeNull()
    expect(g.querySelector('.bc-crosshair-h')).not.toBeNull()
  })

  it('does not create crosshair lines when crosshair is disabled', () => {
    setupProximityInteraction(g, { width: 400, height: 300, points, crosshair: false })

    expect(g.querySelector('.bc-crosshair-v')).toBeNull()
    expect(g.querySelector('.bc-crosshair-h')).toBeNull()
  })

  it('creates only vertical crosshair when direction is vertical', () => {
    setupProximityInteraction(g, { width: 400, height: 300, points, crosshair: true, crosshairDirection: CrosshairDirection.Vertical })

    expect(g.querySelector('.bc-crosshair-v')).not.toBeNull()
    expect(g.querySelector('.bc-crosshair-h')).toBeNull()
  })

  it('creates only horizontal crosshair when direction is horizontal', () => {
    setupProximityInteraction(g, { width: 400, height: 300, points, crosshair: true, crosshairDirection: CrosshairDirection.Horizontal })

    expect(g.querySelector('.bc-crosshair-v')).toBeNull()
    expect(g.querySelector('.bc-crosshair-h')).not.toBeNull()
  })

  // ── Cleanup ──────────────────────────────────────────────────────

  it('returns cleanup function that removes elements', () => {
    const cleanup = setupProximityInteraction(g, { width: 400, height: 300, points, crosshair: true })

    expect(g.querySelector('.bc-proximity-overlay')).not.toBeNull()
    cleanup()
    expect(g.querySelector('.bc-proximity-overlay')).toBeNull()
    expect(g.querySelector('.bc-proximity-dot')).toBeNull()
    expect(g.querySelector('.bc-crosshair-v')).toBeNull()
  })

  it('cleanup removes tooltip from document body', () => {
    const cleanup = setupProximityInteraction(g, { width: 400, height: 300, points, tooltip: true })

    expect(document.querySelector('.bc-tooltip')).not.toBeNull()
    cleanup()
    expect(document.querySelector('.bc-tooltip')).toBeNull()
  })

  // ── Crosshair styles ─────────────────────────────────────────────

  it('sets stroke-dasharray via style for solid crosshairStyle', () => {
    setupProximityInteraction(g, { width: 400, height: 300, points, crosshair: true, crosshairStyle: CrosshairStyle.Solid })

    const vLine = g.querySelector('.bc-crosshair-v') as SVGLineElement
    expect(vLine).not.toBeNull()
    expect(vLine.style.strokeDasharray).toBe('none')
  })

  // chart.scss declares `.bc-crosshair { stroke: var(--bc-crosshair-color) }`,
  // and a stylesheet declaration always beats a presentation attribute, so a
  // `stroke` attribute here is dead: only an inline style paints the colour.
  it('carries crosshairColor where the stylesheet cannot outrank it', () => {
    setupProximityInteraction(g, { width: 400, height: 300, points, crosshair: true, crosshairColor: '#ff0000' })

    const vLine = g.querySelector('.bc-crosshair-v') as SVGLineElement
    const hLine = g.querySelector('.bc-crosshair-h') as SVGLineElement
    expect(vLine.style.stroke).toBe('#ff0000')
    expect(hLine.style.stroke).toBe('#ff0000')
  })

  it('sets stroke-dasharray via style for dotted crosshairStyle', () => {
    setupProximityInteraction(g, { width: 400, height: 300, points, crosshair: true, crosshairStyle: CrosshairStyle.Dotted })

    const vLine = g.querySelector('.bc-crosshair-v') as SVGLineElement
    expect(vLine).not.toBeNull()
    expect(vLine.style.strokeDasharray).toBe('2,2')
  })

  it('sets stroke-dasharray via style for dashed crosshairStyle', () => {
    setupProximityInteraction(g, { width: 400, height: 300, points, crosshair: true, crosshairStyle: CrosshairStyle.Dashed })

    const vLine = g.querySelector('.bc-crosshair-v') as SVGLineElement
    expect(vLine).not.toBeNull()
    expect(vLine.style.strokeDasharray).toBe('4,3')
  })

  // ── Empty dataset ────────────────────────────────────────────────

  it('does nothing with empty points', () => {
    const cleanup = setupProximityInteraction(g, { width: 400, height: 300, points: [] })
    expect(g.querySelector('.bc-proximity-overlay')).toBeNull()
    cleanup()
  })

  // ── Single point ─────────────────────────────────────────────────

  it('works with a single data point', () => {
    const single = [{ cx: 200, cy: 150, label: 'Solo', value: 42, color: '#333' }]
    const cleanup = setupProximityInteraction(g, { width: 400, height: 300, points: single })

    expect(g.querySelector('.bc-proximity-overlay')).not.toBeNull()
    expect(g.querySelector('.bc-proximity-dot')).not.toBeNull()
    cleanup()
  })

  // ── Tooltip ──────────────────────────────────────────────────────

  it('creates tooltip div when tooltip is enabled (default)', () => {
    const cleanup = setupProximityInteraction(g, { width: 400, height: 300, points })
    expect(document.querySelector('.bc-tooltip')).not.toBeNull()
    cleanup()
  })

  it('does not create tooltip div when tooltip is false', () => {
    const cleanup = setupProximityInteraction(g, { width: 400, height: 300, points, tooltip: false })
    expect(document.querySelector('.bc-tooltip')).toBeNull()
    cleanup()
  })

  it('injects tooltip styles into document head', () => {
    const cleanup = setupProximityInteraction(g, { width: 400, height: 300, points, tooltip: true })
    expect(document.getElementById('bc-tooltip-styles')).not.toBeNull()
    cleanup()
  })

  // ── Mousemove / mouseleave ───────────────────────────────────────

  it('hides highlight dot on mouseleave', () => {
    const cleanup = setupProximityInteraction(g, { width: 400, height: 300, points, tooltip: false })

    const overlay = g.querySelector('.bc-proximity-overlay')!
    overlay.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }))
    overlay.dispatchEvent(new MouseEvent('mouseleave'))

    const dot = g.querySelector('.bc-proximity-dot') as SVGCircleElement
    expect(dot.style.display).toBe('none')
    cleanup()
  })

  it('hides crosshair lines on mouseleave', () => {
    const cleanup = setupProximityInteraction(g, {
      width: 400, height: 300, points, tooltip: false, crosshair: true,
    })

    const overlay = g.querySelector('.bc-proximity-overlay')!
    overlay.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }))
    overlay.dispatchEvent(new MouseEvent('mouseleave'))

    expect((g.querySelector('.bc-crosshair-v') as SVGLineElement).style.display).toBe('none')
    expect((g.querySelector('.bc-crosshair-h') as SVGLineElement).style.display).toBe('none')
    cleanup()
  })

  it('hides tooltip on mouseleave', () => {
    const cleanup = setupProximityInteraction(g, { width: 400, height: 300, points, tooltip: true })

    const overlay = g.querySelector('.bc-proximity-overlay')!
    overlay.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }))
    overlay.dispatchEvent(new MouseEvent('mouseleave'))

    const tooltip = document.querySelector('.bc-tooltip') as HTMLDivElement
    expect(tooltip.style.display).toBe('none')
    cleanup()
  })

  // ── Insertion order ──────────────────────────────────────────────

  it('inserts elements before .bc-annotations when present', () => {
    const annG = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    annG.setAttribute('class', 'bc-annotations')
    g.appendChild(annG)

    const cleanup = setupProximityInteraction(g, { width: 400, height: 300, points, tooltip: false })

    const children = Array.from(g.children)
    const overlayIdx = children.findIndex(el => el.classList.contains('bc-proximity-overlay'))
    const annIdx = children.findIndex(el => el.classList.contains('bc-annotations'))
    expect(overlayIdx).toBeLessThan(annIdx)
    cleanup()
  })

  // ── Multiple points at same x (y-nearest) ───────────────────────

  it('handles multiple points at the same x-position', () => {
    const stacked = [
      { cx: 100, cy: 50, label: 'Top', value: 10, color: '#f00' },
      { cx: 100, cy: 150, label: 'Mid', value: 20, color: '#0f0' },
      { cx: 100, cy: 250, label: 'Bot', value: 30, color: '#00f' },
    ]
    const cleanup = setupProximityInteraction(g, { width: 400, height: 300, points: stacked, tooltip: false })

    expect(g.querySelector('.bc-proximity-overlay')).not.toBeNull()
    cleanup()
  })

  // ── Per-container cleanup registry ───────────────────────────────

  describe('disposeProximityFor', () => {
    it('tears down the previously registered interaction for a container', () => {
      const container = document.createElement('div')
      document.body.appendChild(container)

      setupProximityInteraction(g, { width: 400, height: 300, points, tooltip: true, container })
      expect(document.querySelectorAll('.bc-tooltip')).toHaveLength(1)

      disposeProximityFor(container)
      expect(document.querySelectorAll('.bc-tooltip')).toHaveLength(0)
      expect(g.querySelector('.bc-proximity-overlay')).toBeNull()
    })

    it('keeps at most one tooltip after repeated setups against the same container', () => {
      const container = document.createElement('div')
      document.body.appendChild(container)

      for (let i = 0; i < 5; i++) {
        // Each render iteration mirrors what a chart-type entry function does:
        // dispose first, then create a fresh interaction.
        disposeProximityFor(container)
        // Remove the previous SVG group's children so the overlay rect is fresh.
        while (g.firstChild) {
          g.removeChild(g.firstChild)
        }
        setupProximityInteraction(g, { width: 400, height: 300, points, tooltip: true, container })
        expect(document.querySelectorAll('.bc-tooltip').length).toBeLessThanOrEqual(1)
      }
      expect(document.querySelectorAll('.bc-tooltip')).toHaveLength(1)
    })

    it('is a no-op when nothing is registered for the container', () => {
      const container = document.createElement('div')
      expect(() => disposeProximityFor(container)).not.toThrow()
    })

    it('does not affect interactions registered to other containers', () => {
      const c1 = document.createElement('div')
      const c2 = document.createElement('div')
      document.body.appendChild(c1)
      document.body.appendChild(c2)

      const svg2 = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      const g2 = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      svg2.appendChild(g2)
      document.body.appendChild(svg2)

      setupProximityInteraction(g, { width: 400, height: 300, points, tooltip: true, container: c1 })
      setupProximityInteraction(g2, { width: 400, height: 300, points, tooltip: true, container: c2 })

      expect(document.querySelectorAll('.bc-tooltip')).toHaveLength(2)

      disposeProximityFor(c1)
      expect(document.querySelectorAll('.bc-tooltip')).toHaveLength(1)
      expect(g.querySelector('.bc-proximity-overlay')).toBeNull()
      expect(g2.querySelector('.bc-proximity-overlay')).not.toBeNull()
    })

    it('registers a no-op cleanup when points array is empty', () => {
      const container = document.createElement('div')
      // Calling setup with empty points should still allow disposeProximityFor
      // to run without surprise (and without leaving anything behind).
      setupProximityInteraction(g, { width: 400, height: 300, points: [], container })
      expect(() => disposeProximityFor(container)).not.toThrow()
      expect(document.querySelector('.bc-tooltip')).toBeNull()
    })
  })
})
