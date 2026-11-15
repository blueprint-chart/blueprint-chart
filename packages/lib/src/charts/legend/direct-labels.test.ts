import { describe, expect, it } from 'vitest'
import { measureTextWidth } from '../text-measure'
import { spreadLabels } from '../plugins/arc-labels'
import {
  drawDirectLabel,
  layoutDirectLabels,
  spreadWrappedLabels,
  wantsDirectLabels,
} from './direct-labels'

describe('wantsDirectLabels', () => {
  it('keeps auto direct at or above 350 px', () => expect(wantsDirectLabels('auto', undefined, 350)).toBe(true))
  it('switches auto to legend under 350 px', () => expect(wantsDirectLabels('auto', undefined, 349)).toBe(false))
  it('keeps auto direct when width is unknown', () => expect(wantsDirectLabels('auto', undefined, 0)).toBe(true))
  it('keeps outside direct under 350 px', () => expect(wantsDirectLabels('outside', undefined, 200)).toBe(true))
  it('keeps true direct under 350 px', () => expect(wantsDirectLabels(true, undefined, 200)).toBe(true))
  it('switches auto to legend under 350 px even with the legend off by default', () => expect(wantsDirectLabels('auto', false, 200)).toBe(false))
  it('defers auto to an explicit legend', () => expect(wantsDirectLabels('auto', true, 800)).toBe(false))
  it('is off for empty string (DirectLabelMode.Off)/undefined/false', () => {
    expect(wantsDirectLabels('', undefined, 800)).toBe(false)
    expect(wantsDirectLabels(undefined, undefined, 800)).toBe(false)
    expect(wantsDirectLabels(false, undefined, 800)).toBe(false)
  })
})

describe('layoutDirectLabels', () => {
  it('returns zero width for no labels', () => expect(layoutDirectLabels([], 600)).toEqual({ lines: [], width: 0 }))
  it('keeps one line when width is unknown', () => {
    const name = 'First series with a long name'
    const { lines, width } = layoutDirectLabels([name], 0)
    expect(lines).toEqual([[name]])
    expect(width).toBe(measureTextWidth(name, 12) + 10)
  })
  it('wraps a long name within 25% of the width', () => {
    const { lines, width } = layoutDirectLabels(['First series with a long name', 'Third'], 400)
    expect(lines[0].length).toBeGreaterThanOrEqual(2)
    expect(lines[1]).toEqual(['Third'])
    expect(width).toBeLessThanOrEqual(400 * 0.25 + 10)
  })
  it('widens the column for a word longer than the cap', () => {
    const word = 'Supercalifragilisticexpialidocious'
    const { lines, width } = layoutDirectLabels([word], 200)
    expect(lines).toEqual([[word]])
    expect(width).toBe(measureTextWidth(word, 12) + 10)
  })
  it('keeps one line when 3 lines are not enough', () => {
    const name = 'aa bb cc dd ee ff gg hh ii jj kk ll mm nn oo pp'
    const { lines } = layoutDirectLabels([name], 120)
    expect(lines).toEqual([[name]])
  })
})

describe('spreadWrappedLabels', () => {
  it('matches spreadLabels with gap 14 for single-line labels', () => {
    expect(spreadWrappedLabels([50, 52, 54], [1, 1, 1], 0, 300)).toEqual(spreadLabels([50, 52, 54], 0, 300, 14))
  })
  it('keeps a 3-line label clear of its 1-line neighbours', () => {
    const ys = spreadWrappedLabels([100, 100, 100], [1, 3, 1], 0, 300)
    expect(ys[1] - ys[0]).toBeGreaterThanOrEqual((14 + 42) / 2)
    expect(ys[2] - ys[1]).toBeGreaterThanOrEqual((42 + 14) / 2)
  })
  it('keeps a tall first label inside the top bound', () => {
    const ys = spreadWrappedLabels([0, 150], [3, 1], 0, 300)
    expect(ys[0]).toBeGreaterThanOrEqual(14)
  })
  it('keeps a tall last label inside the bottom bound', () => {
    const ys = spreadWrappedLabels([150, 300], [1, 3], 0, 300)
    expect(ys[1]).toBeLessThanOrEqual(300 - 14)
  })
  it('keeps the order when labels are taller than the range', () => {
    const ys = spreadWrappedLabels([10, 20, 30, 40, 50, 60], [3, 3, 3, 3, 3, 3], 0, 100)
    const sorted = [...ys].sort((a, b) => a - b)
    expect(ys).toEqual(sorted)
  })
})

describe('drawDirectLabel', () => {
  it('draws one tspan per line, centred on y', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    svg.appendChild(g)
    drawDirectLabel(g, { series: 'A', lines: ['one', 'two', 'three'], x: 5, y: 100, color: 'red' })
    const text = g.querySelector('text.bc-direct-label')!
    expect(text.getAttribute('data-series')).toBe('A')
    expect(text.getAttribute('fill')).toBe('red')
    expect(text.getAttribute('font-size')).toBe('11px')
    expect([...text.querySelectorAll('tspan')].map(t => t.textContent?.trim())).toEqual(['one', 'two', 'three'])
    expect(text.textContent).toBe('one two three')
    expect(Number(text.getAttribute('y'))).toBe(100 - 14)
    expect([...text.querySelectorAll('tspan')].map(t => t.getAttribute('dy'))).toEqual(['0.35em', '14', '14'])
  })
})
