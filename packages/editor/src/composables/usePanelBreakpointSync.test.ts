import { mount } from '@vue/test-utils'
import { usePanelStore } from '@/stores/panel'
import { usePanelBreakpointSync } from './usePanelBreakpointSync'

function createMockMatchMedia(initialMatches: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = []
  const mql = {
    matches: initialMatches,
    addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.push(cb),
    removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
      const idx = listeners.indexOf(cb)
      if (idx >= 0) {
        listeners.splice(idx, 1)
      }
    },
  }
  window.matchMedia = (() => mql) as typeof window.matchMedia
  return {
    mql,
    emit: (matches: boolean) => {
      mql.matches = matches
      listeners.forEach(cb => cb({ matches } as MediaQueryListEvent))
    },
  }
}

function mountSync() {
  const Comp = defineComponent({
    setup() {
      usePanelBreakpointSync()
      return () => h('div')
    },
  })
  return mount(Comp)
}

describe('usePanelBreakpointSync', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initial narrow: forces drawer and preserves lastDesktopMode', async () => {
    createMockMatchMedia(true)
    const store = usePanelStore()
    store.$patch({ mode: 'closed', lastDesktopMode: 'closed' })

    mountSync()
    await nextTick()

    expect(store.mode).toBe('drawer')
    expect(store.lastDesktopMode).toBe('closed')
    expect(store.narrow).toBe(true)
  })

  it('initial wide: leaves state unchanged', async () => {
    createMockMatchMedia(false)
    const store = usePanelStore()
    store.$patch({ mode: 'closed', lastDesktopMode: 'closed' })

    mountSync()
    await nextTick()

    expect(store.mode).toBe('closed')
    expect(store.lastDesktopMode).toBe('closed')
    expect(store.narrow).toBe(false)
  })

  it('initial wide with persisted drawer: coerces mode to lastDesktopMode', async () => {
    createMockMatchMedia(false)
    const store = usePanelStore()
    store.$patch({ mode: 'drawer', lastDesktopMode: 'closed' })

    mountSync()
    await nextTick()

    expect(store.mode).toBe('closed')
    expect(store.narrow).toBe(false)
  })

  it('wide→narrow: saves current mode and enters drawer', async () => {
    const media = createMockMatchMedia(false)
    const store = usePanelStore()
    store.close()

    mountSync()
    await nextTick()
    expect(store.mode).toBe('closed')

    media.emit(true)
    await nextTick()

    expect(store.mode).toBe('drawer')
    expect(store.lastDesktopMode).toBe('closed')
    expect(store.narrow).toBe(true)
  })

  it('narrow→wide: restores lastDesktopMode', async () => {
    const media = createMockMatchMedia(false)
    const store = usePanelStore()
    store.close()

    mountSync()
    await nextTick()
    media.emit(true)
    await nextTick()
    expect(store.mode).toBe('drawer')

    media.emit(false)
    await nextTick()

    expect(store.mode).toBe('closed')
    expect(store.narrow).toBe(false)
  })
})
