import { useChartConfig, type ChartConfig, layoutDefaults } from '@/stores/chartConfig'
import { useChartTypeOptions, type ChartTypeOptions } from '@/stores/chartTypeOptions'
import { useChartSession } from '@/stores/chartSession'

export interface StateSnapshot {
  config: ChartConfig
  typeOptions: Record<string, Partial<ChartTypeOptions>>
}

const MAX_HISTORY = 100

interface SessionHistory {
  undoStack: string[]
  redoStack: string[]
  currentState: string
}

export const useChartHistoryStore = defineStore('chartHistory', () => {
  const historyMap = new Map<string, SessionHistory>()
  const canUndo = shallowRef(false)
  const canRedo = shallowRef(false)
  let activeSessionId = ''
  let isRestoring = false
  let initialized = false

  function getHistory(id: string): SessionHistory {
    let h = historyMap.get(id)
    if (!h) {
      h = { undoStack: [], redoStack: [], currentState: '' }
      historyMap.set(id, h)
    }
    return h
  }

  function takeSnapshot(config: ChartConfig, store: Record<string, Partial<ChartTypeOptions>>): string {
    const snapshot: StateSnapshot = {
      config: {
        chartType: config.chartType,
        title: config.title,
        description: config.description,
        byline: config.byline,
        note: config.note,
        source: config.source,
        sourceUrl: config.sourceUrl,
        sort: config.sort,
        data: config.data,
        selectedColumn: config.selectedColumn,
        colorizes: JSON.parse(JSON.stringify(config.colorizes)),
        highlights: JSON.parse(JSON.stringify(config.highlights)),
        areaFills: JSON.parse(JSON.stringify(config.areaFills)),
        annotations: JSON.parse(JSON.stringify(config.annotations)),
        seriesOverrides: JSON.parse(JSON.stringify(config.seriesOverrides ?? [])),
        layout: JSON.parse(JSON.stringify(config.layout ?? layoutDefaults)),
      },
      typeOptions: JSON.parse(JSON.stringify(store)),
    }
    return JSON.stringify(snapshot)
  }

  function updateFlags() {
    const h = historyMap.get(activeSessionId)
    canUndo.value = h ? h.undoStack.length > 0 : false
    canRedo.value = h ? h.redoStack.length > 0 : false
  }

  function pushState(state: string) {
    const h = getHistory(activeSessionId)
    if (state === h.currentState) {
      return
    }
    h.undoStack.push(h.currentState)
    if (h.undoStack.length > MAX_HISTORY) {
      h.undoStack.shift()
    }
    h.redoStack.length = 0
    h.currentState = state
    updateFlags()
  }

  function init() {
    const chartConfig = useChartConfig()
    const { store, hydrate: hydrateOptions } = useChartTypeOptions()
    const { sessionId } = useChartSession()

    function currentSnap(): string {
      return takeSnapshot({
        chartType: chartConfig.chartType.value,
        title: chartConfig.title.value,
        description: chartConfig.description.value,
        byline: chartConfig.byline.value,
        note: chartConfig.note.value,
        source: chartConfig.source.value,
        sourceUrl: chartConfig.sourceUrl.value,
        sort: chartConfig.sort.value,
        data: chartConfig.data.value,
        selectedColumn: chartConfig.selectedColumn.value,
        colorizes: chartConfig.colorizes.value,
        highlights: chartConfig.highlights.value,
        areaFills: chartConfig.areaFills.value,
        annotations: chartConfig.annotations.value,
        seriesOverrides: chartConfig.seriesOverrides.value,
        layout: chartConfig.layout.value,
      }, store)
    }

    if (!initialized) {
      initialized = true

      // Use a detached effectScope so watchers survive component unmounts.
      // Without this, Vue stops the watchers when the first component that
      // calls useChartHistory() is destroyed, and the `initialized` guard
      // prevents them from being recreated on the next mount.
      const scope = effectScope(true)
      scope.run(() => {
        // Switch history when session changes.
        // flush: 'sync' ensures this fires immediately when sessionId changes,
        // BEFORE the config watcher can fire. This prevents chart B's hydrated
        // data from being pushed into chart A's history when loading a new chart
        // (useChartSession.load() hydrates config before setting sessionId).
        watch(sessionId, (newId) => {
          isRestoring = true
          activeSessionId = newId
          if (newId) {
            const h = getHistory(newId)
            if (!h.currentState) {
              h.currentState = currentSnap()
            }
          }
          updateFlags()
          nextTick(() => {
            isRestoring = false
          })
        }, { immediate: true, flush: 'sync' })

        watch(
          [
            chartConfig.chartType, chartConfig.title, chartConfig.description,
            chartConfig.byline, chartConfig.note, chartConfig.source, chartConfig.sourceUrl,
            chartConfig.sort, chartConfig.data, chartConfig.selectedColumn,
            chartConfig.colorizes, chartConfig.highlights, chartConfig.areaFills, chartConfig.annotations,
            chartConfig.layout,
            () => JSON.stringify(store),
          ],
          () => {
            if (isRestoring || !activeSessionId) {
              return
            }
            pushState(currentSnap())
          },
          { deep: true },
        )
      })
    }

    function restoreSnapshot(json: string) {
      isRestoring = true
      const state: StateSnapshot = JSON.parse(json)
      chartConfig.hydrate(state.config)
      hydrateOptions(state.typeOptions)
      nextTick(() => {
        isRestoring = false
      })
    }

    function undo() {
      const h = historyMap.get(activeSessionId)
      if (!h || h.undoStack.length === 0) {
        return
      }
      h.redoStack.push(h.currentState)
      h.currentState = h.undoStack.pop()!
      updateFlags()
      restoreSnapshot(h.currentState)
    }

    function redo() {
      const h = historyMap.get(activeSessionId)
      if (!h || h.redoStack.length === 0) {
        return
      }
      h.undoStack.push(h.currentState)
      h.currentState = h.redoStack.pop()!
      updateFlags()
      restoreSnapshot(h.currentState)
    }

    return { undo, redo }
  }

  return {
    canUndo: computed(() => canUndo.value),
    canRedo: computed(() => canRedo.value),
    init,
  }
})

export function useChartHistory() {
  const store = useChartHistoryStore()
  const { canUndo, canRedo } = storeToRefs(store)
  const { undo, redo } = store.init()
  return {
    canUndo,
    canRedo,
    undo,
    redo,
  }
}
