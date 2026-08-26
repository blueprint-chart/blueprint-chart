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

function labelInk(container: HTMLElement, selector = '.bc-value-label'): Ink[] {
  const svg = container.querySelector('svg')!
  const [, mLeft, mTop] = /translate\(([-\d.]+),([-\d.]+)\)/.exec(svg.querySelector('g')!.getAttribute('transform')!)!
  return [...container.querySelectorAll(selector)].map((label) => {
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

// The plot clipPath is what hides marks outside the domain. A label caught by it
// is sliced without leaving any trace in the DOM or in getBoundingClientRect, so
// "20" paints as "0" and the maximum's label vanishes: the ink-box check below
// cannot see it, and this is the only assertion that can.
function expectNoLabelInsideAClip(container: HTMLElement): void {
  const labels = [...container.querySelectorAll('.bc-value-label')]
  expect(labels.length).toBeGreaterThan(0)
  for (const label of labels) {
    const clipped = label.closest('[clip-path]')
    expect(clipped?.getAttribute('clip-path') ?? null, `clip on "${label.textContent}"`).toBeNull()
  }
}

function expectEveryLabelVisible(container: HTMLElement, selector = '.bc-value-label'): void {
  const { width, height } = viewport(container)
  const ink = labelInk(container, selector)
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

describe('a line or area value label is never cut by the plot clip', () => {
  let container: HTMLElement
  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  it('line: the first, last and maximum labels survive', () => {
    renderBpc(container, `chart line {
  valueLabels = true
  data {
    "2018" = 20
    "2019" = 34
    "2020" = 28
  }
}`)
    expect(labelInk(container).map(l => l.text)).toEqual(['20', '34', '28'])
    expectNoLabelInsideAClip(container)
    expectEveryLabelVisible(container)
  })

  it('area: the first, last and maximum labels survive', () => {
    renderBpc(container, `chart area {
  valueLabels = true
  data {
    "2018" = 20
    "2019" = 34
    "2020" = 28
  }
}`)
    expect(labelInk(container).map(l => l.text)).toEqual(['20', '34', '28'])
    expectNoLabelInsideAClip(container)
    expectEveryLabelVisible(container)
  })

  it('line: a value the range excludes keeps a visible label', () => {
    renderBpc(container, `chart line {
  verticalRangeMax = 20
  valueLabels = true
  data {
    "2018" = 34
    "2019" = 12
  }
}`)
    expect(labelInk(container).map(l => l.text)).toEqual(['34', '12'])
    expectNoLabelInsideAClip(container)
    expectEveryLabelVisible(container)
  })

  it('line-multi: inside axis labels leave no room to overrun the left edge', () => {
    renderBpc(container, `chart line-multi {
  verticalLabelPosition = "inside"
  valueLabels = true
  data {
    series = "Revenue"
    "2018" = 1200000
    "2019" = 400000
  }
}`)
    expect(labelInk(container).map(l => l.text)).toEqual(['1200000', '400000'])
    expectNoLabelInsideAClip(container)
    expectEveryLabelVisible(container)
  })

  it('line-multi: the first, last and maximum labels survive', () => {
    renderBpc(container, `chart line-multi {
  valueLabels = true
  data {
    series = "Revenue","Cost"
    "2018" = 20,12
    "2019" = 34,18
    "2020" = 28,15
  }
}`)
    expect(labelInk(container).map(l => l.text).sort()).toEqual(['12', '15', '18', '20', '28', '34'])
    expectNoLabelInsideAClip(container)
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

describe('bar-multi stacks its two labels above the bar without clipping either', () => {
  let container: HTMLElement
  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  // #11: bar-multi defaults to direct labels (`directLabelling` auto, legend
  // off) and value labels on, so both sit above every bar. Nothing reserved
  // room for them, so the tallest bar's value label was cut by the SVG top.
  const MEDAL_COUNT = `chart bar-multi {
  title = "T"
  data {
    series = "Gold","Silver","Bronze"
    "USA" = 40,44,42
    "China" = 40,27,24
  }
}`

  it('keeps the tallest bar\'s value label whole', () => {
    renderBpc(container, MEDAL_COUNT)
    expect(labelInk(container).map(l => l.text)).toContain('44')
    expectEveryLabelVisible(container)
  })

  it('keeps every direct label whole', () => {
    renderBpc(container, MEDAL_COUNT)
    expect(labelInk(container, '.bc-direct-label').map(l => l.text)).toContain('Silver')
    expectEveryLabelVisible(container, '.bc-direct-label')
  })

  it('leaves the value label clear of the direct label on the same bar', () => {
    renderBpc(container, MEDAL_COUNT)
    const values = labelInk(container)
    const directs = labelInk(container, '.bc-direct-label')
    for (const value of values) {
      for (const direct of directs) {
        const sameColumn = Math.abs((value.left + value.right) / 2 - (direct.left + direct.right) / 2) < 1
        if (sameColumn) {
          expect(value.bottom, `"${value.text}" over "${direct.text}"`).toBeLessThanOrEqual(direct.top)
        }
      }
    }
  })
})
