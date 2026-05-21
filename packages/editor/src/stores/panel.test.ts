import { createApp } from 'vue'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { DEFAULT_DOCKED_WIDTH_FRACTION, usePanel, usePanelStore } from './panel'

function createPersistingPinia() {
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  createApp({}).use(pinia)
  setActivePinia(pinia)
  return pinia
}

describe('usePanelStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('has sensible defaults', () => {
    const store = usePanelStore()
    expect(store.mode).toBe('docked')
    expect(store.lastDesktopMode).toBe('docked')
    expect(store.dockedWidth).toBe(DEFAULT_DOCKED_WIDTH_FRACTION)
  })

  it('dock() sets mode to docked and records lastDesktopMode', () => {
    const store = usePanelStore()
    store.close()
    store.dock()
    expect(store.mode).toBe('docked')
    expect(store.lastDesktopMode).toBe('docked')
  })

  it('close() sets mode to closed and records lastDesktopMode', () => {
    const store = usePanelStore()
    store.close()
    expect(store.mode).toBe('closed')
    expect(store.lastDesktopMode).toBe('closed')
  })

  it('openDrawer() captures previous desktop mode', () => {
    const store = usePanelStore()
    store.close()
    store.openDrawer()
    expect(store.mode).toBe('drawer')
    expect(store.lastDesktopMode).toBe('closed')
  })

  it('openDrawer() keeps lastDesktopMode stable when already in drawer', () => {
    const store = usePanelStore()
    store.close()
    store.openDrawer()
    store.openDrawer()
    expect(store.mode).toBe('drawer')
    expect(store.lastDesktopMode).toBe('closed')
  })

  it('closeDrawer() restores the last desktop mode', () => {
    const store = usePanelStore()
    store.close()
    store.openDrawer()
    store.closeDrawer()
    expect(store.mode).toBe('closed')
  })

  it('open() from closed restores docked mode', () => {
    const store = usePanelStore()
    store.close()
    store.open()
    expect(store.mode).toBe('docked')
    expect(store.lastDesktopMode).toBe('docked')
  })

  it('open() is a no-op when not closed', () => {
    const store = usePanelStore()
    store.dock()
    store.open()
    expect(store.mode).toBe('docked')
    store.openDrawer()
    store.open()
    expect(store.mode).toBe('drawer')
  })

  it('toggleMode cycles docked → closed → docked', () => {
    const store = usePanelStore()
    expect(store.mode).toBe('docked')
    store.toggleMode()
    expect(store.mode).toBe('closed')
    store.toggleMode()
    expect(store.mode).toBe('docked')
  })

  it('toggleMode is a no-op in drawer mode', () => {
    const store = usePanelStore()
    store.openDrawer()
    store.toggleMode()
    expect(store.mode).toBe('drawer')
  })

  it('setDockedWidth stores a viewport fraction and clamps to (0..1]', () => {
    const store = usePanelStore()
    store.setDockedWidth(0.3)
    expect(store.dockedWidth).toBe(0.3)
    store.setDockedWidth(2)
    expect(store.dockedWidth).toBe(1)
    store.setDockedWidth(0)
    expect(store.dockedWidth).toBe(DEFAULT_DOCKED_WIDTH_FRACTION)
    store.setDockedWidth(-1)
    expect(store.dockedWidth).toBe(DEFAULT_DOCKED_WIDTH_FRACTION)
    store.setDockedWidth(Number.NaN)
    expect(store.dockedWidth).toBe(DEFAULT_DOCKED_WIDTH_FRACTION)
  })

  it('is a singleton across calls', () => {
    const a = usePanelStore()
    const b = usePanelStore()
    a.close()
    expect(b.mode).toBe('closed')
  })
})

describe('usePanel composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('exposes reactive refs and actions', () => {
    const panel = usePanel()
    expect(panel.mode.value).toBe('docked')
    panel.close()
    expect(panel.mode.value).toBe('closed')
    expect(panel.lastDesktopMode.value).toBe('closed')
    panel.setDockedWidth(0.42)
    expect(panel.dockedWidth.value).toBe(0.42)
  })

  it('exposes narrow flag defaulting to false', () => {
    expect(usePanel().narrow.value).toBe(false)
  })

  it('exposes cramped flag defaulting to false', () => {
    expect(usePanel().cramped.value).toBe(false)
  })
})

describe('usePanelStore breakpoint sync', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initBreakpoint(true) on initial narrow forces drawer and preserves lastDesktopMode', () => {
    const store = usePanelStore()
    store.$patch({ mode: 'closed', lastDesktopMode: 'closed' })

    store.initBreakpoint(true)

    expect(store.mode).toBe('drawer')
    expect(store.lastDesktopMode).toBe('closed')
    expect(store.narrow).toBe(true)
  })

  it('initBreakpoint(false) on initial wide leaves state unchanged', () => {
    const store = usePanelStore()
    store.$patch({ mode: 'closed', lastDesktopMode: 'closed' })

    store.initBreakpoint(false)

    expect(store.mode).toBe('closed')
    expect(store.lastDesktopMode).toBe('closed')
    expect(store.narrow).toBe(false)
  })

  it('initBreakpoint(true) preserves lastDesktopMode even when persisted mode is already drawer', () => {
    const store = usePanelStore()
    store.$patch({ mode: 'drawer', lastDesktopMode: 'closed' })

    store.initBreakpoint(true)

    expect(store.mode).toBe('drawer')
    expect(store.lastDesktopMode).toBe('closed')
  })

  it('syncBreakpoint handles wide→narrow: saves current mode to lastDesktopMode and sets drawer', () => {
    const store = usePanelStore()
    store.close()
    store.initBreakpoint(false)
    expect(store.mode).toBe('closed')

    store.syncBreakpoint(true)

    expect(store.mode).toBe('drawer')
    expect(store.lastDesktopMode).toBe('closed')
    expect(store.narrow).toBe(true)
  })

  it('syncBreakpoint handles narrow→wide: restores mode from lastDesktopMode', () => {
    const store = usePanelStore()
    store.close()
    store.initBreakpoint(false)
    store.syncBreakpoint(true)

    store.syncBreakpoint(false)

    expect(store.mode).toBe('closed')
    expect(store.narrow).toBe(false)
  })

  it('syncBreakpoint is a no-op when value matches current narrow state', () => {
    const store = usePanelStore()
    store.close()
    store.initBreakpoint(true)
    expect(store.mode).toBe('drawer')
    expect(store.lastDesktopMode).toBe('closed')

    store.syncBreakpoint(true)

    expect(store.mode).toBe('drawer')
    expect(store.lastDesktopMode).toBe('closed')
  })

  it('while narrow, dock() does not update lastDesktopMode (override semantics)', () => {
    const store = usePanelStore()
    store.close()
    store.initBreakpoint(false)
    store.syncBreakpoint(true)
    expect(store.lastDesktopMode).toBe('closed')

    store.dock()

    expect(store.mode).toBe('docked')
    expect(store.lastDesktopMode).toBe('closed')
  })

  it('while narrow, close() does not update lastDesktopMode (override semantics)', () => {
    const store = usePanelStore()
    store.dock()
    store.initBreakpoint(false)
    store.syncBreakpoint(true)
    expect(store.lastDesktopMode).toBe('docked')

    store.close()

    expect(store.mode).toBe('closed')
    expect(store.lastDesktopMode).toBe('docked')
  })

  it('narrow→wide restores the pre-narrow mode even after overrides', () => {
    const store = usePanelStore()
    store.close()
    store.initBreakpoint(false)
    store.syncBreakpoint(true)
    store.dock()
    expect(store.mode).toBe('docked')
    expect(store.lastDesktopMode).toBe('closed')

    store.syncBreakpoint(false)

    expect(store.mode).toBe('closed')
  })
})

describe('usePanelStore persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    createPersistingPinia()
  })

  it('persists mode, dockedWidth, and lastDesktopMode to localStorage under v3 key', async () => {
    const store = usePanelStore()
    store.close()
    store.setDockedWidth(0.42)
    await nextTick()

    const raw = localStorage.getItem('blueprint-chart:panel:v3')
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(parsed).toMatchObject({
      mode: 'closed',
      dockedWidth: 0.42,
      lastDesktopMode: 'closed',
    })
  })

  it('rehydrates persisted v3 state on a fresh pinia instance', () => {
    localStorage.setItem(
      'blueprint-chart:panel:v3',
      JSON.stringify({
        mode: 'closed',
        dockedWidth: 0.3,
        lastDesktopMode: 'closed',
      }),
    )

    createPersistingPinia()

    const store = usePanelStore()
    expect(store.mode).toBe('closed')
    expect(store.dockedWidth).toBe(0.3)
    expect(store.lastDesktopMode).toBe('closed')
  })

  it('ignores a stale v2 payload (any persisted floating value is discarded)', () => {
    localStorage.setItem(
      'blueprint-chart:panel:v2',
      JSON.stringify({
        mode: 'floating',
        dockedWidth: 0.3,
        lastDesktopMode: 'floating',
      }),
    )

    createPersistingPinia()

    const store = usePanelStore()
    expect(store.mode).toBe('docked')
    expect(store.lastDesktopMode).toBe('docked')
    expect(store.dockedWidth).toBe(DEFAULT_DOCKED_WIDTH_FRACTION)
  })

  it('falls back to sensible defaults when no persisted state exists', () => {
    expect(localStorage.getItem('blueprint-chart:panel:v3')).toBeNull()

    const store = usePanelStore()

    expect(store.mode).toBe('docked')
    expect(store.lastDesktopMode).toBe('docked')
    expect(store.dockedWidth).toBe(DEFAULT_DOCKED_WIDTH_FRACTION)
  })
})

describe('usePanelStore hydration coercion', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initBreakpoint(false) coerces a persisted drawer mode to lastDesktopMode', () => {
    const store = usePanelStore()
    store.$patch({ mode: 'drawer', lastDesktopMode: 'closed' })

    store.initBreakpoint(false)

    expect(store.mode).toBe('closed')
    expect(store.lastDesktopMode).toBe('closed')
    expect(store.narrow).toBe(false)
  })

  it('initBreakpoint(false) coerces drawer to docked when lastDesktopMode is at its default', () => {
    const store = usePanelStore()
    store.$patch({ mode: 'drawer' })

    store.initBreakpoint(false)

    expect(store.mode).toBe('docked')
  })

  it('initBreakpoint(false) leaves mode alone when persisted mode is not drawer', () => {
    const store = usePanelStore()
    store.$patch({ mode: 'closed', lastDesktopMode: 'closed' })

    store.initBreakpoint(false)

    expect(store.mode).toBe('closed')
  })
})

describe('usePanelStore canvas sync', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('exposes cramped flag defaulting to false', () => {
    expect(usePanelStore().cramped).toBe(false)
  })

  it('initCramped(true) on initial cramped forces closed and preserves lastDesktopMode', () => {
    const store = usePanelStore()
    store.$patch({ mode: 'docked', lastDesktopMode: 'docked' })

    store.initCramped(true)

    expect(store.mode).toBe('closed')
    expect(store.lastDesktopMode).toBe('docked')
    expect(store.cramped).toBe(true)
  })

  it('initCramped(false) on initial wide leaves state unchanged', () => {
    const store = usePanelStore()
    store.$patch({ mode: 'docked', lastDesktopMode: 'docked' })

    store.initCramped(false)

    expect(store.mode).toBe('docked')
    expect(store.lastDesktopMode).toBe('docked')
    expect(store.cramped).toBe(false)
  })

  it('initCramped(true) does not change mode when already drawer (narrow wins)', () => {
    const store = usePanelStore()
    store.$patch({ mode: 'drawer', lastDesktopMode: 'closed' })

    store.initCramped(true)

    expect(store.mode).toBe('drawer')
    expect(store.lastDesktopMode).toBe('closed')
  })

  it('syncCramped wide→cramped: saves current mode and sets closed', () => {
    const store = usePanelStore()
    store.dock()
    expect(store.mode).toBe('docked')

    store.syncCramped(true)

    expect(store.mode).toBe('closed')
    expect(store.lastDesktopMode).toBe('docked')
    expect(store.cramped).toBe(true)
  })

  it('syncCramped cramped→wide: restores mode from lastDesktopMode', () => {
    const store = usePanelStore()
    store.dock()
    store.syncCramped(true)
    expect(store.mode).toBe('closed')

    store.syncCramped(false)

    expect(store.mode).toBe('docked')
    expect(store.cramped).toBe(false)
  })

  it('syncCramped is a no-op when value matches current cramped state', () => {
    const store = usePanelStore()
    store.dock()
    store.syncCramped(true)
    expect(store.mode).toBe('closed')
    expect(store.lastDesktopMode).toBe('docked')

    store.syncCramped(true)

    expect(store.mode).toBe('closed')
    expect(store.lastDesktopMode).toBe('docked')
  })

  it('user-closed while cramped stays closed when uncramped', () => {
    const store = usePanelStore()
    store.dock()
    store.syncCramped(true)
    expect(store.mode).toBe('closed')
    expect(store.lastDesktopMode).toBe('docked')

    store.close()
    expect(store.lastDesktopMode).toBe('closed')

    store.syncCramped(false)

    expect(store.mode).toBe('closed')
    expect(store.cramped).toBe(false)
  })

  it('while narrow, syncCramped only updates the flag and does not change mode', () => {
    const store = usePanelStore()
    store.dock()
    store.syncBreakpoint(true)
    expect(store.mode).toBe('drawer')
    expect(store.lastDesktopMode).toBe('docked')

    store.syncCramped(true)

    expect(store.mode).toBe('drawer')
    expect(store.lastDesktopMode).toBe('docked')
    expect(store.cramped).toBe(true)
  })

  it('exports CRAMPED_THRESHOLD as PANEL_MIN_WIDTH + MIN_CANVAS_WIDTH', async () => {
    const { CRAMPED_THRESHOLD, MIN_CANVAS_WIDTH } = await import('./panel')
    expect(CRAMPED_THRESHOLD).toBe(MIN_CANVAS_WIDTH + 260)
  })
})
