const mockRoute = { path: '/new', params: {} as Record<string, string> }
const mockReplace = vi.fn()
const mockPush = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
}))

import { useWizard } from './wizard'

describe('useWizard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockRoute.path = '/new'
    mockRoute.params = {}
    mockReplace.mockClear()
    mockPush.mockClear()
  })

  it('starts at data step on /new', () => {
    const { currentIndex, currentStep } = useWizard()
    expect(currentIndex.value).toBe(0)
    expect(currentStep.value.key).toBe('data')
  })

  it('resolves edit step on /edit/:id/visualize', () => {
    mockRoute.path = '/edit/abc123/visualize'
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

  it('next() pushes the next step route so Back returns to this one', () => {
    mockRoute.path = '/edit/abc123/visualize'
    mockRoute.params = { id: 'abc123' }
    const { next } = useWizard()
    next()
    expect(mockPush).toHaveBeenCalledWith('/edit/abc123/export')
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('back() pushes the previous step route', () => {
    mockRoute.path = '/edit/abc123/visualize'
    mockRoute.params = { id: 'abc123' }
    const { back } = useWizard()
    back()
    expect(mockPush).toHaveBeenCalledWith('/edit/abc123/data')
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('next() does nothing on last step', () => {
    mockRoute.path = '/edit/abc123/export'
    mockRoute.params = { id: 'abc123' }
    const { next } = useWizard()
    next()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('back() does nothing on first step', () => {
    mockRoute.path = '/new'
    const { back } = useWizard()
    back()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('goTo() pushes the specified step', () => {
    mockRoute.path = '/edit/abc123/visualize'
    mockRoute.params = { id: 'abc123' }
    const { goTo } = useWizard()
    goTo(2)
    expect(mockPush).toHaveBeenCalledWith('/edit/abc123/export')
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('replaces rather than pushes on the first move off /new', () => {
    mockRoute.path = '/new'
    const { registerCreateSession, next } = useWizard()
    registerCreateSession(() => 'abc123')

    next()

    expect(mockReplace).toHaveBeenCalledWith('/edit/abc123/visualize')
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('isFirst and isLast are correct', () => {
    mockRoute.path = '/new'
    const { isFirst, isLast } = useWizard()
    expect(isFirst.value).toBe(true)
    expect(isLast.value).toBe(false)
  })
})
