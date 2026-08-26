import { describe, it, expect, beforeEach } from 'vitest'
import { renderBpc } from '../../../render/render-bpc'

// #39: bar-split gave its panel headers no truncation and its value labels no
// panel bound, so past ~9 series the headers ran together as one string, the
// last one fell off the canvas, and adjacent panels' numbers collided with
// each other and with the category labels.
const GENEROUS_GLYPH_PX = 7
const INK_HEIGHT_PX = 8

interface Box {
  text: string
  left: number
  right: number
  top: number
  bottom: number
}

function translateX(el: Element | null): number {
  const match = /translate\(([-\d.]+)/.exec(el?.getAttribute('transform') ?? '')
  return match ? Number(match[1]) : 0
}

// An axis tick carries its row's y on its own group, not on the text, so a box
// built from the text alone sits at y=0 and collides with nothing.
function translateY(el: Element | null): number {
  const match = /translate\([-\d.]+,\s*([-\d.]+)\)/.exec(el?.getAttribute('transform') ?? '')
  return match ? Number(match[1]) : 0
}

function boxes(container: HTMLElement, selector: string): Box[] {
  const plot = container.querySelector('svg > g')
  const anchorFallback = selector.includes('tick') ? 'end' : 'start'
  return [...container.querySelectorAll(selector)].map((el) => {
    const text = el.textContent ?? ''
    const width = text.length * GENEROUS_GLYPH_PX
    const parentOffset = el.closest('.bc-axis-vertical') ? translateX(el.closest('.bc-axis-vertical')) : 0
    const x = translateX(plot) + parentOffset + Number(el.getAttribute('x') ?? 0)
    const y = Number(el.getAttribute('y') ?? 0) + translateY(el.closest('.tick'))
    const anchor = el.getAttribute('text-anchor') ?? anchorFallback
    const left = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x
    return { text, left, right: left + width, top: y - INK_HEIGHT_PX / 2, bottom: y + INK_HEIGHT_PX / 2 }
  })
}

function intersects(a: Box, b: Box): boolean {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
}

function twelveSeries(): string {
  const names = Array.from({ length: 12 }, (_, i) => `"Series ${i + 1}"`).join(',')
  const row = (base: number) => Array.from({ length: 12 }, (_, i) => base + i).join(',')
  return `chart bar-split {
  data {
    series = ${names}
    "North" = ${row(11)}
    "South" = ${row(20)}
  }
}`
}

describe('bar-split keeps its panels legible as the series count grows', () => {
  let container: HTMLElement
  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  it('paints no panel header outside the SVG', () => {
    renderBpc(container, twelveSeries())
    const width = Number(container.querySelector('svg')!.getAttribute('width'))
    const headers = boxes(container, '.bc-split-header')
    expect(headers).toHaveLength(12)
    for (const header of headers) {
      expect(header.left, `left edge of "${header.text}"`).toBeGreaterThanOrEqual(0)
      expect(header.right, `right edge of "${header.text}"`).toBeLessThanOrEqual(width)
    }
  })

  it('leaves a gap between neighbouring panel headers', () => {
    renderBpc(container, twelveSeries())
    const headers = boxes(container, '.bc-split-header')
    for (let i = 1; i < headers.length; i++) {
      expect(headers[i].left, `"${headers[i - 1].text}" then "${headers[i].text}"`)
        .toBeGreaterThanOrEqual(headers[i - 1].right)
    }
  })

  it('never lets two value labels overlap', () => {
    renderBpc(container, twelveSeries())
    const labels = boxes(container, '.bc-value-label')
    const collisions: string[] = []
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        if (intersects(labels[i], labels[j])) {
          collisions.push(`"${labels[i].text}" and "${labels[j].text}"`)
        }
      }
    }
    expect(collisions).toEqual([])
  })

  it('never lets a value label reach the category labels', () => {
    renderBpc(container, twelveSeries())
    const labels = boxes(container, '.bc-value-label')
    const categories = boxes(container, '.bc-axis-vertical .tick text')
    expect(categories.map(c => c.text)).toEqual(['North', 'South'])
    const collisions: string[] = []
    for (const label of labels) {
      for (const category of categories) {
        if (intersects(label, category)) {
          collisions.push(`"${label.text}" over "${category.text}"`)
        }
      }
      if (label.left < 0) {
        collisions.push(`"${label.text}" left of the plot`)
      }
    }
    expect(collisions).toEqual([])
  })

  it('leaves a header that fits alone', () => {
    renderBpc(container, `chart bar-split {
  data {
    series = "Poll","High","Low"
    "CDU" = 29,32,27
    "SPD" = 14,16,12
  }
}`)
    expect([...container.querySelectorAll('.bc-split-header')].map(h => h.textContent))
      .toEqual(['Poll', 'High', 'Low'])
  })
})
