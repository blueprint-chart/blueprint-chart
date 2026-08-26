import { describe, it, expect, beforeEach } from 'vitest'
import { renderBpc } from '../../../render/render-bpc'

// #73: bar-split never built a horizontal axis, so every Axes control on its
// value axis was inert — no domain line, no ticks, no numbers, no grid. Its
// twin bar-horizontal answers the same DSL, so these read as parity checks.
// Rendered through renderBpc because the per-type registry defaults
// (showHorizontalAxis false, grid none, labels off for the value axis) only
// reach the renderer via resolveChartTypeOptions.
function bpc(type: string, options: string): string {
  return `chart ${type} {
${options}
  data {
    series = "A","B"
    "Alpha" = 10,5
    "Beta" = 20,7
  }
}`
}

describe('bar-split honours its horizontal axis options', () => {
  let container: HTMLElement
  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  it('draws nothing extra by default', () => {
    renderBpc(container, bpc('bar-split', ''))
    expect(container.querySelectorAll('.bc-grid-line')).toHaveLength(0)
    expect(container.querySelectorAll('.bc-axis-horizontal .domain')).toHaveLength(0)
    expect(container.querySelectorAll('.bc-axis-horizontal .tick line')).toHaveLength(0)
  })

  it('draws one axis per panel when the axis is turned on', () => {
    renderBpc(container, bpc('bar-split', '  showHorizontalAxis = true'))
    expect(container.querySelectorAll('.bc-axis-horizontal')).toHaveLength(2)
    expect(container.querySelectorAll('.bc-axis-horizontal .domain')).toHaveLength(2)
  })

  // A panel is narrower than a full plot, so it carries fewer ticks than
  // bar-horizontal does; what matters is that no panel is left without a grid.
  it('draws grid lines in every panel, like bar-horizontal does', () => {
    const options = '  showHorizontalAxis = true\n  showHorizontalTicks = true\n  horizontalGridStyle = "solid"'
    renderBpc(container, bpc('bar-split', options))
    const perPanel = [...container.querySelectorAll('.bc-axis-horizontal')]
      .map(axis => axis.querySelectorAll('.bc-grid-line').length)

    const twin = document.createElement('div')
    document.body.appendChild(twin)
    renderBpc(twin, bpc('bar-horizontal', options))

    expect(twin.querySelectorAll('.bc-grid-line').length).toBeGreaterThan(0)
    expect(perPanel).toHaveLength(2)
    expect(perPanel.every(count => count > 1)).toBe(true)
  })

  it('draws tick marks when ticks are turned on', () => {
    renderBpc(container, bpc('bar-split', '  showHorizontalAxis = true\n  showHorizontalTicks = true'))
    expect(container.querySelectorAll('.bc-axis-horizontal .tick line').length).toBeGreaterThan(0)
  })

  it('draws value numbers when the labels are turned on', () => {
    renderBpc(container, bpc('bar-split', '  horizontalLabelPosition = "outside"'))
    const numbers = [...container.querySelectorAll('.bc-axis-horizontal .tick text')].map(t => t.textContent)
    expect(numbers.filter(Boolean).length).toBeGreaterThan(0)
  })

  it('keeps the axis numbers inside the SVG', () => {
    renderBpc(container, bpc('bar-split', '  horizontalLabelPosition = "outside"'))
    const svg = container.querySelector('svg')!
    const [, , mTop] = /translate\(([-\d.]+),([-\d.]+)\)/.exec(svg.querySelector('g')!.getAttribute('transform')!)!
    const axes = [...container.querySelectorAll('.bc-axis-horizontal')]
    expect(axes.length).toBeGreaterThan(0)
    for (const axis of axes) {
      const [, , axisY] = /translate\(([-\d.]+),([-\d.]+)\)/.exec(axis.getAttribute('transform')!)!
      for (const tick of axis.querySelectorAll('.tick text')) {
        const baseline = Number(mTop) + Number(axisY) + Number(tick.getAttribute('y'))
        expect(baseline, `baseline of "${tick.textContent}"`).toBeLessThanOrEqual(Number(svg.getAttribute('height')))
      }
    }
  })
})
