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

  it.each([0, 0.5, 11, 'fast', ''])('falls back to 3 s for sceneDuration %s', (value) => {
    expect(readPlaybackSettings(new Map([['sceneDuration', value]])).sceneDuration).toBe(3)
  })

  it.each([1, 10, 2.5])('accepts the in-range duration %s', (value) => {
    expect(readPlaybackSettings(new Map([['sceneDuration', value]])).sceneDuration).toBe(value)
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

    emit(isIntersecting: boolean, intersectionRatio: number) {
      if (!this.connected) {
        return
      }
      const entry = { isIntersecting, intersectionRatio } as IntersectionObserverEntry
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
    expect(observer.options?.threshold).toBe(0.5)
    expect(observer.observe).toHaveBeenCalledWith(target)
    observer.emit(true, 0.2)
    expect(callback).not.toHaveBeenCalled()
    observer.emit(true, 0.6)
    observer.emit(true, 0.8)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(observer.disconnect).toHaveBeenCalled()
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
