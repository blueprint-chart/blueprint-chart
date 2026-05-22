import { describe, it, expect, beforeEach } from 'vitest'
import { applyPostRender } from './post-render'

describe('applyPostRender', () => {
  let container: HTMLElement
  let frame: HTMLElement
  beforeEach(() => {
    container = document.createElement('div')
    frame = document.createElement('div')
    frame.classList.add('bc-frame')
    container.appendChild(frame)
  })

  it('adds theme class when theme is set', () => {
    applyPostRender(container, { theme: 'dark' }, { constrained: false })
    expect(frame.classList.contains('bc-theme-dark')).toBe(true)
  })

  it('replaces stale theme class', () => {
    frame.classList.add('bc-theme-light')
    applyPostRender(container, { theme: 'dark' }, { constrained: false })
    expect(frame.classList.contains('bc-theme-light')).toBe(false)
    expect(frame.classList.contains('bc-theme-dark')).toBe(true)
  })

  it('adds constrained class when layout was constrained', () => {
    applyPostRender(container, {}, { constrained: true })
    expect(frame.classList.contains('bc-frame--constrained')).toBe(true)
  })

  it('no-op when frame is missing', () => {
    const empty = document.createElement('div')
    expect(() => applyPostRender(empty, { theme: 'dark' }, { constrained: false })).not.toThrow()
  })

  // L6: scene 1 with no theme must clear scene 0's bc-theme-* class
  it('removes stale bc-theme-* classes when theme is omitted', () => {
    frame.classList.add('bc-theme-dark')
    applyPostRender(container, {}, { constrained: false })
    expect(frame.classList.contains('bc-theme-dark')).toBe(false)
    // sanity: no other bc-theme-* should remain either
    const remaining = Array.from(frame.classList).filter(c => c.startsWith('bc-theme-'))
    expect(remaining).toEqual([])
  })
})
