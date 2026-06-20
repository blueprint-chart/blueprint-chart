import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
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

describe('featureJoin during committing + animating', () => {
  let env: ReturnType<typeof setup>
  beforeEach(() => {
    env = setup()
  })
  afterEach(() => {
    env.container.remove()
  })

  it('snaps enter and exit when commit duration is 0', () => {
    // Initial paint (idle).
    featureJoin(env.t, {
      role: 'mark-per-category',
      parent: env.g,
      selector: '.bc-bar',
      data: [{ label: 'a', value: 10 }],
      key: d => d.label,
      insert: sel => sel.append('rect').attr('class', 'bc-bar'),
      attrs: d => ({ x: 0, y: 0, width: 40, height: d.value }),
    })

    env.t.beginCommit()
    featureJoin(env.t, {
      role: 'mark-per-category',
      parent: env.g,
      selector: '.bc-bar',
      data: [{ label: 'a', value: 99 }, { label: 'b', value: 20 }],
      key: d => d.label,
      insert: sel => sel.append('rect').attr('class', 'bc-bar'),
      attrs: d => ({ x: 0, y: 0, width: 40, height: d.value }),
    })
    env.t.commit({ duration: 0 })

    const rects = env.g.querySelectorAll('.bc-bar')
    expect(rects.length).toBe(2)
    expect(rects[0].getAttribute('height')).toBe('99')
    expect(rects[1].getAttribute('height')).toBe('20')
  })

  it('reads "from" attrs off live DOM before tweening (invariant I4)', async () => {
    // Paint at height=10 (idle path).
    featureJoin(env.t, {
      role: 'mark-per-category',
      parent: env.g,
      selector: '.bc-bar',
      data: [{ label: 'a', value: 10 }],
      key: d => d.label,
      insert: sel => sel.append('rect').attr('class', 'bc-bar'),
      attrs: d => ({ x: 0, y: 0, width: 40, height: d.value }),
    })
    const rect = env.g.querySelector('.bc-bar')!

    // Spy on the snapshot module so we can verify applyBuffered actually
    // calls it on the update node before tweening.
    const snapshotMod = await import('./snapshot')
    const spy = vi.spyOn(snapshotMod, 'snapshotLiveAttrs')

    env.t.beginCommit()
    featureJoin(env.t, {
      role: 'mark-per-category',
      parent: env.g,
      selector: '.bc-bar',
      data: [{ label: 'a', value: 99 }],
      key: d => d.label,
      insert: sel => sel.append('rect').attr('class', 'bc-bar'),
      attrs: d => ({ x: 0, y: 0, width: 40, height: d.value }),
    })
    env.t.commit({ duration: 500 })

    // The update path must have called snapshotLiveAttrs on the surviving
    // element with the attr names we're about to tween. This is the
    // load-bearing call for invariant I4.
    const updateCalls = spy.mock.calls.filter(call => call[0] === rect)
    expect(updateCalls.length).toBeGreaterThan(0)
    const namesArg = updateCalls[0][1]
    expect(namesArg).toEqual(expect.arrayContaining(['height']))

    spy.mockRestore()
  })

  it('removes exit nodes after the snap commit (duration 0)', () => {
    featureJoin(env.t, {
      role: 'mark-per-category',
      parent: env.g,
      selector: '.bc-bar',
      data: [{ label: 'a', value: 10 }, { label: 'b', value: 20 }],
      key: d => d.label,
      insert: sel => sel.append('rect').attr('class', 'bc-bar'),
      attrs: d => ({ x: 0, y: 0, width: 40, height: d.value }),
    })
    env.t.beginCommit()
    featureJoin(env.t, {
      role: 'mark-per-category',
      parent: env.g,
      selector: '.bc-bar',
      data: [{ label: 'a', value: 10 }],
      key: d => d.label,
      insert: sel => sel.append('rect').attr('class', 'bc-bar'),
      attrs: d => ({ x: 0, y: 0, width: 40, height: d.value }),
    })
    env.t.commit({ duration: 0 })
    const rects = env.g.querySelectorAll('.bc-bar')
    expect(rects.length).toBe(1)
    // Surviving rect bound to 'a'.
    expect(rects[0].getAttribute('height')).toBe('10')
  })

  it('tweens the `d` attribute point-wise (no fused digits mid-transition; ends on target)', async () => {
    const OLD = 'M0,367L10,300L10,367L0,367Z'
    const NEW = 'M0,263L10,200L10,263L0,263Z'
    const cfg = (d: string): FeatureJoinConfig<{ k: string }> => ({
      role: 'series-path',
      parent: env.g,
      selector: '.bc-area',
      data: [{ k: 'a' }],
      key: x => x.k,
      insert: sel => sel.append('path').attr('class', 'bc-area'),
      attrs: () => ({ d }),
    })
    // Idle paint at OLD.
    featureJoin(env.t, cfg(OLD))
    // Animated commit toward NEW.
    env.t.beginCommit()
    featureJoin(env.t, cfg(NEW))
    env.t.commit({ duration: 200 })

    // Mid-transition: a clean pairwise blend — never fused digits or NaN.
    await new Promise(r => setTimeout(r, 90))
    const mid = env.g.querySelector('.bc-area')!.getAttribute('d')!
    expect(mid).not.toMatch(/NaN/)
    expect(mid).not.toMatch(/\d{8,}/)

    // Settles exactly on the target.
    await new Promise(r => setTimeout(r, 250))
    expect(env.g.querySelector('.bc-area')!.getAttribute('d')).toBe(NEW)
  })
})

describe('featureJoin role tagging (Stage 7)', () => {
  let env: ReturnType<typeof setup>
  beforeEach(() => {
    env = setup()
  })
  afterEach(() => {
    env.container.remove()
  })

  it('stamps data-bc-role and data-bc-key on entered elements via the idle path', () => {
    featureJoin(env.t, {
      role: 'mark-per-category',
      parent: env.g,
      selector: '.bc-bar',
      data: [{ label: 'a', value: 10 }, { label: 'b', value: 20 }],
      key: d => d.label,
      insert: sel => sel.append('rect').attr('class', 'bc-bar'),
      attrs: d => ({ x: 0, y: 0, width: 40, height: d.value }),
    })
    const rects = env.g.querySelectorAll('.bc-bar')
    expect(rects.length).toBe(2)
    expect(rects[0].getAttribute('data-bc-role')).toBe('mark-per-category')
    expect(rects[0].getAttribute('data-bc-key')).toBe('a')
    expect(rects[1].getAttribute('data-bc-role')).toBe('mark-per-category')
    expect(rects[1].getAttribute('data-bc-key')).toBe('b')
  })

  it('stamps data-bc-role and data-bc-key on entered elements via the buffered path', () => {
    // Empty initial state; first featureJoin runs during committing.
    env.t.beginCommit()
    featureJoin(env.t, {
      role: 'mark-per-category',
      parent: env.g,
      selector: '.bc-bar',
      data: [{ label: 'a', value: 10 }, { label: 'b', value: 20 }],
      key: d => d.label,
      insert: sel => sel.append('rect').attr('class', 'bc-bar'),
      attrs: d => ({ x: 0, y: 0, width: 40, height: d.value }),
    })
    env.t.commit({ duration: 0 })
    const rects = env.g.querySelectorAll('.bc-bar')
    expect(rects.length).toBe(2)
    expect(rects[0].getAttribute('data-bc-role')).toBe('mark-per-category')
    expect(rects[0].getAttribute('data-bc-key')).toBe('a')
    expect(rects[1].getAttribute('data-bc-role')).toBe('mark-per-category')
    expect(rects[1].getAttribute('data-bc-key')).toBe('b')
  })
})
