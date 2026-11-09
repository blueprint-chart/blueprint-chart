import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readPlaybackSettings, createPlayback, onceVisible } from './playback'
import type { PlaybackSettings } from './playback'

describe('readPlaybackSettings', () => {
  it('returns the defaults for an empty map', () => {
    expect(readPlaybackSettings(new Map())).toEqual({ autoplay: false, sceneDuration: 3, loop: false })
  })

  it('reads the three keys', () => {
    const map = new Map<string, unknown>([['autoplay', 'true'], ['sceneDuration', 5], ['loop', true]])
    expect(readPlaybackSettings(map)).toEqual({ autoplay: true, sceneDuration: 5, loop: true })
  })

  it.each([0, 0.5, 11, 'fast', '', '5', true])('falls back to 3 s for sceneDuration %s', (value) => {
    expect(readPlaybackSettings(new Map([['sceneDuration', value]])).sceneDuration).toBe(3)
  })

  it.each([1, 10, 2.5])('accepts the in-range duration %s', (value) => {
    expect(readPlaybackSettings(new Map([['sceneDuration', value]])).sceneDuration).toBe(value)
  })

  it('drops loop with player none', () => {
    const map = new Map<string, unknown>([['loop', true], ['player', 'none']])
    expect(readPlaybackSettings(map).loop).toBe(false)
  })
})

describe('createPlayback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function setup(total: number, overrides: Partial<PlaybackSettings> = {}) {
    const state = { total, current: 1 }
    const settings: PlaybackSettings = { autoplay: false, sceneDuration: 3, loop: false, ...overrides }
    const steps: number[] = []
    const changes: boolean[] = []
    const go = (step: number) => {
      steps.push(step)
      state.current = step
    }
    const playback = createPlayback({
      total: () => state.total,
      current: () => state.current,
      go,
      settings: () => settings,
      onChange: playing => changes.push(playing),
    })
    const setTotal = (value: number) => {
      state.total = value
    }
    return { playback, steps, changes, settings, setTotal }
  }

  it('goes to step 1 on play, then advances every sceneDuration seconds', () => {
    const { playback, steps } = setup(3, { sceneDuration: 5 })
    playback.play()
    expect(steps).toEqual([1])
    vi.advanceTimersByTime(4999)
    expect(steps).toEqual([1])
    vi.advanceTimersByTime(1)
    expect(steps).toEqual([1, 2])
    vi.advanceTimersByTime(5000)
    expect(steps).toEqual([1, 2, 3])
  })

  it('stops on the last step without loop', () => {
    const { playback, steps, changes } = setup(2)
    playback.play()
    vi.advanceTimersByTime(3000)
    expect(steps).toEqual([1, 2])
    vi.advanceTimersByTime(3000)
    expect(steps).toEqual([1, 2])
    expect(changes).toEqual([true, false])
  })

  it('goes back to step 1 and keeps playing with loop', () => {
    const { playback, steps, changes } = setup(2, { loop: true })
    playback.play()
    vi.advanceTimersByTime(3000)
    expect(steps).toEqual([1, 2])
    vi.advanceTimersByTime(3000)
    expect(steps).toEqual([1, 2, 1])
    expect(changes).toEqual([true])
  })

  it('applies a new sceneDuration from the next scene', () => {
    const { playback, steps, settings } = setup(5)
    playback.play()
    vi.advanceTimersByTime(3000)
    expect(steps).toEqual([1, 2])
    settings.sceneDuration = 1
    playback.refresh()
    vi.advanceTimersByTime(1000)
    expect(steps).toEqual([1, 2, 3])
  })

  it('stops instead of stepping out of range when total shrinks', () => {
    const { playback, steps, changes, setTotal } = setup(4)
    playback.play()
    vi.advanceTimersByTime(6000)
    expect(steps).toEqual([1, 2, 3])
    setTotal(2)
    vi.advanceTimersByTime(3000)
    expect(steps).toEqual([1, 2, 3])
    expect(changes).toEqual([true, false])
  })

  it('goes back to step 1 and keeps playing when total shrinks with loop on', () => {
    const { playback, steps, changes, setTotal } = setup(4, { loop: true })
    playback.play()
    vi.advanceTimersByTime(6000)
    expect(steps).toEqual([1, 2, 3])
    setTotal(2)
    vi.advanceTimersByTime(3000)
    expect(steps).toEqual([1, 2, 3, 1])
    expect(changes).toEqual([true])
  })

  it('waits for a longer sceneDuration set during a scene', () => {
    const { playback, steps, settings } = setup(5)
    playback.play()
    settings.sceneDuration = 5
    vi.advanceTimersByTime(4999)
    expect(steps).toEqual([1])
    vi.advanceTimersByTime(1)
    expect(steps).toEqual([1, 2])
  })

  it('wakes up once per scene instead of polling', () => {
    const { playback } = setup(3)
    const start = Date.now()
    playback.play()
    vi.advanceTimersToNextTimer()
    expect(Date.now() - start).toBe(3000)
  })

  it('stops when only the base step is left, even with loop on', () => {
    const { playback, steps, changes, setTotal } = setup(2, { loop: true })
    playback.play()
    vi.advanceTimersByTime(3000)
    setTotal(1)
    vi.advanceTimersByTime(3000)
    expect(steps).toEqual([1, 2])
    expect(changes).toEqual([true, false])
  })

  it('ignores play while playing and stop while stopped', () => {
    const { playback, steps, changes } = setup(3)
    playback.stop()
    expect(changes).toEqual([])
    playback.play()
    playback.play()
    expect(steps).toEqual([1])
    playback.stop()
    playback.stop()
    expect(changes).toEqual([true, false])
  })
})

describe('onceVisible', () => {
  let observers: FakeObserver[]

  class FakeObserver {
    connected = true
    disconnect = vi.fn(() => {
      this.connected = false
    })

    observe = vi.fn()
    constructor(public callback: IntersectionObserverCallback, public options?: IntersectionObserverInit) {
      observers.push(this)
    }

    emit(isIntersecting: boolean, intersectionRatio: number, visibleHeight = 0, viewportHeight: number | null = 1000) {
      if (!this.connected) {
        return
      }
      const intersectionRect = { height: visibleHeight } as DOMRectReadOnly
      const rootBounds = viewportHeight === null ? null : { height: viewportHeight } as DOMRectReadOnly
      const entry = { isIntersecting, intersectionRatio, intersectionRect, rootBounds } as IntersectionObserverEntry
      this.callback([entry], this as unknown as IntersectionObserver)
    }
  }

  beforeEach(() => {
    observers = []
    vi.stubGlobal('IntersectionObserver', FakeObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('calls back once when half the target is visible, then disconnects', () => {
    const callback = vi.fn()
    const target = document.createElement('div')
    onceVisible(target, callback)
    const [observer] = observers
    expect(observer.observe).toHaveBeenCalledWith(target)
    observer.emit(true, 0.2)
    expect(callback).not.toHaveBeenCalled()
    observer.emit(true, 0.6)
    observer.emit(true, 0.8)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(observer.disconnect).toHaveBeenCalled()
  })

  it('calls back when a target taller than twice the viewport fills half of it', () => {
    const callback = vi.fn()
    onceVisible(document.createElement('div'), callback)
    const [observer] = observers
    observer.emit(true, 0.2, 280, 650)
    expect(callback).not.toHaveBeenCalled()
    observer.emit(true, 0.3, 420, 650)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('uses the screen height for a tall target in a sandboxed iframe', () => {
    vi.stubGlobal('innerHeight', 1400)
    vi.stubGlobal('screen', { height: 800 })
    const callback = vi.fn()
    onceVisible(document.createElement('div'), callback)
    const [observer] = observers
    observer.emit(true, 0.25, 350, null)
    expect(callback).not.toHaveBeenCalled()
    observer.emit(true, 0.3, 420, null)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('calls back right away without IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const callback = vi.fn()
    onceVisible(document.createElement('div'), callback)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('never calls back after the returned disconnect is called', () => {
    const callback = vi.fn()
    const target = document.createElement('div')
    const disconnect = onceVisible(target, callback)
    const [observer] = observers
    disconnect()
    expect(observer.disconnect).toHaveBeenCalled()
    observer.emit(true, 1)
    expect(callback).not.toHaveBeenCalled()
  })
})
