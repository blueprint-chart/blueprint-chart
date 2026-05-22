import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createSceneController } from './scenes'
import type { SceneDefinition } from './scenes'

describe('createSceneController', () => {
  let container: HTMLElement
  const scenes: SceneDefinition[] = [
    { name: 'Scene 1', data: { value: 1 } },
    { name: 'Scene 2', data: { value: 2 } },
    { name: 'Scene 3', data: { value: 3 } },
  ]

  beforeEach(() => {
    container = document.createElement('div')
    document.body.replaceChildren()
    document.body.appendChild(container)
  })

  it('creates navigation UI in the container', () => {
    const onChange = vi.fn()
    createSceneController(container, scenes, onChange)

    const nav = container.querySelector('.blueprint-chart-scenes')
    expect(nav).not.toBeNull()
    expect(nav?.querySelector('.blueprint-chart-scenes-prev')).not.toBeNull()
    expect(nav?.querySelector('.blueprint-chart-scenes-next')).not.toBeNull()
    expect(nav?.querySelector('.blueprint-chart-scenes-counter')).not.toBeNull()
  })

  it('displays the correct initial counter', () => {
    const onChange = vi.fn()
    createSceneController(container, scenes, onChange)

    const counter = container.querySelector('.blueprint-chart-scenes-counter')
    expect(counter?.textContent).toBe('1 / 3')
  })

  it('starts at scene 0', () => {
    const onChange = vi.fn()
    const ctrl = createSceneController(container, scenes, onChange)

    expect(ctrl.currentScene).toBe(0)
    expect(ctrl.totalScenes).toBe(3)
  })

  it('advances to the next scene', () => {
    const onChange = vi.fn()
    const ctrl = createSceneController(container, scenes, onChange)

    ctrl.next()
    expect(ctrl.currentScene).toBe(1)
    expect(onChange).toHaveBeenCalledWith(scenes[1], 1)
  })

  it('goes to the previous scene', () => {
    const onChange = vi.fn()
    const ctrl = createSceneController(container, scenes, onChange)

    ctrl.next()
    ctrl.previous()
    expect(ctrl.currentScene).toBe(0)
    expect(onChange).toHaveBeenLastCalledWith(scenes[0], 0)
  })

  it('wraps around from last to first scene', () => {
    const onChange = vi.fn()
    const ctrl = createSceneController(container, scenes, onChange)

    ctrl.goTo(2)
    ctrl.next()
    expect(ctrl.currentScene).toBe(0)
    expect(onChange).toHaveBeenLastCalledWith(scenes[0], 0)
  })

  it('wraps around from first to last scene', () => {
    const onChange = vi.fn()
    const ctrl = createSceneController(container, scenes, onChange)

    ctrl.previous()
    expect(ctrl.currentScene).toBe(2)
    expect(onChange).toHaveBeenLastCalledWith(scenes[2], 2)
  })

  it('goTo jumps to a specific scene', () => {
    const onChange = vi.fn()
    const ctrl = createSceneController(container, scenes, onChange)

    ctrl.goTo(2)
    expect(ctrl.currentScene).toBe(2)
    expect(onChange).toHaveBeenCalledWith(scenes[2], 2)

    const counter = container.querySelector('.blueprint-chart-scenes-counter')
    expect(counter?.textContent).toBe('3 / 3')
  })

  it('updates counter on navigation', () => {
    const onChange = vi.fn()
    const ctrl = createSceneController(container, scenes, onChange)

    ctrl.next()
    const counter = container.querySelector('.blueprint-chart-scenes-counter')
    expect(counter?.textContent).toBe('2 / 3')
  })

  it('destroy removes the navigation element', () => {
    const onChange = vi.fn()
    const ctrl = createSceneController(container, scenes, onChange)

    expect(container.querySelector('.blueprint-chart-scenes')).not.toBeNull()
    ctrl.destroy()
    expect(container.querySelector('.blueprint-chart-scenes')).toBeNull()
  })

  it('button clicks trigger navigation', () => {
    const onChange = vi.fn()
    createSceneController(container, scenes, onChange)

    const nextBtn = container.querySelector<HTMLButtonElement>('.blueprint-chart-scenes-next')!
    nextBtn.click()
    expect(onChange).toHaveBeenCalledWith(scenes[1], 1)

    const prevBtn = container.querySelector<HTMLButtonElement>('.blueprint-chart-scenes-prev')!
    prevBtn.click()
    expect(onChange).toHaveBeenLastCalledWith(scenes[0], 0)
  })

  it('goTo(NaN) is a no-op', () => {
    const onChange = vi.fn()
    const ctrl = createSceneController(container, scenes, onChange)

    ctrl.goTo(NaN)
    expect(ctrl.currentScene).toBe(0)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('goTo(Infinity) and goTo(-Infinity) are no-ops', () => {
    const onChange = vi.fn()
    const ctrl = createSceneController(container, scenes, onChange)

    ctrl.goTo(Infinity)
    expect(ctrl.currentScene).toBe(0)
    expect(onChange).not.toHaveBeenCalled()

    ctrl.goTo(-Infinity)
    expect(ctrl.currentScene).toBe(0)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('goTo(1.7) clamps to goTo(1)', () => {
    const onChange = vi.fn()
    const ctrl = createSceneController(container, scenes, onChange)

    ctrl.goTo(1.7)
    expect(ctrl.currentScene).toBe(1)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(scenes[1], 1)
  })

  it('empty scenes array: next/previous/goTo are no-ops', () => {
    const onChange = vi.fn()
    const ctrl = createSceneController(container, [], onChange)

    expect(ctrl.totalScenes).toBe(0)
    ctrl.next()
    ctrl.previous()
    ctrl.goTo(0)
    ctrl.goTo(5)
    expect(onChange).not.toHaveBeenCalled()
    expect(container.querySelector('.blueprint-chart-scenes')).toBeNull()
  })

  // Single-scene semantics: next() and previous() wrap to the same index (0).
  // The existing modulus arithmetic always wraps within range, so the callback
  // does fire — but the index never changes.
  it('single-scene array: next() and previous() wrap to the same index 0', () => {
    const onChange = vi.fn()
    const ctrl = createSceneController(container, [scenes[0]], onChange)

    ctrl.next()
    expect(ctrl.currentScene).toBe(0)
    expect(onChange).toHaveBeenLastCalledWith(scenes[0], 0)

    ctrl.previous()
    expect(ctrl.currentScene).toBe(0)
    expect(onChange).toHaveBeenLastCalledWith(scenes[0], 0)
  })

  it('scene reversal next → next → previous fires callback at 1, 2, 1 (in order)', () => {
    const onChange = vi.fn()
    const ctrl = createSceneController(container, scenes, onChange)

    ctrl.next()
    ctrl.next()
    ctrl.previous()

    expect(onChange).toHaveBeenCalledTimes(3)
    expect(onChange.mock.calls[0]).toEqual([scenes[1], 1])
    expect(onChange.mock.calls[1]).toEqual([scenes[2], 2])
    expect(onChange.mock.calls[2]).toEqual([scenes[1], 1])
  })

  it('scene skipping goTo(0) then goTo(3) fires callback exactly twice with indices 0 and 3', () => {
    const onChange = vi.fn()
    const fourScenes: SceneDefinition[] = [
      ...scenes,
      { name: 'Scene 4', data: { value: 4 } },
    ]
    const ctrl = createSceneController(container, fourScenes, onChange)

    ctrl.goTo(0)
    ctrl.goTo(3)

    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onChange.mock.calls[0]).toEqual([fourScenes[0], 0])
    expect(onChange.mock.calls[1]).toEqual([fourScenes[3], 3])
  })

  it('rapid switching: next() called 10x fires callback exactly 10 times with valid indices', () => {
    const onChange = vi.fn()
    const ctrl = createSceneController(container, scenes, onChange)

    for (let i = 0; i < 10; i++) {
      ctrl.next()
    }

    expect(onChange).toHaveBeenCalledTimes(10)
    for (const [, index] of onChange.mock.calls) {
      expect(Number.isInteger(index)).toBe(true)
      expect(index).toBeGreaterThanOrEqual(0)
      expect(index).toBeLessThan(scenes.length)
    }
    // Final index after 10 increments from 0, wrapping mod 3, is (0 + 10) % 3 = 1.
    expect(ctrl.currentScene).toBe(1)
  })

  it('destroy() then next() is a no-op and does not fire callback', () => {
    const onChange = vi.fn()
    const ctrl = createSceneController(container, scenes, onChange)

    ctrl.destroy()
    onChange.mockClear()

    ctrl.next()
    ctrl.previous()
    ctrl.goTo(2)

    expect(onChange).not.toHaveBeenCalled()
    expect(ctrl.currentScene).toBe(0)
  })

  it('destroy() twice does not throw', () => {
    const onChange = vi.fn()
    const ctrl = createSceneController(container, scenes, onChange)

    expect(() => {
      ctrl.destroy()
      ctrl.destroy()
    }).not.toThrow()
  })
})
