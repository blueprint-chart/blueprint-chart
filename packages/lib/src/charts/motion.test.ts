import { describe, it, expect, vi, afterEach } from 'vitest'
import { getTransitionDuration, getDefaultTransitionMs, DEFAULT_TRANSITION_MS } from './motion'

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
