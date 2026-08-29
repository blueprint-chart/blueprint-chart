import { describe, it, expect, afterEach } from 'vitest'
import { computeLinearDomain } from './scale-helpers'
import { parse } from '../dsl/parser'
import { astToDefinition } from '../render/ast-to-definition'
import { renderChart } from '../render/render-chart'

afterEach(() => {
  document.body.innerHTML = ''
})

const VALUES = [980, 1010, 995]

function verticalTicks(type: string, body?: string): number[] {
  const host = document.createElement('div')
  document.body.appendChild(host)
  renderChart(host, astToDefinition(parse(`chart ${type} {
  data {
${body ?? `    "2018" = 980
    "2019" = 1010
    "2020" = 995`}
  }
}`)))
  return [...host.querySelectorAll('.bc-axis-vertical .tick text')]
    .map(t => Number((t.textContent ?? '').replace(/[^\d.-]/g, '')))
    .filter(Number.isFinite)
}

describe('zero-baseline policy follows the defaults matrix (#143)', () => {
  it('anchors at zero by default, which is the bar and area rule', () => {
    expect(computeLinearDomain(VALUES)[0]).toBe(0)
  })

  it('fits the data when the caller opts out', () => {
    expect(computeLinearDomain(VALUES, undefined, undefined, false)[0]).toBeGreaterThan(0)
  })

  it('still honours an explicit range over the opt-out', () => {
    expect(computeLinearDomain(VALUES, { min: '0' }, undefined, false)[0]).toBe(0)
  })

  it('lets a line chart fit its data instead of anchoring at zero', () => {
    expect(Math.min(...verticalTicks('line'))).toBeGreaterThan(0)
  })

  it('lets a multi-series line chart fit its data too', () => {
    const multi = `    series = "China","India"
    "2018" = 980,1200
    "2019" = 1010,1240
    "2020" = 995,1215`
    expect(Math.min(...verticalTicks('line-multi', multi))).toBeGreaterThan(0)
  })

  it('leaves area anchored at zero', () => {
    expect(Math.min(...verticalTicks('area'))).toBe(0)
  })
})
