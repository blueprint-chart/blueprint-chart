import type { Ref, ComputedRef } from 'vue'
import { useTheme } from './useTheme'
import { parse, renderBpc, type RenderOptions } from '@blueprint-chart/lib'

const RESIZE_THROTTLE_MS = 150

export interface DslRenderOptions extends RenderOptions {}

export function parseDslSceneCount(bpc: string): number {
  if (!bpc) {
    return 0
  }
  return parse(bpc).scenes.length
}

/**
 * Parse a BPC DSL string and render the chart into a container element.
 * Thin wrapper over the lib `renderBpc`; kept here for editor call-site stability.
 */
export function renderDsl(
  container: HTMLElement,
  bpc: string,
  options?: DslRenderOptions,
): void {
  renderBpc(container, bpc, options)
}

/**
 * Reactive composable: render a BPC DSL string into a container.
 *
 * Reactive mode — re-renders when dsl or container changes:
 *   useChartFromDsl(containerRef, dslRef, options?)
 *
 * Imperative mode — returns applyDsl for manual control:
 *   const { applyDsl } = useChartFromDsl(containerRef, options?)
 */
export function useChartFromDsl(
  containerRef: Ref<HTMLElement | null>,
  dslOrOptions?: Ref<string> | ComputedRef<string> | DslRenderOptions,
  maybeOptions?: DslRenderOptions,
): { applyDsl: (bpc: string) => void } {
  const isReactive = isRef(dslOrOptions)
  const dslRef = isReactive ? (dslOrOptions as Ref<string>) : ref('')
  const options = isReactive ? maybeOptions : (dslOrOptions as DslRenderOptions | undefined)

  const { theme } = useTheme()

  function render() {
    if (!containerRef.value || !dslRef.value) {
      return
    }
    renderDsl(containerRef.value, dslRef.value, options)
  }

  const throttledRender = useThrottleFn(render, RESIZE_THROTTLE_MS)

  watch([containerRef, dslRef, theme], render, { immediate: true })
  useResizeObserver(containerRef, throttledRender)

  function applyDsl(bpc: string) {
    dslRef.value = bpc
  }

  return { applyDsl }
}
