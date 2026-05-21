export type PanelMode = 'docked' | 'closed' | 'drawer'
export type DesktopPanelMode = 'docked' | 'closed'

export const PANEL_MIN_WIDTH = 260
export const PANEL_MAX_WIDTH = 660
export const MIN_CANVAS_WIDTH = 220
export const CRAMPED_THRESHOLD = PANEL_MIN_WIDTH + MIN_CANVAS_WIDTH
// Default panel width as a fraction of viewport width. Stored as a fraction
// (not pixels) so the panel reflows proportionally when the window resizes;
// pixel min/max clamping is applied at render time in PanelDocked.
export const DEFAULT_DOCKED_WIDTH_FRACTION = 0.22

export const usePanelStore = defineStore('panel', () => {
  const mode = shallowRef<PanelMode>('docked')
  const dockedWidth = shallowRef<number>(DEFAULT_DOCKED_WIDTH_FRACTION)
  const lastDesktopMode = shallowRef<DesktopPanelMode>('docked')
  // Tracks whether the viewport is currently narrow. Not persisted — always
  // re-derived from useBreakpoint() at runtime via usePanelBreakpointSync().
  const narrow = shallowRef(false)
  // Tracks whether the canvas (the layout main area) is too narrow to hold
  // even the smallest panel plus a usable canvas floor. Not persisted — always
  // re-derived from a ResizeObserver via usePanelCanvasSync().
  const cramped = shallowRef(false)

  function dock() {
    mode.value = 'docked'
    if (!narrow.value) {
      lastDesktopMode.value = 'docked'
    }
  }

  function close() {
    mode.value = 'closed'
    if (!narrow.value) {
      lastDesktopMode.value = 'closed'
    }
  }

  // Re-opens the panel from 'closed' to docked. No-op in any other mode.
  function open() {
    if (mode.value !== 'closed') {
      return
    }
    mode.value = 'docked'
    if (!narrow.value) {
      lastDesktopMode.value = 'docked'
    }
  }

  function openDrawer() {
    if (mode.value !== 'drawer') {
      lastDesktopMode.value = mode.value
    }
    mode.value = 'drawer'
  }

  function closeDrawer() {
    mode.value = lastDesktopMode.value
  }

  // Flips visibility: docked ↔ closed. No-op in drawer mode (the narrow axis
  // owns mode-switching while narrow).
  function toggleMode() {
    if (mode.value === 'docked') {
      close()
    }
    else if (mode.value === 'closed') {
      mode.value = 'docked'
      if (!narrow.value) {
        lastDesktopMode.value = 'docked'
      }
    }
  }

  function setDockedWidth(next: number) {
    if (!Number.isFinite(next) || next <= 0) {
      dockedWidth.value = DEFAULT_DOCKED_WIDTH_FRACTION
      return
    }
    dockedWidth.value = Math.min(1, next)
  }

  function initBreakpoint(isNarrow: boolean) {
    narrow.value = isNarrow
    if (isNarrow) {
      if (mode.value !== 'drawer') {
        mode.value = 'drawer'
      }
    }
    else if (mode.value === 'drawer') {
      mode.value = lastDesktopMode.value
    }
  }

  function syncBreakpoint(isNarrow: boolean) {
    if (narrow.value === isNarrow) {
      return
    }
    narrow.value = isNarrow
    if (isNarrow) {
      if (mode.value !== 'drawer') {
        lastDesktopMode.value = mode.value as DesktopPanelMode
      }
      mode.value = 'drawer'
    }
    else {
      mode.value = lastDesktopMode.value
    }
  }

  function initCramped(isCramped: boolean) {
    cramped.value = isCramped
    if (isCramped && mode.value !== 'closed' && mode.value !== 'drawer') {
      mode.value = 'closed'
    }
  }

  function syncCramped(isCramped: boolean) {
    if (cramped.value === isCramped) {
      return
    }
    cramped.value = isCramped
    if (narrow.value) {
      return
    }
    if (isCramped) {
      if (mode.value !== 'closed' && mode.value !== 'drawer') {
        lastDesktopMode.value = mode.value as DesktopPanelMode
      }
      mode.value = 'closed'
    }
    else if (mode.value === 'closed') {
      mode.value = lastDesktopMode.value
    }
  }

  return {
    mode,
    dockedWidth,
    lastDesktopMode,
    narrow,
    cramped,
    dock,
    close,
    open,
    openDrawer,
    closeDrawer,
    toggleMode,
    setDockedWidth,
    initBreakpoint,
    syncBreakpoint,
    initCramped,
    syncCramped,
  }
}, {
  // v3: removed the 'floating' mode entirely. Bumping invalidates any v2
  // payload that may still hold mode='floating' or lastDesktopMode='floating'.
  persist: {
    key: 'blueprint-chart:panel:v3',
    pick: ['mode', 'dockedWidth', 'lastDesktopMode'],
  },
})

export function usePanel() {
  const store = usePanelStore()
  const {
    mode,
    dockedWidth,
    lastDesktopMode,
    narrow,
    cramped,
  } = storeToRefs(store)
  return {
    mode,
    dockedWidth,
    lastDesktopMode,
    narrow,
    cramped,
    dock: store.dock,
    close: store.close,
    open: store.open,
    openDrawer: store.openDrawer,
    closeDrawer: store.closeDrawer,
    toggleMode: store.toggleMode,
    setDockedWidth: store.setDockedWidth,
    initBreakpoint: store.initBreakpoint,
    syncBreakpoint: store.syncBreakpoint,
    initCramped: store.initCramped,
    syncCramped: store.syncCramped,
  }
}
