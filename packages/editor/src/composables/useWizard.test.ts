import { describe, it, expect, beforeEach } from 'vitest'
import { useWizard } from './useWizard'

beforeEach(() => {
  useWizard().reset()
})

describe('useWizard initial state', () => {
  it('starts at step 0', () => {
    const { currentIndex, currentStep } = useWizard()
    expect(currentIndex.value).toBe(0)
    expect(currentStep.value.key).toBe('upload')
  })
})

describe('useWizard next', () => {
  it('advances with next()', () => {
    const { next, currentIndex } = useWizard()
    next()
    expect(currentIndex.value).toBe(1)
  })

  it('does not go past last step', () => {
    const { next, currentIndex, steps } = useWizard()
    for (let i = 0; i < steps.length + 2; i++) {
      next()
    }
    expect(currentIndex.value).toBe(steps.length - 1)
  })
})

describe('useWizard back', () => {
  it('goes back with back()', () => {
    const { next, back, currentIndex } = useWizard()
    next()
    next()
    back()
    expect(currentIndex.value).toBe(1)
  })

  it('does not go below 0', () => {
    const { back, currentIndex } = useWizard()
    back()
    expect(currentIndex.value).toBe(0)
  })
})

describe('useWizard goTo', () => {
  it('only allows jumping to visited steps', () => {
    const { next, goTo, currentIndex } = useWizard()
    next()
    next()
    goTo(0)
    expect(currentIndex.value).toBe(0)
    goTo(2)
    expect(currentIndex.value).toBe(2)
    goTo(3)
    expect(currentIndex.value).toBe(2)
  })
})

describe('useWizard tracking', () => {
  it('tracks furthestIndex', () => {
    const { next, back, furthestIndex } = useWizard()
    next()
    next()
    expect(furthestIndex.value).toBe(2)
    back()
    expect(furthestIndex.value).toBe(2)
  })

  it('isFirst and isLast are correct', () => {
    const { next, isFirst, isLast, steps } = useWizard()
    expect(isFirst.value).toBe(true)
    expect(isLast.value).toBe(false)
    for (let i = 0; i < steps.length - 1; i++) {
      next()
    }
    expect(isFirst.value).toBe(false)
    expect(isLast.value).toBe(true)
  })
})
