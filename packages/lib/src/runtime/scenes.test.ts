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
})
