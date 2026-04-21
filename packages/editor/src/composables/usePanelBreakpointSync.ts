import { useBreakpoint } from '@blueprint-chart/ui'
import { usePanelStore } from '@/stores/panel'

// Wires useBreakpoint() into usePanelStore: seeds the initial narrow/wide
// snapshot, then forwards subsequent viewport transitions to the store. Call
// this once from a mount-stable component (e.g. LayoutShell) so the watcher
// lives for the lifetime of the app.
export function usePanelBreakpointSync() {
  const { isNarrow } = useBreakpoint()
  const store = usePanelStore()

  store.initBreakpoint(isNarrow.value)

  watch(isNarrow, (narrow) => {
    store.syncBreakpoint(narrow)
  })
}
