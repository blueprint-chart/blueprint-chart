import { useThemeStore } from './theme'

describe('useThemeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers({ toFake: ['requestAnimationFrame'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('disables transitions while the theme attribute flips, then restores them', async () => {
    const store = useThemeStore()
    vi.advanceTimersToNextFrame()

    store.theme = 'dark'
    await nextTick()

    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark')
    expect(document.head.innerHTML).toContain('transition:none!important')

    vi.advanceTimersToNextFrame()
    expect(document.head.innerHTML).not.toContain('transition:none!important')
  })
})
