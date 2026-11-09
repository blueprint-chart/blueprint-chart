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
  if (typeof raw !== 'number') {
    return DEFAULT_SCENE_DURATION
  }
  const inRange = raw >= SCENE_DURATION_MIN && raw <= SCENE_DURATION_MAX
  return inRange ? raw : DEFAULT_SCENE_DURATION
}

export function readPlaybackSettings(properties: ReadonlyMap<string, unknown>): PlaybackSettings {
  const autoplay = toBool(properties.get('autoplay'))
  const loop = toBool(properties.get('loop'))
  const sceneDuration = readSceneDuration(properties.get('sceneDuration'))
  return { autoplay, sceneDuration, loop }
}

const POLL_MS = 100

export function createPlayback(options: PlaybackOptions): Playback {
  let playing = false
  let timer: ReturnType<typeof setInterval> | undefined
  let sceneStart = 0

  function stop() {
    if (!playing) {
      return
    }
    playing = false
    clearInterval(timer)
    options.onChange(false)
  }

  function goTo(step: number) {
    sceneStart = Date.now()
    options.go(step)
  }

  function tick() {
    const elapsed = Date.now() - sceneStart
    const due = options.settings().sceneDuration * 1000
    if (elapsed < due) {
      return
    }
    const current = options.current()
    if (current < options.total()) {
      goTo(current + 1)
    }
    else if (options.settings().loop) {
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
    timer = setInterval(tick, POLL_MS)
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
