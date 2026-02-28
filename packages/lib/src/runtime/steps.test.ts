import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createStepController } from './steps'
import type { StepDefinition } from './steps'

describe('createStepController', () => {
  let container: HTMLElement
  const steps: StepDefinition[] = [
    { name: 'Step 1', data: { value: 1 } },
    { name: 'Step 2', data: { value: 2 } },
    { name: 'Step 3', data: { value: 3 } },
  ]

  beforeEach(() => {
    container = document.createElement('div')
    document.body.innerHTML = ''
    document.body.appendChild(container)
  })

  it('creates navigation UI in the container', () => {
    const onChange = vi.fn()
    createStepController(container, steps, onChange)

    const nav = container.querySelector('.blueprint-chart-steps')
    expect(nav).not.toBeNull()
    expect(nav?.querySelector('.blueprint-chart-steps-prev')).not.toBeNull()
    expect(nav?.querySelector('.blueprint-chart-steps-next')).not.toBeNull()
    expect(nav?.querySelector('.blueprint-chart-steps-counter')).not.toBeNull()
  })

  it('displays the correct initial counter', () => {
    const onChange = vi.fn()
    createStepController(container, steps, onChange)

    const counter = container.querySelector('.blueprint-chart-steps-counter')
    expect(counter?.textContent).toBe('1 / 3')
  })

  it('starts at step 0', () => {
    const onChange = vi.fn()
    const ctrl = createStepController(container, steps, onChange)

    expect(ctrl.currentStep).toBe(0)
    expect(ctrl.totalSteps).toBe(3)
  })

  it('advances to the next step', () => {
    const onChange = vi.fn()
    const ctrl = createStepController(container, steps, onChange)

    ctrl.next()
    expect(ctrl.currentStep).toBe(1)
    expect(onChange).toHaveBeenCalledWith(steps[1], 1)
  })

  it('goes to the previous step', () => {
    const onChange = vi.fn()
    const ctrl = createStepController(container, steps, onChange)

    ctrl.next()
    ctrl.previous()
    expect(ctrl.currentStep).toBe(0)
    expect(onChange).toHaveBeenLastCalledWith(steps[0], 0)
  })

  it('wraps around from last to first step', () => {
    const onChange = vi.fn()
    const ctrl = createStepController(container, steps, onChange)

    ctrl.goTo(2)
    ctrl.next()
    expect(ctrl.currentStep).toBe(0)
    expect(onChange).toHaveBeenLastCalledWith(steps[0], 0)
  })

  it('wraps around from first to last step', () => {
    const onChange = vi.fn()
    const ctrl = createStepController(container, steps, onChange)

    ctrl.previous()
    expect(ctrl.currentStep).toBe(2)
    expect(onChange).toHaveBeenLastCalledWith(steps[2], 2)
  })

  it('goTo jumps to a specific step', () => {
    const onChange = vi.fn()
    const ctrl = createStepController(container, steps, onChange)

    ctrl.goTo(2)
    expect(ctrl.currentStep).toBe(2)
    expect(onChange).toHaveBeenCalledWith(steps[2], 2)

    const counter = container.querySelector('.blueprint-chart-steps-counter')
    expect(counter?.textContent).toBe('3 / 3')
  })

  it('updates counter on navigation', () => {
    const onChange = vi.fn()
    const ctrl = createStepController(container, steps, onChange)

    ctrl.next()
    const counter = container.querySelector('.blueprint-chart-steps-counter')
    expect(counter?.textContent).toBe('2 / 3')
  })

  it('destroy removes the navigation element', () => {
    const onChange = vi.fn()
    const ctrl = createStepController(container, steps, onChange)

    expect(container.querySelector('.blueprint-chart-steps')).not.toBeNull()
    ctrl.destroy()
    expect(container.querySelector('.blueprint-chart-steps')).toBeNull()
  })

  it('button clicks trigger navigation', () => {
    const onChange = vi.fn()
    createStepController(container, steps, onChange)

    const nextBtn = container.querySelector<HTMLButtonElement>('.blueprint-chart-steps-next')!
    nextBtn.click()
    expect(onChange).toHaveBeenCalledWith(steps[1], 1)

    const prevBtn = container.querySelector<HTMLButtonElement>('.blueprint-chart-steps-prev')!
    prevBtn.click()
    expect(onChange).toHaveBeenLastCalledWith(steps[0], 0)
  })
})
