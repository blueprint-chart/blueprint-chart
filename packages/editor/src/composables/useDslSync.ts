import type { DslApplyResult } from '@/dsl-lang/diagnostics'
import { parseChartState } from '@/utils/chart/chartState'
import { useChartConfig } from './useChartConfig'
import { useChartThemeStore } from './useChartTheme'
import { useChartTypeOptions } from './useChartTypeOptions'
import { useDataTransforms } from '@/stores/dataTransforms'
import { useDataTable } from './useDataTable'
import { parseBpcData } from './useDataParser'
import { useScenes } from './useScenes'

export function useDslSync() {
  const config = useChartConfig()
  const themeStore = useChartThemeStore()
  const chartTheme = storeToRefs(themeStore).chartTheme
  const { store, ensureDefaults } = useChartTypeOptions()
  const transforms = useDataTransforms()
  const scenesComposable = useScenes()

  function applyDsl(dslString: string): DslApplyResult {
    try {
      const state = parseChartState(dslString)

      // Bypass scene-aware refs: all writes go to base state
      scenesComposable.setActive(-1)

      config.chartType.value = state.chartType
      config.title.value = state.title
      config.description.value = state.description
      config.altText.value = state.altText
      config.byline.value = state.byline
      config.note.value = state.note
      config.source.value = state.source
      config.sourceUrl.value = state.sourceUrl
      chartTheme.value = state.chartTheme
      config.layout.value = state.layout
      config.sort.value = state.sort
      config.data.value = state.data

      // Populate data table with parsed BPC data so scene transforms can reference columns
      if (state.data) {
        const dataTable = useDataTable()
        const parsed = parseBpcData(state.data)
        dataTable.loadParsed(parsed)
        dataTable.rawInput.value = state.data
        dataTable.sourceFormat.value = 'bpc'
      }

      store[state.chartType] = state.optionOverrides
      // Populate any defaults not present in the DSL so that baseOptions/currentOptions
      // computeds remain pure readers — no side-effects inside a computed getter.
      ensureDefaults(state.chartType)

      config.colorizes.value = state.colorizes
      config.highlights.value = state.highlights
      config.areaFills.value = state.areaFills
      config.annotations.value = state.annotations
      config.seriesOverrides.value = state.seriesOverrides

      transforms.reset()
      for (const t of state.transforms) {
        transforms.addStep(t.type, t.config)
      }

      if (state.scenes.length) {
        // Reuse existing scene ids by position so re-parsing the same DSL keeps
        // stable identities (a random id per parse churned references on every
        // keystroke). New scenes fall back to a deterministic positional id.
        const prevSceneIds = scenesComposable.scenes.value.map(s => s.id)
        const scenes = state.scenes.map((scene, i) => ({ ...scene, id: prevSceneIds[i] ?? scene.id }))
        scenesComposable.hydrate({ scenes, activeIndex: -1 })
      }
      else {
        scenesComposable.reset()
      }

      return { success: true }
    }
    catch (err) {
      const loc = (err && typeof err === 'object' && 'location' in err)
        ? (err as { location?: { start?: { line: number, column: number } } }).location?.start
        : undefined
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
        location: loc ? { line: loc.line, column: loc.column } : undefined,
      }
    }
  }

  return { applyDsl }
}
