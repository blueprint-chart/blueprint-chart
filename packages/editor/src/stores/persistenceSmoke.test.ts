import { createApp } from 'vue'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { usePersistenceSmokeStore } from './persistenceSmoke'

function createPersistingPinia() {
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  // Pinia v3 only activates plugins once mounted on a Vue app.
  createApp({}).use(pinia)
  setActivePinia(pinia)
  return pinia
}

describe('pinia-plugin-persistedstate wiring', () => {
  beforeEach(() => {
    localStorage.clear()
    createPersistingPinia()
  })

  it('writes persisted state to localStorage when the store mutates', async () => {
    const store = usePersistenceSmokeStore()
    store.set('hello-persist')
    await nextTick()

    const raw = localStorage.getItem('persistenceSmoke')
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw!)).toMatchObject({ value: 'hello-persist' })
  })

  it('rehydrates state from localStorage on a fresh pinia instance', () => {
    localStorage.setItem(
      'persistenceSmoke',
      JSON.stringify({ value: 'rehydrated' }),
    )

    createPersistingPinia()

    const store = usePersistenceSmokeStore()
    expect(store.value).toBe('rehydrated')
  })
})
