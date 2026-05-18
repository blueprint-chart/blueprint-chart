import { useElementSize } from '@vueuse/core'
import type { MaybeRefOrGetter } from 'vue'
import { usePanelStore, CRAMPED_THRESHOLD } from '@/stores/panel'

// Watches the canvas element's width and forwards cramped transitions to
// usePanelStore. Parallel to usePanelBreakpointSync but driven by a
// ResizeObserver on the actual canvas, not a viewport matchMedia query.
// Call this once from a mount-stable component (e.g. PanelShell) so the
// watcher lives for the lifetime of the panel host.
export function usePanelCanvasSync(target: MaybeRefOrGetter<HTMLElement | null>) {
  const { width } = useElementSize(target)
  const store = usePanelStore()

  const cramped = computed(() =>
    width.value > 0 && width.value < CRAMPED_THRESHOLD,
  )

  store.initCramped(cramped.value)

  watch(cramped, (v) => {
    store.syncCramped(v)
  })

  return { canvasWidth: width }
}
