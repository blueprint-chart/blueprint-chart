import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRoute = { path: '/new', params: {} }
const mockReplace = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({ replace: mockReplace }),
}))

import { useWizard } from './useWizard'

describe('useWizard', () => {
  beforeEach(() => {
    mockRoute.path = '/new'
    mockRoute.params = {}
    mockReplace.mockClear()
  })

  it('starts at data step on /new', () => {
    const { currentIndex, currentStep } = useWizard()
    expect(currentIndex.value).toBe(0)
    expect(currentStep.value.key).toBe('data')
  })

  it('resolves edit step on /edit/:id', () => {
    mockRoute.path = '/edit/abc123'
    mockRoute.params = { id: 'abc123' }
    const { currentIndex, currentStep } = useWizard()
    expect(currentIndex.value).toBe(1)
    expect(currentStep.value.key).toBe('edit')
  })

  it('resolves data step on /edit/:id/data', () => {
    mockRoute.path = '/edit/abc123/data'
    mockRoute.params = { id: 'abc123' }
    const { currentStep } = useWizard()
    expect(currentStep.value.key).toBe('data')
  })

  it('resolves export step on /edit/:id/export', () => {
    mockRoute.path = '/edit/abc123/export'
    mockRoute.params = { id: 'abc123' }
    const { currentStep } = useWizard()
    expect(currentStep.value.key).toBe('export')
  })

  it('next() navigates to next step route', () => {
    mockRoute.path = '/edit/abc123'
    mockRoute.params = { id: 'abc123' }
    const { next } = useWizard()
    next()
    expect(mockReplace).toHaveBeenCalledWith('/edit/abc123/export')
  })

  it('back() navigates to previous step route', () => {
    mockRoute.path = '/edit/abc123'
    mockRoute.params = { id: 'abc123' }
    const { back } = useWizard()
    back()
    expect(mockReplace).toHaveBeenCalledWith('/edit/abc123/data')
  })

  it('next() does nothing on last step', () => {
    mockRoute.path = '/edit/abc123/export'
    mockRoute.params = { id: 'abc123' }
    const { next } = useWizard()
    next()
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('back() does nothing on first step', () => {
    mockRoute.path = '/new'
    const { back } = useWizard()
    back()
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('goTo() navigates to the specified step', () => {
    mockRoute.path = '/edit/abc123'
    mockRoute.params = { id: 'abc123' }
    const { goTo } = useWizard()
    goTo(2)
    expect(mockReplace).toHaveBeenCalledWith('/edit/abc123/export')
  })

  it('isFirst and isLast are correct', () => {
    mockRoute.path = '/new'
    const { isFirst, isLast } = useWizard()
    expect(isFirst.value).toBe(true)
    expect(isLast.value).toBe(false)
  })
})
