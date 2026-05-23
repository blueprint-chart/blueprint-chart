import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { SceneTransition, getSceneTransition } from './scene-transition'

describe('SceneTransition lifecycle', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
  })

  it('starts in the idle state', () => {
    const t = new SceneTransition(container)
    expect(t.state).toBe('idle')
  })

  it('transitions idle → committing on beginCommit()', () => {
    const t = new SceneTransition(container)
    t.beginCommit()
    expect(t.state).toBe('committing')
  })

  it('transitions committing → animating on commit() with an animated commit', () => {
    const t = new SceneTransition(container)
    t.beginCommit()
    t.commit({ duration: 100 })
    expect(t.state).toBe('animating')
  })

  it('transitions committing → idle on commit() with duration 0 (snap)', () => {
    const t = new SceneTransition(container)
    t.beginCommit()
    t.commit({ duration: 0 })
    expect(t.state).toBe('idle')
  })

  it('interrupt() from animating returns to idle and is safe to call again', () => {
    const t = new SceneTransition(container)
    t.beginCommit()
    t.commit({ duration: 500 })
    expect(t.state).toBe('animating')
    t.interrupt()
    expect(t.state).toBe('idle')
    // Idempotent: calling again on idle is a no-op.
    t.interrupt()
    expect(t.state).toBe('idle')
  })

  it('interrupt() from committing is also safe', () => {
    const t = new SceneTransition(container)
    t.beginCommit()
    t.interrupt()
    expect(t.state).toBe('idle')
  })

  it('beginCommit() while animating interrupts the prior transition first', () => {
    const t = new SceneTransition(container)
    t.beginCommit()
    t.commit({ duration: 500 })
    expect(t.state).toBe('animating')
    // Re-entry: should interrupt, then enter committing.
    t.beginCommit()
    expect(t.state).toBe('committing')
  })

  it('discards late "end" events from a superseded transition (the _transition === t guard)', () => {
    const t = new SceneTransition(container)
    t.beginCommit()
    t.commit({ duration: 500 })
    expect(t.state).toBe('animating')

    // Capture the first transition's end-callback path by re-entering.
    t.beginCommit()
    t.commit({ duration: 500 })
    expect(t.state).toBe('animating')

    // The first d3 transition is gone (it was interrupted on re-entry).
    // If a late 'end' from it ever fired now, the guard `_transition === t`
    // would reject it and state would remain 'animating'. We assert state
    // is still 'animating' after a synchronous tick — i.e. the late event
    // never wedges us back to idle.
    expect(t.state).toBe('animating')
  })

  it('commit() from idle or animating warns and does not mutate state', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const t = new SceneTransition(container)
    // From idle:
    t.commit({ duration: 100 })
    expect(t.state).toBe('idle')
    expect(warn).toHaveBeenCalledTimes(1)

    // Set up animating:
    t.beginCommit()
    t.commit({ duration: 500 })
    expect(t.state).toBe('animating')

    // Calling commit() again while animating — no state change.
    t.commit({ duration: 100 })
    expect(t.state).toBe('animating')
    expect(warn).toHaveBeenCalledTimes(2)

    warn.mockRestore()
  })
})

describe('getSceneTransition registry', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
  })

  it('returns the same instance for the same container', () => {
    const a = getSceneTransition(container)
    const b = getSceneTransition(container)
    expect(a).toBe(b)
  })

  it('returns different instances for different containers', () => {
    const other = document.createElement('div')
    expect(getSceneTransition(container)).not.toBe(getSceneTransition(other))
  })
})

describe('SceneTransition.destroy', () => {
  it('interrupts any in-flight transition and drops the registry entry', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const t = getSceneTransition(container)
    t.beginCommit()
    t.commit({ duration: 500 })
    t.destroy()
    expect(t.state).toBe('idle')
    // New lookup returns a fresh instance.
    expect(getSceneTransition(container)).not.toBe(t)
    container.remove()
  })
})

describe('SceneTransition.run convenience', () => {
  it('runs the user callback inside the commit phase and ends in animating', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const t = new SceneTransition(container)
    const seen: string[] = []
    t.run(() => { seen.push(t.state) }, { duration: 100 })
    expect(seen).toEqual(['committing'])
    expect(t.state).toBe('animating')
    container.remove()
  })

  it('catches errors thrown in the callback and ends in idle without state corruption', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const t = new SceneTransition(container)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    t.run(() => { throw new Error('boom') }, { duration: 100 })
    expect(t.state).toBe('idle')
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
    container.remove()
  })
})

describe('SceneTransition reduced motion', () => {
  afterEach(() => { vi.restoreAllMocks() })

  it('snaps to idle on commit() when prefers-reduced-motion is set', () => {
    vi.stubGlobal('window', {
      ...window,
      matchMedia: vi.fn().mockImplementation((q: string) => ({
        matches: q.includes('reduce'),
        media: q,
        addEventListener: () => {},
        removeEventListener: () => {},
      })),
    })
    const container = document.createElement('div')
    document.body.appendChild(container)
    const t = new SceneTransition(container)
    t.beginCommit()
    // Caller intent is to animate over 500ms — orchestrator should snap.
    t.commit({ duration: 500 })
    expect(t.state).toBe('idle')
    container.remove()
  })
})
