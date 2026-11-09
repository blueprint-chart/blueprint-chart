import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { mountScenePlayer } from './player'
import type { PlayerType } from './player'

function setup(type: PlayerType = 'dot-stepper', total = 4) {
  const chart = document.createElement('div')
  chart.innerHTML = '<div class="bc-frame-footer"></div>'
  document.body.appendChild(chart)
  const onStep = vi.fn()
  mountScenePlayer(chart, { type, position: 'left', total }, onStep)
  const root = chart.querySelector<HTMLElement>('[data-scene-player]')
  const next = () => chart.querySelector<HTMLButtonElement>('[aria-label="Next scene"]')!
  const dots = () => chart.querySelectorAll<HTMLButtonElement>('.bc-scene-player__dots__dot, .bc-scene-player__segments__segment')
  return { chart, onStep, root, next, dots }
}

afterEach(() => {
  document.body.innerHTML = ''
})

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
    mountScenePlayer(chart, { type: 'dot-stepper', position: 'left', total: 4 }, rebuildFrame)
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

  it('keeps playing after a manual jump', () => {
    const { chart, dots, onStep } = setup()
    playButton(chart).click()
    dots()[2].click()
    expect(onStep).toHaveBeenLastCalledWith(3)
    vi.advanceTimersByTime(3000)
    expect(onStep).toHaveBeenLastCalledWith(4)
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
    expect(() => mountScenePlayer(chart, { type: 'buttons', position: 'left', total: 3 }, vi.fn())).not.toThrow()
    expect(chart.querySelector('[data-scene-player]')).toBeNull()
    expect(chart.textContent).toBe('Could not render')
    chart.insertAdjacentHTML('beforeend', '<div class="bc-frame-footer"></div>')
    await Promise.resolve()
    expect(chart.querySelector('.bc-frame-footer [data-scene-player]')).not.toBeNull()
  })
})
