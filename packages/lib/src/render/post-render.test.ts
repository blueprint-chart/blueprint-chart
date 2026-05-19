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
})
