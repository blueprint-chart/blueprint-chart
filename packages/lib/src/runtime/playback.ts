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
}

function readSceneDuration(raw: unknown): number {
  if (raw === '' || raw === null || raw === undefined) {
    return DEFAULT_SCENE_DURATION
  }
  const value = Number(raw)
  const inRange = value >= SCENE_DURATION_MIN && value <= SCENE_DURATION_MAX
  return inRange ? value : DEFAULT_SCENE_DURATION
}

export function readPlaybackSettings(properties: ReadonlyMap<string, unknown>): PlaybackSettings {
  const autoplay = toBool(properties.get('autoplay'))
  const loop = toBool(properties.get('loop'))
  const sceneDuration = readSceneDuration(properties.get('sceneDuration'))
  return { autoplay, sceneDuration, loop }
}

export function createPlayback(options: PlaybackOptions): Playback {
  let playing = false
  let timer: ReturnType<typeof setTimeout> | undefined

  function stop() {
    if (!playing) {
      return
    }
    playing = false
    clearTimeout(timer)
    options.onChange(false)
  }

  function schedule() {
    const delay = options.settings().sceneDuration * 1000
    timer = setTimeout(tick, delay)
  }

  function tick() {
    const current = options.current()
    if (current < options.total()) {
      options.go(current + 1)
    }
    else if (options.settings().loop) {
      options.go(1)
    }
    else {
      stop()
      return
    }
    schedule()
  }

  function play() {
    if (playing) {
      return
    }
    playing = true
    options.onChange(true)
    options.go(1)
    schedule()
  }

  return { play, stop }
}

export function onceVisible(target: Element, callback: () => void): () => void {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.5)
    if (!visible) {
      return
    }
    observer.disconnect()
    callback()
  }, { threshold: 0.5 })
  observer.observe(target)
  return () => observer.disconnect()
}
