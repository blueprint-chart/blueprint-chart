import { useNavbarStore } from './navbar'

describe('useNavbarStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('defaults to home mode', () => {
    const store = useNavbarStore()
    expect(store.mode).toBe('home')
  })

  it('setMode changes mode', () => {
    const store = useNavbarStore()
    store.setMode('wizard')
    expect(store.mode).toBe('wizard')
  })

  it('reset returns to home mode', () => {
    const store = useNavbarStore()
    store.setMode('wizard')
    store.reset()
    expect(store.mode).toBe('home')
  })

  it('is a singleton across calls', () => {
    const a = useNavbarStore()
    const b = useNavbarStore()
    a.setMode('wizard')
    expect(b.mode).toBe('wizard')
  })
})
