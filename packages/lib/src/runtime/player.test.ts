import { describe, it, expect, vi, afterEach } from 'vitest'
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
})
