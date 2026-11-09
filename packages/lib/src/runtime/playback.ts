import { toBool } from '../dsl/converter'

export const DEFAULT_SCENE_DURATION = 3
export const SCENE_DURATION_MIN = 1
export const SCENE_DURATION_MAX = 10

export interface PlaybackSettings {
  autoplay: boolean
  sceneDuration: number
  loop: boolean
}

export interface PlaybackOptions {
  total: () => number
  current: () => number
  go: (step: number) => void
  settings: () => PlaybackSettings
  onChange: (playing: boolean) => void
}

export interface Playback {
  play(): void
  stop(): void
  refresh(): void
}

function readSceneDuration(raw: unknown): number {
  if (typeof raw !== 'number') {
    return DEFAULT_SCENE_DURATION
  }
  const inRange = raw >= SCENE_DURATION_MIN && raw <= SCENE_DURATION_MAX
  return inRange ? raw : DEFAULT_SCENE_DURATION
}

export function readPlaybackSettings(properties: ReadonlyMap<string, unknown>): PlaybackSettings {
  const autoplay = toBool(properties.get('autoplay'))
  const hasPlayer = properties.get('player') !== 'none'
  const loop = toBool(properties.get('loop')) && hasPlayer
  const sceneDuration = readSceneDuration(properties.get('sceneDuration'))
  return { autoplay, sceneDuration, loop }
}

const VISIBILITY_THRESHOLDS = [0, 0.1, 0.2, 0.3, 0.4, 0.5]

export function createPlayback(options: PlaybackOptions): Playback {
  let playing = false
  let timer: ReturnType<typeof setTimeout> | undefined
  let sceneStart = 0

  function stop() {
    if (!playing) {
      return
    }
    playing = false
    clearTimeout(timer)
    options.onChange(false)
  }

  function refresh() {
    if (!playing) {
      return
    }
    clearTimeout(timer)
    const elapsed = Date.now() - sceneStart
    const due = options.settings().sceneDuration * 1000
    const remaining = Math.max(due - elapsed, 0)
    timer = setTimeout(tick, remaining)
  }

  function goTo(step: number) {
    sceneStart = Date.now()
    options.go(step)
    refresh()
  }

  function tick() {
    const elapsed = Date.now() - sceneStart
    const due = options.settings().sceneDuration * 1000
    if (elapsed < due) {
      refresh()
      return
    }
    const current = options.current()
    const total = options.total()
    if (current < total) {
      goTo(current + 1)
    }
    else if (options.settings().loop && total > 1) {
      goTo(1)
    }
    else {
      stop()
    }
  }

  function play() {
    if (playing) {
      return
    }
    playing = true
    options.onChange(true)
    goTo(1)
  }

  return { play, stop, refresh }
}

function isHalfVisible(entry: IntersectionObserverEntry): boolean {
  if (!entry.isIntersecting) {
    return false
  }
  if (entry.intersectionRatio >= 0.5) {
    return true
  }
  // A sandboxed embed gets no rootBounds, and its innerHeight is the chart's own height.
  const fallbackHeight = Math.min(window.innerHeight, window.screen.height)
  const viewportHeight = entry.rootBounds?.height ?? fallbackHeight
  return entry.intersectionRect.height >= viewportHeight / 2
}

export function onceVisible(target: Element, callback: () => void): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    callback()
    return () => {}
  }
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some(isHalfVisible)) {
      return
    }
    observer.disconnect()
    callback()
  }, { threshold: VISIBILITY_THRESHOLDS })
  observer.observe(target)
  return () => observer.disconnect()
}
