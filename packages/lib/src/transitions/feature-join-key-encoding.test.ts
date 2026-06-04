import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { SceneTransition } from './scene-transition'
import { featureJoin } from './feature-join'
import { roleScan } from './role-matcher'
import type { FeatureJoinConfig } from './types'

const SVG_NS = 'http://www.w3.org/2000/svg'

interface Cell { label: string, series: string, value: number }

function setup() {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement
  const g = document.createElementNS(SVG_NS, 'g') as SVGGElement
  svg.appendChild(g)
  container.appendChild(svg)
  const t = new SceneTransition(container)
  return { container, g, t }
}

// Multi-series chart types (bar-grouped, bar-stacked, line-multi, …) build
// composite keys as `label + '\u0000' + series`. NUL is forbidden in XML 1.0
// attribute values, so stamping the raw key into `data-bc-key` made every
// serialized grouped/stacked chart (sample thumbnails, SVG export) an
// invalid XML document. Regression for FINDING-001.
describe('featureJoin data-bc-key encoding', () => {
  let env: ReturnType<typeof setup>
  beforeEach(() => {
    env = setup()
  })
  afterEach(() => {
    env.container.remove()
  })

  const cfg = (data: Cell[]): FeatureJoinConfig<Cell> => ({
    role: 'mark-per-cell',
    parent: env.g,
    selector: '.bc-bar',
    data,
    key: d => d.label + '\u0000' + d.series,
    insert: sel => sel.append('rect').attr('class', 'bc-bar'),
    attrs: d => ({ x: 0, y: 0, width: 40, height: d.value }),
  })

  it('stamps data-bc-key without control characters for composite keys', () => {
    featureJoin(env.t, cfg([{ label: 'Q1 2024', series: 'Hardware', value: 10 }]))
    const key = env.g.querySelector('.bc-bar')!.getAttribute('data-bc-key')!
    // eslint-disable-next-line no-control-regex
    expect(key).not.toMatch(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/)
    expect(key).toBe('Q1 2024␟Hardware')
  })

  it('serializes to valid XML when the key contains a NUL separator', () => {
    featureJoin(env.t, cfg([{ label: 'Q1 2024', series: 'Hardware', value: 10 }]))
    const markup = new XMLSerializer().serializeToString(env.g.closest('svg')!)
    const reparsed = new DOMParser().parseFromString(markup, 'image/svg+xml')
    expect(reparsed.querySelector('parsererror')).toBeNull()
    expect(reparsed.querySelector('.bc-bar')).not.toBeNull()
  })

  it('preserves element identity across re-joins with NUL composite keys', () => {
    featureJoin(env.t, cfg([{ label: 'a', series: 's', value: 10 }]))
    const first = env.g.querySelector('.bc-bar')
    featureJoin(env.t, cfg([{ label: 'a', series: 's', value: 99 }]))
    const rects = env.g.querySelectorAll('.bc-bar')
    expect(rects.length).toBe(1)
    expect(rects[0]).toBe(first)
    expect(rects[0].getAttribute('height')).toBe('99')
  })

  it('roleScan indexes elements under the encoded key', () => {
    featureJoin(env.t, cfg([{ label: 'a', series: 's', value: 10 }]))
    const index = roleScan(env.container, 'mark-per-cell')
    expect(index.get('a␟s')).toBe(env.g.querySelector('.bc-bar'))
  })
})
