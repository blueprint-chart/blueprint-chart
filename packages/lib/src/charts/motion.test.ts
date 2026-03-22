import { describe, it, expect, vi, afterEach } from 'vitest'
import { getTransitionDuration, getDefaultTransitionMs, DEFAULT_TRANSITION_MS, fadeIn, snapshotForFadeOut, commitFadeOut } from './motion'

describe('getTransitionDuration', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the input duration when no motion preference is set', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
    })
    expect(getTransitionDuration(200)).toBe(200)
  })

  it('returns 0 when prefers-reduced-motion: reduce is active', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockReturnValue({ matches: true }),
    })
    expect(getTransitionDuration(200)).toBe(0)
  })

  it('returns the input duration when window is undefined (SSR)', () => {
    const orig = globalThis.window
    // @ts-expect-error -- simulate SSR
    delete globalThis.window
    expect(getTransitionDuration(300)).toBe(300)
    globalThis.window = orig
  })

  it('queries the correct media query string', () => {
    const matchMediaSpy = vi.fn().mockReturnValue({ matches: false })
    vi.stubGlobal('window', { matchMedia: matchMediaSpy })
    getTransitionDuration(100)
    expect(matchMediaSpy).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
  })
})

describe('DEFAULT_TRANSITION_MS', () => {
  it('equals 500', () => {
    expect(DEFAULT_TRANSITION_MS).toBe(500)
  })
})

describe('getDefaultTransitionMs', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 500 when no motion preference is set', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
    })
    expect(getDefaultTransitionMs()).toBe(500)
  })

  it('returns 0 when prefers-reduced-motion: reduce is active', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockReturnValue({ matches: true }),
    })
    expect(getDefaultTransitionMs()).toBe(0)
  })
})

describe('fadeIn', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls element.animate with opacity keyframes', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
    })
    const el = { animate: vi.fn() }
    fadeIn(el as unknown as Element)
    expect(el.animate).toHaveBeenCalledWith(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 500, easing: 'ease-in-out' },
    )
  })

  it('uses custom duration when provided', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
    })
    const el = { animate: vi.fn() }
    fadeIn(el as unknown as Element, 300)
    expect(el.animate).toHaveBeenCalledWith(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 300, easing: 'ease-in-out' },
    )
  })

  it('skips animation when prefers-reduced-motion is active', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockReturnValue({ matches: true }),
    })
    const el = { animate: vi.fn() }
    fadeIn(el as unknown as Element)
    expect(el.animate).not.toHaveBeenCalled()
  })

  it('skips animation when element lacks animate method', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
    })
    const el = {} as Element
    expect(() => fadeIn(el)).not.toThrow()
  })
})

describe('snapshotForFadeOut', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('clones children into an overlay element', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
    })
    const container = document.createElement('div')
    const child = document.createElement('span')
    child.textContent = 'hello'
    container.appendChild(child)

    const overlay = snapshotForFadeOut(container)

    expect(overlay).not.toBeNull()
    expect(overlay!.style.position).toBe('absolute')
    expect(overlay!.style.pointerEvents).toBe('none')
    // Overlay contains a clone, not the original
    expect(overlay!.querySelector('span')!.textContent).toBe('hello')
    // Original child is still in the container (not moved)
    expect(container.contains(child)).toBe(true)
  })

  it('returns null when container is empty', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
    })
    const container = document.createElement('div')
    expect(snapshotForFadeOut(container)).toBeNull()
  })

  it('returns null when prefers-reduced-motion is active', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockReturnValue({ matches: true }),
    })
    const container = document.createElement('div')
    container.appendChild(document.createElement('span'))
    expect(snapshotForFadeOut(container)).toBeNull()
  })

  it('strips bc-frame-footer and bc-frame-note from overlay to prevent duplicate teleported UI', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
    })
    const container = document.createElement('div')
    const frame = document.createElement('div')
    frame.className = 'bc-frame'
    const header = document.createElement('div')
    header.className = 'bc-frame-header'
    header.textContent = 'Title'
    const footer = document.createElement('div')
    footer.className = 'bc-frame-footer'
    footer.textContent = 'Blueprint Chart'
    const note = document.createElement('p')
    note.className = 'bc-frame-note'
    note.textContent = 'Source: X'
    frame.appendChild(header)
    frame.appendChild(footer)
    frame.appendChild(note)
    container.appendChild(frame)

    const overlay = snapshotForFadeOut(container)

    expect(overlay).not.toBeNull()
    // Header should be preserved in overlay
    expect(overlay!.querySelector('.bc-frame-header')).not.toBeNull()
    // Footer and note must be stripped so teleported player buttons don't appear twice
    expect(overlay!.querySelector('.bc-frame-footer')).toBeNull()
    expect(overlay!.querySelector('.bc-frame-note')).toBeNull()
  })
})

describe('commitFadeOut', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('appends overlay to container and starts fade-out animation', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
      getComputedStyle: vi.fn().mockReturnValue({ position: 'relative' }),
    })

    const animateMock = vi.fn().mockReturnValue({ onfinish: null })
    const origAnimate = HTMLElement.prototype.animate
    HTMLElement.prototype.animate = animateMock

    const container = document.createElement('div')
    const overlay = document.createElement('div')

    commitFadeOut(container, overlay)

    expect(container.contains(overlay)).toBe(true)
    expect(animateMock).toHaveBeenCalledWith(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: 500, easing: 'ease-in-out' },
    )

    HTMLElement.prototype.animate = origAnimate
  })

  it('removes overlay immediately when animate is not available', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
      getComputedStyle: vi.fn().mockReturnValue({ position: 'relative' }),
    })

    const container = document.createElement('div')
    const overlay = document.createElement('div')

    commitFadeOut(container, overlay)

    // JSDOM has no animate, so overlay is removed immediately
    expect(container.contains(overlay)).toBe(false)
  })
})
