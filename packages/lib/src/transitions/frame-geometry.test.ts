import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getSceneTransition } from './scene-transition'
import { tweenFrameGeometry } from './frame-geometry'

const SVG_NS = 'http://www.w3.org/2000/svg'

function setup() {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement
  const g = document.createElementNS(SVG_NS, 'g') as SVGGElement
  g.setAttribute('transform', 'translate(10,10)')
  const rect = document.createElementNS(SVG_NS, 'rect') as SVGRectElement
  rect.setAttribute('width', '100')
  rect.setAttribute('height', '100')
  svg.appendChild(g)
  svg.appendChild(rect)
  container.appendChild(svg)
  return { container, g, rect, t: getSceneTransition(container) }
}

describe('tweenFrameGeometry', () => {
  let env: ReturnType<typeof setup>
  beforeEach(() => { env = setup() })
  afterEach(() => { env.container.remove() })

  it('snaps group transform + clip to `to` on the duration:0 path', () => {
    env.t.beginCommit()
    tweenFrameGeometry(env.t, {
      group: env.g, clipRect: env.rect,
      from: { left: 10, top: 10, width: 100, height: 100 },
      to: { left: 20, top: 40, width: 100, height: 70 },
    })
    env.t.commit({ duration: 0 })
    expect(env.g.getAttribute('transform')).toBe('translate(20,40)')
    expect(env.rect.getAttribute('height')).toBe('70')
  })

  it('eases group transform from `from` to `to` and settles on target', async () => {
    // The new render has already set the group to the NEW transform; the tween
    // must start it back at `from` and ease to `to`.
    env.g.setAttribute('transform', 'translate(20,40)')
    env.t.beginCommit()
    tweenFrameGeometry(env.t, {
      group: env.g, clipRect: env.rect,
      from: { left: 10, top: 10, width: 100, height: 100 },
      to: { left: 20, top: 40, width: 100, height: 70 },
    })
    env.t.commit({ duration: 200 })

    // Mid-transition: between from and to (top between 10 and 40).
    await new Promise(r => setTimeout(r, 90))
    const mid = env.g.getAttribute('transform')!
    const midTop = Number(mid.match(/translate\([\d.-]+,([\d.-]+)\)/)![1])
    expect(midTop).toBeGreaterThan(10)
    expect(midTop).toBeLessThan(40)

    // Settles on target.
    await new Promise(r => setTimeout(r, 250))
    expect(env.g.getAttribute('transform')).toBe('translate(20,40)')
    expect(env.rect.getAttribute('height')).toBe('70')
  })
})
