import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { snapshotIfTypeChanged, commitCrossTypeFade, clearCrossTypeMarker, cancelInflightFade } from './cross-type-fade'
import * as motion from '../charts/motion'

describe('cross-type-fade', () => {
  let container: HTMLElement
  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  it('returns null on first render (no prior type)', () => {
    const overlay = snapshotIfTypeChanged(container, 'bar-vertical', true)
    expect(overlay).toBeNull()
  })

  it('returns null when transition is false', () => {
    commitCrossTypeFade(container, 'bar-vertical', null)
    const overlay = snapshotIfTypeChanged(container, 'line', false)
    expect(overlay).toBeNull()
  })

  it('returns null when chart type unchanged', () => {
    commitCrossTypeFade(container, 'bar-vertical', null)
    container.appendChild(document.createElement('svg'))
    const overlay = snapshotIfTypeChanged(container, 'bar-vertical', true)
    expect(overlay).toBeNull()
  })

  it('returns overlay when chart type changes and transition is true', () => {
    commitCrossTypeFade(container, 'bar-vertical', null)
    container.appendChild(document.createElement('svg'))
    const overlay = snapshotIfTypeChanged(container, 'line', true)
    expect(overlay).not.toBeNull()
  })

  it('clearCrossTypeMarker removes the WeakMap entry', () => {
    commitCrossTypeFade(container, 'bar-vertical', null)
    clearCrossTypeMarker(container)
    container.appendChild(document.createElement('svg'))
    const overlay = snapshotIfTypeChanged(container, 'line', true)
    expect(overlay).toBeNull()
  })

  it('commitCrossTypeFade fades in the .bc-frame-body element, not the whole .bc-frame', () => {
    // Establish a prior chart type so the next render counts as cross-type.
    commitCrossTypeFade(container, 'bar-vertical', null)

    // Build a realistic new frame so commitCrossTypeFade has both a body and
    // a footer to choose between.
    const frame = document.createElement('div')
    frame.className = 'bc-frame'
    const body = document.createElement('div')
    body.className = 'bc-frame-body'
    const footer = document.createElement('div')
    footer.className = 'bc-frame-footer'
    frame.appendChild(body)
    frame.appendChild(footer)
    container.appendChild(frame)

    // Any non-null element works as the overlay argument — commitCrossTypeFade
    // hands it off to commitFadeOut, which we don't assert on here.
    const overlay = document.createElement('div')

    const fadeInSpy = vi.spyOn(motion, 'fadeIn').mockImplementation(() => {})
    try {
      commitCrossTypeFade(container, 'line', overlay)
      expect(fadeInSpy).toHaveBeenCalledTimes(1)
      const target = fadeInSpy.mock.calls[0][0] as Element
      expect(target.classList.contains('bc-frame-body')).toBe(true)
      expect(target.classList.contains('bc-frame-footer')).toBe(false)
    }
    finally {
      fadeInSpy.mockRestore()
    }
  })
})

describe('cross-type-fade: rapid re-trigger handling', () => {
  let container: HTMLElement
  let origAnimate: typeof HTMLElement.prototype.animate
  let cancelCalls: number

  beforeEach(() => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
      getComputedStyle: vi.fn().mockReturnValue({ position: 'relative' }),
    })
    container = document.createElement('div')
    document.body.appendChild(container)

    cancelCalls = 0
    // Stub WAAPI so each animated overlay reports a live, cancellable animation.
    origAnimate = HTMLElement.prototype.animate
    HTMLElement.prototype.animate = function () {
      const anim = {
        cancel: () => {
          cancelCalls++
        },
        onfinish: null as null | (() => void),
      }
      const list = (this as HTMLElement & { __anims?: typeof anim[] }).__anims ?? []
      list.push(anim)
      ;(this as HTMLElement & { __anims?: typeof anim[] }).__anims = list
      return anim as unknown as Animation
    } as typeof HTMLElement.prototype.animate
    // jsdom does not implement getAnimations — stub it to return what we tracked.
    Object.defineProperty(HTMLElement.prototype, 'getAnimations', {
      configurable: true,
      writable: true,
      value: function () {
        return (this as HTMLElement & { __anims?: { cancel: () => void }[] }).__anims ?? []
      },
    })
  })

  afterEach(() => {
    HTMLElement.prototype.animate = origAnimate
    // @ts-expect-error -- remove stub
    delete HTMLElement.prototype.getAnimations
    vi.restoreAllMocks()
  })

  function renderFrame(type: string): void {
    container.replaceChildren()
    const frame = document.createElement('div')
    frame.className = 'bc-frame'
    frame.textContent = type
    container.appendChild(frame)
  }

  it('mid-fade re-trigger: only one overlay exists, no nested overlays', () => {
    // First commit establishes the prior type, then we render type1.
    commitCrossTypeFade(container, 'bar-vertical', null)
    renderFrame('bar-vertical')

    // Transition 1: bar-vertical → line
    const overlay1 = snapshotIfTypeChanged(container, 'line', true)
    expect(overlay1).not.toBeNull()
    renderFrame('line')
    commitCrossTypeFade(container, 'line', overlay1)

    // Container now holds the new frame + the fading overlay1.
    expect(container.querySelectorAll('[data-bc-fade-overlay]').length).toBe(1)

    // Mid-fade: transition 2 fires before overlay1 finishes.
    const overlay2 = snapshotIfTypeChanged(container, 'pie', true)
    expect(overlay2).not.toBeNull()
    renderFrame('pie')
    commitCrossTypeFade(container, 'pie', overlay2)

    // Exactly one overlay in the container, and it has no nested overlays.
    const overlays = container.querySelectorAll('[data-bc-fade-overlay]')
    expect(overlays.length).toBe(1)
    expect(overlays[0].querySelectorAll('[data-bc-fade-overlay]').length).toBe(0)
    // The overlay holds exactly one fade-snapshot frame (the just-replaced
    // chart). Any value > 1 would mean a prior snapshot leaked through.
    expect(overlays[0].querySelectorAll('.bc-frame--fade-snapshot').length).toBe(1)
  })

  it('cancels the prior overlay\'s WAAPI animation before starting a new one', () => {
    commitCrossTypeFade(container, 'bar-vertical', null)
    renderFrame('bar-vertical')

    const overlay1 = snapshotIfTypeChanged(container, 'line', true)
    renderFrame('line')
    commitCrossTypeFade(container, 'line', overlay1)

    expect(cancelCalls).toBe(0)

    // Trigger the second fade mid-flight — the first overlay's animation
    // must be cancelled as part of the cleanup.
    const overlay2 = snapshotIfTypeChanged(container, 'pie', true)
    renderFrame('pie')
    commitCrossTypeFade(container, 'pie', overlay2)

    expect(cancelCalls).toBeGreaterThanOrEqual(1)
  })

  it('rapid commit: 5 sequential transitions never grow beyond one overlay', () => {
    commitCrossTypeFade(container, 't0', null)
    renderFrame('t0')

    const types = ['t1', 't2', 't3', 't4', 't5']
    for (const type of types) {
      const overlay = snapshotIfTypeChanged(container, type, true)
      renderFrame(type)
      commitCrossTypeFade(container, type, overlay)
      // After every commit there must be at most one overlay attached.
      expect(container.querySelectorAll('[data-bc-fade-overlay]').length).toBeLessThanOrEqual(1)
    }

    // Final state has exactly one overlay (the most recent fade) and one frame.
    expect(container.querySelectorAll('[data-bc-fade-overlay]').length).toBe(1)
    expect(container.querySelectorAll('.bc-frame').length).toBe(1)
  })

  it('cancelInflightFade removes overlays and cancels their animations', () => {
    commitCrossTypeFade(container, 'bar-vertical', null)
    renderFrame('bar-vertical')

    const overlay = snapshotIfTypeChanged(container, 'line', true)
    renderFrame('line')
    commitCrossTypeFade(container, 'line', overlay)

    expect(container.querySelectorAll('[data-bc-fade-overlay]').length).toBe(1)

    cancelInflightFade(container)

    expect(container.querySelectorAll('[data-bc-fade-overlay]').length).toBe(0)
    expect(cancelCalls).toBeGreaterThanOrEqual(1)
  })

  it('clearCrossTypeMarker also cancels any in-flight fade', () => {
    commitCrossTypeFade(container, 'bar-vertical', null)
    renderFrame('bar-vertical')

    const overlay = snapshotIfTypeChanged(container, 'line', true)
    renderFrame('line')
    commitCrossTypeFade(container, 'line', overlay)

    expect(container.querySelectorAll('[data-bc-fade-overlay]').length).toBe(1)

    clearCrossTypeMarker(container)

    expect(container.querySelectorAll('[data-bc-fade-overlay]').length).toBe(0)
    expect(cancelCalls).toBeGreaterThanOrEqual(1)
  })
})
