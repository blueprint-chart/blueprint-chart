import { describe, it, expect, beforeEach } from 'vitest'
import { renderBpc } from './render-bpc'

// A value label whose glyphs fall outside the SVG viewport is cut by the edge,
// and a cut number reads as a smaller one: 1200000 shown as 120000. Glyphs are
// measured at a deliberately generous 7px advance (the library's own estimates
// range from 6 to 6.5) so these assertions still hold where the real font is
// wider than the estimate that placed the label.
const GENEROUS_GLYPH_PX = 7
// Cap height of an 11px numeral: digits put no ink above it, and none below the
// baseline, so this is the label's real vertical extent.
const INK_HEIGHT_PX = 8

interface Ink {
  text: string
  left: number
  right: number
  top: number
  bottom: number
}

function labelInk(container: HTMLElement): Ink[] {
  const svg = container.querySelector('svg')!
  const [, mLeft, mTop] = /translate\(([-\d.]+),([-\d.]+)\)/.exec(svg.querySelector('g')!.getAttribute('transform')!)!
  return [...container.querySelectorAll('.bc-value-label')].map((label) => {
    const text = label.textContent ?? ''
    const width = text.length * GENEROUS_GLYPH_PX
    const x = Number(label.getAttribute('x')) + Number(mLeft)
    const y = Number(label.getAttribute('y')) + Number(mTop)
    const anchor = label.getAttribute('text-anchor')
    const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
    const baseline = label.getAttribute('dominant-baseline')
    const top = baseline === 'central'
      ? y - INK_HEIGHT_PX / 2
      : baseline === 'hanging' ? y : y - INK_HEIGHT_PX
    return { text, left, right: left + width, top, bottom: top + INK_HEIGHT_PX }
  })
}

function viewport(container: HTMLElement): { width: number, height: number } {
  const svg = container.querySelector('svg')!
  return { width: Number(svg.getAttribute('width')), height: Number(svg.getAttribute('height')) }
}

function expectEveryLabelVisible(container: HTMLElement): void {
  const { width, height } = viewport(container)
  const ink = labelInk(container)
  expect(ink.length).toBeGreaterThan(0)
  for (const box of ink) {
    expect(box.left, `left edge of "${box.text}"`).toBeGreaterThanOrEqual(0)
    expect(box.right, `right edge of "${box.text}"`).toBeLessThanOrEqual(width)
    expect(box.top, `top edge of "${box.text}"`).toBeGreaterThanOrEqual(0)
    expect(box.bottom, `bottom edge of "${box.text}"`).toBeLessThanOrEqual(height)
  }
}

describe('a value label never renders a number the SVG edge can cut', () => {
  let container: HTMLElement
  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  it('bar-horizontal: a bar reaching the axis maximum keeps its whole number', () => {
    renderBpc(container, `chart bar-horizontal {
  showHorizontalAxis = true
  valueLabels = true
  data {
    "A" = 1200000
  }
}`)
    expect(labelInk(container).map(l => l.text)).toEqual(['1200000'])
    expectEveryLabelVisible(container)
  })

  it('bar-horizontal: a value the range excludes keeps its whole number', () => {
    renderBpc(container, `chart bar-horizontal {
  horizontalRangeMax = 1000000
  valueLabels = true
  data {
    "A" = 1200000
    "B" = 400000
  }
}`)
    expect(labelInk(container).map(l => l.text)).toEqual(['1200000', '400000'])
    expectEveryLabelVisible(container)
  })

  it('bar-horizontal: a formatted label keeps its whole number', () => {
    renderBpc(container, `chart bar-horizontal {
  horizontalNumberFormat = "$|,|"
  valueLabels = true
  data {
    "A" = 1200000
  }
}`)
    expect(labelInk(container).map(l => l.text)).toEqual(['$1,200,000'])
    expectEveryLabelVisible(container)
  })

  it('bar-vertical: a value above the range keeps a visible label', () => {
    renderBpc(container, `chart bar-vertical {
  verticalRangeMax = 50
  valueLabels = true
  data {
    "A" = 63
    "B" = 20
  }
}`)
    expect(labelInk(container).map(l => l.text)).toEqual(['63', '20'])
    expectEveryLabelVisible(container)
  })

  it('bar-vertical: a value below the range keeps a visible label', () => {
    renderBpc(container, `chart bar-vertical {
  verticalRangeMin = 20
  valueLabels = true
  data {
    "A" = 17
    "B" = 40
  }
}`)
    expect(labelInk(container).map(l => l.text)).toEqual(['17', '40'])
    expectEveryLabelVisible(container)
  })
})

describe('the value axis keeps its labels on the canvas', () => {
  let container: HTMLElement
  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  // bar-horizontal registers horizontalLabelPosition as `off` and
  // showHorizontalAxis as `false` (registry.ts:340,366), so asking for the
  // labels without touching the axis toggle is the documented way in.
  it('bar-horizontal: outside value-axis labels sit inside the SVG', () => {
    renderBpc(container, `chart bar-horizontal {
  horizontalLabelPosition = "outside"
  data {
    "A" = 10
    "B" = 20
  }
}`)
    const svg = container.querySelector('svg')!
    const [, , mTop] = /translate\(([-\d.]+),([-\d.]+)\)/.exec(svg.querySelector('g')!.getAttribute('transform')!)!
    const axis = container.querySelector('.bc-axis-horizontal')!
    const [, , axisY] = /translate\(([-\d.]+),([-\d.]+)\)/.exec(axis.getAttribute('transform')!)!
    const ticks = [...axis.querySelectorAll('.tick text')]
    expect(ticks.length).toBeGreaterThan(0)
    for (const tick of ticks) {
      const baseline = Number(mTop) + Number(axisY) + Number(tick.getAttribute('y'))
      expect(baseline, `baseline of "${tick.textContent}"`).toBeLessThanOrEqual(Number(svg.getAttribute('height')))
    }
  })
})
