import { useWaitStore } from './wait'

describe('useWaitStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('defaults unknown loaders to false', () => {
    expect(useWaitStore().get('anything')).toBe(false)
  })

  it('set toggles a loader and get reflects it', () => {
    const store = useWaitStore()
    store.set('alpha', true)
    expect(store.get('alpha')).toBe(true)
    store.set('alpha', false)
    expect(store.get('alpha')).toBe(false)
  })

  it('accepts a ref as the id', () => {
    const store = useWaitStore()
    const id = ref('beta')
    store.set(id, true)
    expect(store.get('beta')).toBe(true)
    expect(store.get(id)).toBe(true)
  })
})
