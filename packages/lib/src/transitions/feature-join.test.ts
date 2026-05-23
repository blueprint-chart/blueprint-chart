import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { SceneTransition } from './scene-transition'
import { featureJoin } from './feature-join'
import type { FeatureJoinConfig } from './types'

const SVG_NS = 'http://www.w3.org/2000/svg'

interface Bar { label: string, value: number }

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

describe('featureJoin in idle state', () => {
  let env: ReturnType<typeof setup>
  beforeEach(() => {
    env = setup()
  })
  afterEach(() => {
    env.container.remove()
  })

  it('appends elements for new data and sets attrs(d) directly', () => {
    const data: Bar[] = [
      { label: 'a', value: 10 },
      { label: 'b', value: 20 },
    ]
    featureJoin(env.t, {
      role: 'mark-per-category',
      parent: env.g,
      selector: '.bc-bar',
      data,
      key: d => d.label,
      insert: sel => sel.append('rect').attr('class', 'bc-bar'),
      attrs: d => ({ x: d.label === 'a' ? 0 : 50, y: 0, width: 40, height: d.value }),
    })
    const rects = env.g.querySelectorAll('.bc-bar')
    expect(rects.length).toBe(2)
    expect(rects[0].getAttribute('x')).toBe('0')
    expect(rects[0].getAttribute('height')).toBe('10')
    expect(rects[1].getAttribute('x')).toBe('50')
    expect(rects[1].getAttribute('height')).toBe('20')
  })

  it('updates existing elements (matched by key) when called twice', () => {
    const cfg = (data: Bar[]): FeatureJoinConfig<Bar> => ({
      role: 'mark-per-category',
      parent: env.g,
      selector: '.bc-bar',
      data,
      key: d => d.label,
      insert: sel => sel.append('rect').attr('class', 'bc-bar'),
      attrs: d => ({ x: 0, y: 0, width: 40, height: d.value }),
    })
    featureJoin(env.t, cfg([{ label: 'a', value: 10 }]))
    featureJoin(env.t, cfg([{ label: 'a', value: 99 }]))
    const rects = env.g.querySelectorAll('.bc-bar')
    expect(rects.length).toBe(1)
    expect(rects[0].getAttribute('height')).toBe('99')
  })

  it('removes elements whose keys are no longer in the data and preserves identity of survivors', () => {
    const cfg = (data: Bar[]): FeatureJoinConfig<Bar> => ({
      role: 'mark-per-category' as const,
      parent: env.g,
      selector: '.bc-bar',
      data,
      key: (d: Bar) => d.label,
      insert: sel => sel.append('rect').attr('class', 'bc-bar'),
      attrs: (d: Bar) => ({ x: 0, y: 0, width: 40, height: d.value }),
    })
    featureJoin(env.t, cfg([{ label: 'a', value: 10 }, { label: 'b', value: 20 }]))
    const firstA = env.g.querySelector<SVGRectElement>('.bc-bar[height="10"]')
    expect(firstA).not.toBeNull()

    featureJoin(env.t, cfg([{ label: 'a', value: 10 }]))
    const rects = env.g.querySelectorAll('.bc-bar')
    expect(rects.length).toBe(1)
    // Surviving 'a' element is the same DOM node (matched by __data__ key, not re-created).
    expect(rects[0]).toBe(firstA)
    expect(rects[0].getAttribute('height')).toBe('10')
  })
})
