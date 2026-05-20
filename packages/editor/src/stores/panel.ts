export type PanelMode = 'docked' | 'floating' | 'closed' | 'drawer'
export type DesktopPanelMode = 'docked' | 'floating' | 'closed'

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
  const floatingPosition = ref({ x: -1, y: 16 })
  const floatingSize = shallowRef({ width: 340, height: 500 })
  const lastDesktopMode = shallowRef<DesktopPanelMode>('docked')
  // Tracks whether the viewport is currently narrow. Not persisted — always
  // re-derived from useBreakpoint() at runtime via usePanelBreakpointSync().
  // While narrow, desktop-mode actions keep lastDesktopMode locked so that a
  // narrow→wide transition restores the pre-narrow desktop mode.
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

  function float() {
    mode.value = 'floating'
    if (!narrow.value) {
      lastDesktopMode.value = 'floating'
    }
  }

  function close() {
    mode.value = 'closed'
    if (!narrow.value) {
      lastDesktopMode.value = 'closed'
    }
  }

  // Re-opens the panel from 'closed' to the last remembered desktop mode
  // (falling back to 'docked' when lastDesktopMode is also 'closed'). No-op
  // in any other mode — the panel is already open (or in drawer/narrow).
  function open() {
    if (mode.value !== 'closed') {
      return
    }
    const restore: DesktopPanelMode = lastDesktopMode.value === 'closed'
      ? 'docked'
      : lastDesktopMode.value
    mode.value = restore
    if (!narrow.value) {
      lastDesktopMode.value = restore
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

  function toggleMode() {
    if (mode.value === 'docked') {
      float()
    }
    else if (mode.value === 'floating') {
      dock()
    }
    else if (mode.value === 'closed') {
      const restore: DesktopPanelMode = lastDesktopMode.value === 'closed'
        ? 'docked'
        : lastDesktopMode.value
      mode.value = restore
      lastDesktopMode.value = restore
    }
  }

  // Accepts a viewport-relative fraction in (0..1]. Values <= 0 fall back
  // to the default. Pixel min/max are not enforced here — render-time code
  // (PanelDocked) clamps against MIN/MAX/canvas to keep the stored fraction
  // intact across window resizes.
  function setDockedWidth(next: number) {
    if (!Number.isFinite(next) || next <= 0) {
      dockedWidth.value = DEFAULT_DOCKED_WIDTH_FRACTION
      return
    }
    dockedWidth.value = Math.min(1, next)
  }

  // Applies the initial breakpoint snapshot (e.g. on app mount). If narrow,
  // forces mode to 'drawer' but preserves lastDesktopMode so a persisted
  // desktop preference survives a page load on a mobile viewport. If wide
  // and the persisted mode is 'drawer' (i.e. last session was narrow), the
  // mode is coerced to lastDesktopMode so the drawer doesn't leak onto
  // desktop reloads. lastDesktopMode defaults to 'docked' when absent.
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

  // Applies a viewport transition. wide→narrow captures the current mode
  // into lastDesktopMode; narrow→wide restores mode from lastDesktopMode.
  // A call matching the current narrow state is a no-op so that incidental
  // matchMedia events don't clobber state.
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

  // Applies the initial cramped snapshot (e.g. on app mount). If cramped and
  // mode is not already 'closed' or 'drawer' (drawer means narrow already
  // owns mode), forces mode to 'closed'. lastDesktopMode is preserved because
  // the persisted mode it captures is exactly the desktop preference we want
  // to restore when the window grows back. Mirrors initBreakpoint.
  function initCramped(isCramped: boolean) {
    cramped.value = isCramped
    if (isCramped && mode.value !== 'closed' && mode.value !== 'drawer') {
      mode.value = 'closed'
    }
  }

  // Applies a viewport-canvas transition. wide→cramped captures the current
  // mode into lastDesktopMode (unless already closed/drawer) and sets closed.
  // cramped→wide restores mode from lastDesktopMode. While narrow, only the
  // flag is updated — the narrow axis owns mode-switching.
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
    floatingPosition,
    floatingSize,
    lastDesktopMode,
    narrow,
    cramped,
    dock,
    float,
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
  // floatingPosition and floatingSize are intentionally excluded from
  // persistence: a saved x/y/width/height becomes invalid after the user
  // resizes the window or moves between monitors, which can leave the
  // floating panel off-screen on the next load. Resetting them to defaults
  // each session keeps the panel predictably reachable.
  persist: {
    // v2: dockedWidth is now a viewport fraction (0..1), not pixels.
    // Bumping the key invalidates any v1 pixel value that would otherwise
    // rehydrate as an out-of-range fraction.
    key: 'blueprint-chart:panel:v2',
    pick: ['mode', 'dockedWidth', 'lastDesktopMode'],
  },
})

export function usePanel() {
  const store = usePanelStore()
  const {
    mode,
    dockedWidth,
    floatingPosition,
    floatingSize,
    lastDesktopMode,
    narrow,
    cramped,
  } = storeToRefs(store)
  return {
    mode,
    dockedWidth,
    floatingPosition,
    floatingSize,
    lastDesktopMode,
    narrow,
    cramped,
    dock: store.dock,
    float: store.float,
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
