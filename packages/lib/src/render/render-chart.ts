import type { ChartDefinition, RenderOptions } from './types'
import type { FrameOptions } from '../charts/types'
import { resolveScene } from './resolve-scene'
import { applyLayoutConstraints } from './layout-constraints'
import { snapshotIfTypeChanged, commitCrossTypeFade, clearCrossTypeMarker } from './cross-type-fade'
import { applyPostRender } from './post-render'
import { getChart } from '../charts/registry'
import { buildChartOptions } from '../charts/chart-helpers'
import { resolveBackgroundColor } from '../charts/contrast'
import { getSceneTransition } from '../transitions'
import { getDefaultTransitionMs } from '../charts/motion'

export function renderChart(
  container: HTMLElement,
  definition: ChartDefinition,
  options: RenderOptions = {},
): void {
  if (!options.transition) {
    // Cancel any in-flight scene transition before wiping the DOM, otherwise its
    // element-bound tweens keep ticking against detached nodes and the
    // orchestrator stays `animating` (so the next featureJoin snaps instead of
    // buffering). interrupt() is idempotent/safe when idle.
    getSceneTransition(container).interrupt()
    container.replaceChildren()
    clearCrossTypeMarker(container)
  }

  // S4: even with transition=true, an empty data set must clear stale DOM.
  // Without this, a previous chart would linger when scenes/state cycle into
  // an empty-data state.
  if (definition.data.labels.length === 0) {
    if (options.transition) {
      getSceneTransition(container).interrupt()
      container.replaceChildren()
      clearCrossTypeMarker(container)
    }
    return
  }

  // S8: stripColors must strip color keys from BOTH `properties` (the raw AST
  // pass-through) AND `options` (the pre-resolved chart-type options), because
  // resolveScene prefers `def.options` when present.
  let filteredDef: ChartDefinition = definition
  if (options.stripColors) {
    const next: ChartDefinition = { ...definition }
    if (definition.properties) {
      next.properties = definition.properties.filter(p => p.key !== 'colors' && p.key !== 'colorPalette')
    }
    if (definition.options) {
      const { colors: _colors, colorPalette: _colorPalette, ...rest } = definition.options as Record<string, unknown>
      next.options = rest
    }
    filteredDef = next
  }

  const layout = applyLayoutConstraints(container, filteredDef.properties, options)
  const state = resolveScene(filteredDef, options.sceneIndex)

  const renderer = getChart(state.chartType)
  if (!renderer) {
    return
  }

  const overlay = snapshotIfTypeChanged(container, state.chartType, !!options.transition)
  if (overlay) {
    container.replaceChildren()
  }

  const bg = resolveBackgroundColor(container)
  const chartOpts = buildChartOptions(state.options, bg, state.chartType)

  // Frame: thumbnail mode strips frame entirely (null = frameless).
  // Otherwise: always produce a frame with at least padding so the .bc-frame
  // element exists for theme class application and consistent styling, even
  // for BPCs that set no title/description/etc.
  let frame: FrameOptions | null
  if (options.thumbnail) {
    frame = null
  }
  else {
    const padding = state.frame?.padding ?? options.padding ?? '16px'
    frame = { ...(state.frame ?? {}), padding }
  }

  const orch = getSceneTransition(container)
  if (options.transition) {
    orch.beginCommit()
  }

  renderer(container, state.data, {
    frame,
    sort: state.sort,
    sortMode: state.sortMode,
    ...chartOpts,
    colorizes: state.colorizes.length > 0 ? state.colorizes : undefined,
    highlights: state.highlights.length > 0 ? state.highlights : undefined,
    areaFills: state.areaFills.length > 0 ? state.areaFills : undefined,
    annotations: state.annotations.length > 0 ? state.annotations : undefined,
    seriesOverrides: state.seriesOverrides.length > 0 ? state.seriesOverrides : undefined,
  }, !!options.transition)

  if (options.transition) {
    // Run the orchestrator clock at the per-renderer mark duration so every
    // feature (marks, frame geometry, annotations) eases together.
    orch.commit({ duration: getDefaultTransitionMs(), mode: options.transitionMode })
  }

  const theme = options.theme ?? state.theme
  applyPostRender(container, { theme }, layout)
  commitCrossTypeFade(container, state.chartType, overlay)
}
