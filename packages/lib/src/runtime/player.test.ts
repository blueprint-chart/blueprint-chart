import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { mountScenePlayer } from './player'
import type { PlayerType } from './player'
import type { PlaybackSettings } from './playback'

class FakeObserver {
  static instances: FakeObserver[] = []
  connected = true
  disconnect = vi.fn(() => {
    this.connected = false
  })

  observe = vi.fn()
  constructor(public callback: IntersectionObserverCallback) {
    FakeObserver.instances.push(this)
  }

  reveal() {
    if (!this.connected) {
      return
    }
    const entry = { isIntersecting: true, intersectionRatio: 1 } as IntersectionObserverEntry
    this.callback([entry], this as unknown as IntersectionObserver)
  }
}

function reveal() {
  FakeObserver.instances.forEach(observer => observer.reveal())
}

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', () => ({ matches }))
}

function setup(type: PlayerType | 'none' = 'dot-stepper', total = 4, settings: Partial<PlaybackSettings> = {}) {
  const chart = document.createElement('div')
  chart.innerHTML = '<div class="bc-frame-footer"></div>'
  document.body.appendChild(chart)
  const onStep = vi.fn()
  const playback = { autoplay: false, sceneDuration: 3, loop: false, ...settings }
  mountScenePlayer(chart, { type, position: 'left', total, ...playback }, onStep)
  const root = chart.querySelector<HTMLElement>('[data-scene-player]')
  const next = () => chart.querySelector<HTMLButtonElement>('[aria-label="Next scene"]')!
  const dots = () => chart.querySelectorAll<HTMLButtonElement>('.bc-scene-player__dots__dot, .bc-scene-player__segments__segment')
  return { chart, onStep, root, next, dots }
}

beforeEach(() => {
  FakeObserver.instances = []
  vi.stubGlobal('IntersectionObserver', FakeObserver)
  stubReducedMotion(false)
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

const PLAYBACK_DEFAULTS = { autoplay: false, sceneDuration: 3, loop: false }

describe('mountScenePlayer navigation', () => {
  it('mounts into the frame footer without stepping', () => {
    const { chart, root, onStep } = setup()
    expect(root?.parentElement).toBe(chart.querySelector('.bc-frame-footer'))
    expect(onStep).not.toHaveBeenCalled()
  })

  it('steps forward on Next', () => {
    const { next, onStep } = setup()
    next().click()
    expect(onStep).toHaveBeenCalledWith(2)
  })

  it('disables Next at the last step', () => {
    const { next, onStep } = setup('dot-stepper', 2)
    next().click()
    onStep.mockClear()
    expect(next().disabled).toBe(true)
    next().click()
    expect(onStep).not.toHaveBeenCalled()
  })

  it.each(['dot-stepper', 'progress-bar'] as PlayerType[])('jumps to the clicked %s step', (type) => {
    const { dots, onStep } = setup(type)
    dots()[2].click()
    expect(onStep).toHaveBeenCalledWith(3)
  })

  it('ignores a click on the current dot', () => {
    const { dots, onStep } = setup()
    dots()[0].click()
    expect(onStep).not.toHaveBeenCalled()
  })

  it('keeps focus on Next after the step changes', () => {
    const { next } = setup()
    const button = next()
    button.focus()
    button.click()
    expect(document.activeElement).toBe(button)
    expect(button.isConnected).toBe(true)
  })

  it('moves focus to an enabled control when Next gets disabled', () => {
    const { next, root } = setup('dot-stepper', 2)
    const button = next()
    button.focus()
    button.click()
    expect(button.disabled).toBe(true)
    expect(root?.contains(document.activeElement)).toBe(true)
    expect((document.activeElement as HTMLButtonElement).disabled).toBe(false)
  })

  it.each(['buttons', 'dot-stepper', 'minimal-arrows'] as PlayerType[])('steps on %s Next whatever its label says', (type) => {
    const { next, onStep } = setup(type)
    const button = next()
    button.setAttribute('aria-label', 'Scène suivante')
    button.click()
    expect(onStep).toHaveBeenCalledWith(2)
  })

  it('keeps focus on Next when the step re-render rebuilds the frame', () => {
    const chart = document.createElement('div')
    chart.innerHTML = '<div class="bc-frame-footer"></div>'
    document.body.appendChild(chart)
    const rebuildFrame = () => chart.innerHTML = '<div class="bc-frame-footer"></div>'
    mountScenePlayer(chart, { type: 'dot-stepper', position: 'left', total: 4, ...PLAYBACK_DEFAULTS }, rebuildFrame)
    const button = chart.querySelector<HTMLButtonElement>('[aria-label="Next scene"]')!
    button.focus()
    button.click()
    expect(button.isConnected).toBe(true)
    expect(document.activeElement).toBe(button)
  })
})

describe('mountScenePlayer playback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  function playButton(chart: HTMLElement) {
    return chart.querySelector<HTMLButtonElement>('.bc-scene-player__play-btn')!
  }

  it('restarts at step 1, advances every 3 s, and stops after the last step', () => {
    const { chart, dots, onStep } = setup()
    dots()[2].click()
    onStep.mockClear()
    playButton(chart).click()
    expect(onStep.mock.calls).toEqual([[1]])
    vi.advanceTimersByTime(9000)
    expect(onStep.mock.calls).toEqual([[1], [2], [3], [4]])
    vi.advanceTimersByTime(3000)
    expect(playButton(chart).getAttribute('aria-label')).toBe('Play')
    vi.advanceTimersByTime(9000)
    expect(onStep).toHaveBeenCalledTimes(4)
  })

  it('pauses on the current step', () => {
    const { chart, onStep } = setup()
    playButton(chart).click()
    vi.advanceTimersByTime(3000)
    playButton(chart).click()
    onStep.mockClear()
    expect(playButton(chart).getAttribute('aria-label')).toBe('Play')
    vi.advanceTimersByTime(9000)
    expect(onStep).not.toHaveBeenCalled()
  })

  const label = (chart: HTMLElement) => playButton(chart).getAttribute('aria-label')

  it('plays at the chart pace', () => {
    const { chart, onStep } = setup('dot-stepper', 4, { sceneDuration: 5 })
    playButton(chart).click()
    expect(label(chart)).toBe('Pause')
    vi.advanceTimersByTime(4900)
    expect(onStep).not.toHaveBeenCalled()
    vi.advanceTimersByTime(100)
    expect(onStep.mock.calls).toEqual([[2]])
  })

  it('loops back to step 1 with loop', () => {
    const { chart, onStep } = setup('dot-stepper', 2, { loop: true })
    playButton(chart).click()
    vi.advanceTimersByTime(3000)
    expect(onStep).toHaveBeenLastCalledWith(2)
    vi.advanceTimersByTime(3000)
    expect(onStep).toHaveBeenLastCalledWith(1)
    expect(label(chart)).toBe('Pause')
  })

  it.each([
    ['Next', 'next'],
    ['Back', 'previous'],
    ['a dot', 'dot'],
  ])('stops playing when the reader clicks %s', (_label, control) => {
    const { chart, onStep, next, dots } = setup('dot-stepper', 4)
    playButton(chart).click()
    vi.advanceTimersByTime(3000)
    expect(onStep).toHaveBeenLastCalledWith(2)
    const targets: Record<string, () => HTMLElement> = {
      next,
      previous: () => chart.querySelector<HTMLElement>('[aria-label="Previous scene"]')!,
      dot: () => dots()[2],
    }
    targets[control]().click()
    onStep.mockClear()
    vi.advanceTimersByTime(9000)
    expect(onStep).not.toHaveBeenCalled()
    expect(label(chart)).toBe('Play')
  })

  it('autoplays once the chart is half visible', () => {
    const { chart, onStep } = setup('dot-stepper', 4, { autoplay: true })
    vi.advanceTimersByTime(3000)
    expect(onStep).not.toHaveBeenCalled()
    expect(label(chart)).toBe('Play')
    reveal()
    expect(label(chart)).toBe('Pause')
    vi.advanceTimersByTime(2900)
    expect(onStep).not.toHaveBeenCalled()
    vi.advanceTimersByTime(100)
    expect(onStep.mock.calls).toEqual([[2]])
  })

  it('does not autoplay with reduced motion, but Play still works', () => {
    stubReducedMotion(true)
    const { chart, onStep, dots } = setup('dot-stepper', 4, { autoplay: true })
    dots()[2].click()
    onStep.mockClear()
    reveal()
    vi.advanceTimersByTime(3000)
    expect(onStep).not.toHaveBeenCalled()
    playButton(chart).click()
    expect(onStep).toHaveBeenCalledWith(1)
    vi.advanceTimersByTime(3000)
    expect(onStep).toHaveBeenLastCalledWith(2)
  })

  it('does not autoplay after the reader already pressed Play', () => {
    const { chart, onStep } = setup('dot-stepper', 4, { autoplay: true })
    playButton(chart).click()
    playButton(chart).click()
    onStep.mockClear()
    reveal()
    vi.advanceTimersByTime(3000)
    expect(onStep).not.toHaveBeenCalled()
    expect(label(chart)).toBe('Play')
  })

  it('autoplays with player none, without mounting controls', () => {
    const { chart, onStep } = setup('none', 2, { autoplay: true })
    expect(chart.querySelector('[data-scene-player]')).toBeNull()
    vi.advanceTimersByTime(3000)
    expect(onStep).not.toHaveBeenCalled()
    reveal()
    vi.advanceTimersByTime(2900)
    expect(onStep).not.toHaveBeenCalled()
    vi.advanceTimersByTime(100)
    expect(onStep.mock.calls).toEqual([[2]])
    expect(chart.querySelector('[data-scene-player]')).toBeNull()
    onStep.mockClear()
    vi.advanceTimersByTime(3000)
    expect(onStep).not.toHaveBeenCalled()
    expect(chart.querySelector('[data-scene-player]')).toBeNull()
  })

  it('moves to the new footer when a scene re-render rebuilds it, and keeps playing', async () => {
    const { chart, root, onStep } = setup()
    playButton(chart).click()
    const frame = document.createElement('div')
    frame.innerHTML = '<div class="bc-frame-footer"></div>'
    chart.replaceChildren(frame)
    await Promise.resolve()
    expect(root?.parentElement).toBe(frame.querySelector('.bc-frame-footer'))
    vi.advanceTimersByTime(3000)
    expect(onStep).toHaveBeenLastCalledWith(2)
  })

  it('mounts nothing when the chart failed to render, then attaches once a footer appears', async () => {
    const chart = document.createElement('div')
    chart.innerHTML = '<div class="bc-error">Could not render</div>'
    document.body.appendChild(chart)
    expect(() => mountScenePlayer(chart, { type: 'buttons', position: 'left', total: 3, ...PLAYBACK_DEFAULTS }, vi.fn())).not.toThrow()
    expect(chart.querySelector('[data-scene-player]')).toBeNull()
    expect(chart.textContent).toBe('Could not render')
    chart.insertAdjacentHTML('beforeend', '<div class="bc-frame-footer"></div>')
    await Promise.resolve()
    expect(chart.querySelector('.bc-frame-footer [data-scene-player]')).not.toBeNull()
  })
})
