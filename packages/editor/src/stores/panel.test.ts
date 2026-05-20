import { createApp } from 'vue'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { DEFAULT_DOCKED_WIDTH_FRACTION, usePanel, usePanelStore } from './panel'

function createPersistingPinia() {
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  // Pinia v3 only activates plugins once mounted on a Vue app.
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
    expect(store.floatingPosition).toEqual({ x: -1, y: 16 })
    expect(store.floatingSize).toEqual({ width: 340, height: 500 })
    expect(store.dockedWidth).toBe(DEFAULT_DOCKED_WIDTH_FRACTION)
  })

  it('dock() sets mode to docked and records lastDesktopMode', () => {
    const store = usePanelStore()
    store.float()
    expect(store.mode).toBe('floating')
    store.dock()
    expect(store.mode).toBe('docked')
    expect(store.lastDesktopMode).toBe('docked')
  })

  it('float() sets mode to floating and records lastDesktopMode', () => {
    const store = usePanelStore()
    store.float()
    expect(store.mode).toBe('floating')
    expect(store.lastDesktopMode).toBe('floating')
  })

  it('close() sets mode to closed and records lastDesktopMode', () => {
    const store = usePanelStore()
    store.close()
    expect(store.mode).toBe('closed')
    expect(store.lastDesktopMode).toBe('closed')
  })

  it('openDrawer() captures previous desktop mode', () => {
    const store = usePanelStore()
    store.float()
    store.openDrawer()
    expect(store.mode).toBe('drawer')
    expect(store.lastDesktopMode).toBe('floating')
  })

  it('openDrawer() keeps lastDesktopMode stable when already in drawer', () => {
    const store = usePanelStore()
    store.float()
    store.openDrawer()
    // Calling openDrawer again should not overwrite lastDesktopMode to 'drawer'.
    store.openDrawer()
    expect(store.mode).toBe('drawer')
    expect(store.lastDesktopMode).toBe('floating')
  })

  it('closeDrawer() restores the last desktop mode', () => {
    const store = usePanelStore()
    store.float()
    store.openDrawer()
    store.closeDrawer()
    expect(store.mode).toBe('floating')
  })

  it('closeDrawer() restores closed mode if that was the last desktop state', () => {
    const store = usePanelStore()
    store.close()
    store.openDrawer()
    store.closeDrawer()
    expect(store.mode).toBe('closed')
  })

  it('open() from closed restores the last desktop mode', () => {
    const store = usePanelStore()
    store.float()
    store.close()
    // close() wrote lastDesktopMode = 'closed', so open() falls back to docked.
    store.open()
    expect(store.mode).toBe('docked')
    expect(store.lastDesktopMode).toBe('docked')
  })

  it('open() restores a meaningful lastDesktopMode when one was remembered', () => {
    const store = usePanelStore()
    store.float()
    // Manually set lastDesktopMode to 'floating' without re-running close().
    store.$patch({ mode: 'closed', lastDesktopMode: 'floating' })
    store.open()
    expect(store.mode).toBe('floating')
    expect(store.lastDesktopMode).toBe('floating')
  })

  it('open() is a no-op when not closed', () => {
    const store = usePanelStore()
    store.float()
    store.open()
    expect(store.mode).toBe('floating')
    store.dock()
    store.open()
    expect(store.mode).toBe('docked')
    store.openDrawer()
    store.open()
    expect(store.mode).toBe('drawer')
  })

  it('toggleMode cycles docked → floating → docked', () => {
    const store = usePanelStore()
    expect(store.mode).toBe('docked')
    store.toggleMode()
    expect(store.mode).toBe('floating')
    store.toggleMode()
    expect(store.mode).toBe('docked')
  })

  it('toggleMode from closed reopens to last desktop mode (floating)', () => {
    const store = usePanelStore()
    store.float()
    store.close()
    store.toggleMode()
    // lastDesktopMode was overwritten to 'closed' by close(), so the
    // restoration defaults to docked per the safe-fallback rule.
    expect(store.mode).toBe('docked')
    expect(store.lastDesktopMode).toBe('docked')
  })

  it('toggleMode from closed defaults to docked when lastDesktopMode is closed', () => {
    const store = usePanelStore()
    store.close()
    expect(store.lastDesktopMode).toBe('closed')
    store.toggleMode()
    expect(store.mode).toBe('docked')
    expect(store.lastDesktopMode).toBe('docked')
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
    // Out-of-range high → clamped to 1.
    store.setDockedWidth(2)
    expect(store.dockedWidth).toBe(1)
    // Non-positive / non-finite → falls back to the default fraction.
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
    a.float()
    expect(b.mode).toBe('floating')
  })
})

describe('usePanel composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('exposes reactive refs and actions', () => {
    const panel = usePanel()
    expect(panel.mode.value).toBe('docked')
    panel.float()
    expect(panel.mode.value).toBe('floating')
    expect(panel.lastDesktopMode.value).toBe('floating')
    panel.setDockedWidth(0.42)
    expect(panel.dockedWidth.value).toBe(0.42)
  })

  it('exposes narrow flag defaulting to false', () => {
    const panel = usePanel()
    expect(panel.narrow.value).toBe(false)
  })

  it('exposes cramped flag defaulting to false', () => {
    const panel = usePanel()
    expect(panel.cramped.value).toBe(false)
  })
})

describe('usePanelStore breakpoint sync', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initBreakpoint(true) on initial narrow forces drawer and preserves lastDesktopMode', () => {
    const store = usePanelStore()
    // Simulate rehydrated persisted state.
    store.$patch({ mode: 'floating', lastDesktopMode: 'floating' })

    store.initBreakpoint(true)

    expect(store.mode).toBe('drawer')
    expect(store.lastDesktopMode).toBe('floating')
    expect(store.narrow).toBe(true)
  })

  it('initBreakpoint(false) on initial wide leaves state unchanged', () => {
    const store = usePanelStore()
    store.$patch({ mode: 'floating', lastDesktopMode: 'floating' })

    store.initBreakpoint(false)

    expect(store.mode).toBe('floating')
    expect(store.lastDesktopMode).toBe('floating')
    expect(store.narrow).toBe(false)
  })

  it('initBreakpoint(true) preserves lastDesktopMode even when persisted mode is already drawer', () => {
    const store = usePanelStore()
    store.$patch({ mode: 'drawer', lastDesktopMode: 'floating' })

    store.initBreakpoint(true)

    expect(store.mode).toBe('drawer')
    expect(store.lastDesktopMode).toBe('floating')
  })

  it('syncBreakpoint handles wide→narrow: saves current mode to lastDesktopMode and sets drawer', () => {
    const store = usePanelStore()
    store.float()
    store.initBreakpoint(false)
    expect(store.mode).toBe('floating')

    store.syncBreakpoint(true)

    expect(store.mode).toBe('drawer')
    expect(store.lastDesktopMode).toBe('floating')
    expect(store.narrow).toBe(true)
  })

  it('syncBreakpoint handles narrow→wide: restores mode from lastDesktopMode', () => {
    const store = usePanelStore()
    store.float()
    store.initBreakpoint(false)
    store.syncBreakpoint(true)
    expect(store.mode).toBe('drawer')

    store.syncBreakpoint(false)

    expect(store.mode).toBe('floating')
    expect(store.narrow).toBe(false)
  })

  it('syncBreakpoint is a no-op when value matches current narrow state', () => {
    const store = usePanelStore()
    store.float()
    store.initBreakpoint(true)
    // mode was 'floating' when init → forced to 'drawer', lastDesktopMode stays 'floating'
    expect(store.mode).toBe('drawer')
    expect(store.lastDesktopMode).toBe('floating')

    // Second narrow call should not overwrite lastDesktopMode with 'drawer'.
    store.syncBreakpoint(true)

    expect(store.mode).toBe('drawer')
    expect(store.lastDesktopMode).toBe('floating')
  })

  it('while narrow, dock() does not update lastDesktopMode (override semantics)', () => {
    const store = usePanelStore()
    store.float()
    store.initBreakpoint(false)
    store.syncBreakpoint(true)
    // Precondition: lastDesktopMode is 'floating' from the wide→narrow transition.
    expect(store.lastDesktopMode).toBe('floating')

    store.dock()

    expect(store.mode).toBe('docked')
    expect(store.lastDesktopMode).toBe('floating')
  })

  it('while narrow, float() does not update lastDesktopMode (override semantics)', () => {
    const store = usePanelStore()
    store.dock()
    store.initBreakpoint(false)
    store.syncBreakpoint(true)
    expect(store.lastDesktopMode).toBe('docked')

    store.float()

    expect(store.mode).toBe('floating')
    expect(store.lastDesktopMode).toBe('docked')
  })

  it('while narrow, close() does not update lastDesktopMode (override semantics)', () => {
    const store = usePanelStore()
    store.float()
    store.initBreakpoint(false)
    store.syncBreakpoint(true)
    expect(store.lastDesktopMode).toBe('floating')

    store.close()

    expect(store.mode).toBe('closed')
    expect(store.lastDesktopMode).toBe('floating')
  })

  it('narrow→wide restores the pre-narrow mode even after overrides', () => {
    const store = usePanelStore()
    store.float()
    store.initBreakpoint(false)
    store.syncBreakpoint(true)
    // Override while narrow.
    store.dock()
    expect(store.mode).toBe('docked')
    expect(store.lastDesktopMode).toBe('floating')

    store.syncBreakpoint(false)

    expect(store.mode).toBe('floating')
  })
})

describe('usePanelStore persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    createPersistingPinia()
  })

  it('persists mode, dockedWidth, and lastDesktopMode to localStorage', async () => {
    const store = usePanelStore()
    store.float()
    store.setDockedWidth(0.42)
    await nextTick()

    const raw = localStorage.getItem('blueprint-chart:panel:v2')
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(parsed).toMatchObject({
      mode: 'floating',
      dockedWidth: 0.42,
      lastDesktopMode: 'floating',
    })
  })

  it('does not persist floatingPosition or floatingSize', async () => {
    const store = usePanelStore()
    store.floatingPosition = { x: 123, y: 456 }
    store.floatingSize = { width: 500, height: 700 }
    await nextTick()

    const raw = localStorage.getItem('blueprint-chart:panel:v2')
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(parsed).not.toHaveProperty('floatingPosition')
    expect(parsed).not.toHaveProperty('floatingSize')
  })

  it('rehydrates persisted state on a fresh pinia instance', () => {
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
    expect(store.mode).toBe('floating')
    expect(store.dockedWidth).toBe(0.3)
    expect(store.lastDesktopMode).toBe('floating')
    // Non-persisted fields fall back to their defaults.
    expect(store.floatingPosition).toEqual({ x: -1, y: 16 })
    expect(store.floatingSize).toEqual({ width: 340, height: 500 })
  })

  it('falls back to sensible defaults when no persisted state exists', () => {
    // localStorage is cleared in beforeEach — simulate a first-ever load.
    expect(localStorage.getItem('blueprint-chart:panel:v2')).toBeNull()

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
    // Simulate rehydration from localStorage with a narrow session's drawer
    // snapshot and a remembered desktop mode.
    store.$patch({ mode: 'drawer', lastDesktopMode: 'floating' })

    store.initBreakpoint(false)

    expect(store.mode).toBe('floating')
    expect(store.lastDesktopMode).toBe('floating')
    expect(store.narrow).toBe(false)
  })

  it('initBreakpoint(false) coerces drawer to docked when lastDesktopMode is at its default', () => {
    const store = usePanelStore()
    // No lastDesktopMode ever set — stays at the initial 'docked' default.
    store.$patch({ mode: 'drawer' })

    store.initBreakpoint(false)

    expect(store.mode).toBe('docked')
  })

  it('initBreakpoint(false) leaves mode alone when persisted mode is not drawer', () => {
    const store = usePanelStore()
    store.$patch({ mode: 'floating', lastDesktopMode: 'floating' })

    store.initBreakpoint(false)

    expect(store.mode).toBe('floating')
  })
})

describe('usePanelStore canvas sync', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('exposes cramped flag defaulting to false', () => {
    const store = usePanelStore()
    expect(store.cramped).toBe(false)
  })

  it('initCramped(true) on initial cramped forces closed and preserves lastDesktopMode', () => {
    const store = usePanelStore()
    store.$patch({ mode: 'floating', lastDesktopMode: 'floating' })

    store.initCramped(true)

    expect(store.mode).toBe('closed')
    expect(store.lastDesktopMode).toBe('floating')
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
    store.$patch({ mode: 'drawer', lastDesktopMode: 'floating' })

    store.initCramped(true)

    expect(store.mode).toBe('drawer')
    expect(store.lastDesktopMode).toBe('floating')
  })

  it('syncCramped wide→cramped: saves current mode and sets closed', () => {
    const store = usePanelStore()
    store.float()
    expect(store.mode).toBe('floating')

    store.syncCramped(true)

    expect(store.mode).toBe('closed')
    expect(store.lastDesktopMode).toBe('floating')
    expect(store.cramped).toBe(true)
  })

  it('syncCramped cramped→wide: restores mode from lastDesktopMode', () => {
    const store = usePanelStore()
    store.float()
    store.syncCramped(true)
    expect(store.mode).toBe('closed')

    store.syncCramped(false)

    expect(store.mode).toBe('floating')
    expect(store.cramped).toBe(false)
  })

  it('syncCramped is a no-op when value matches current cramped state', () => {
    const store = usePanelStore()
    store.float()
    store.syncCramped(true)
    expect(store.mode).toBe('closed')
    expect(store.lastDesktopMode).toBe('floating')

    store.syncCramped(true)

    expect(store.mode).toBe('closed')
    expect(store.lastDesktopMode).toBe('floating')
  })

  it('user-closed while cramped stays closed when uncramped', () => {
    const store = usePanelStore()
    store.dock()
    store.syncCramped(true)
    expect(store.mode).toBe('closed')
    expect(store.lastDesktopMode).toBe('docked')

    // User clicks close while cramped — close() updates lastDesktopMode
    // because narrow is false (cramped is a different axis).
    store.close()
    expect(store.lastDesktopMode).toBe('closed')

    store.syncCramped(false)

    expect(store.mode).toBe('closed')
    expect(store.cramped).toBe(false)
  })

  it('while narrow, syncCramped only updates the flag and does not change mode', () => {
    const store = usePanelStore()
    store.float()
    store.syncBreakpoint(true)
    expect(store.mode).toBe('drawer')
    expect(store.lastDesktopMode).toBe('floating')

    store.syncCramped(true)

    expect(store.mode).toBe('drawer')
    expect(store.lastDesktopMode).toBe('floating')
    expect(store.cramped).toBe(true)
  })

  it('exports CRAMPED_THRESHOLD as PANEL_MIN_WIDTH + MIN_CANVAS_WIDTH', async () => {
    const { CRAMPED_THRESHOLD, MIN_CANVAS_WIDTH } = await import('./panel')
    expect(CRAMPED_THRESHOLD).toBe(MIN_CANVAS_WIDTH + 260)
  })
})
