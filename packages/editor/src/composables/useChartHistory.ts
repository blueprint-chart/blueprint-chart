import { ref, computed, nextTick, watch, effectScope } from 'vue'
import { useChartConfig, type ChartConfig, layoutDefaults } from './useChartConfig'
import { useChartTypeOptions, type ChartTypeOptions } from './useChartTypeOptions'
import { useChartSession } from './useChartSession'

interface StateSnapshot {
  config: ChartConfig
  typeOptions: Record<string, Partial<ChartTypeOptions>>
}

const MAX_HISTORY = 100

interface SessionHistory {
  undoStack: string[]
  redoStack: string[]
  currentState: string
}

const historyMap = new Map<string, SessionHistory>()
const canUndo = ref(false)
const canRedo = ref(false)
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

function snapshotConfig(config: ChartConfig): ChartConfig {
  return {
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
    highlights: JSON.parse(JSON.stringify(config.highlights)),
    areaFills: JSON.parse(JSON.stringify(config.areaFills)),
    annotations: JSON.parse(JSON.stringify(config.annotations)),
    seriesOverrides: JSON.parse(JSON.stringify(config.seriesOverrides ?? [])),
    layout: JSON.parse(JSON.stringify(config.layout ?? layoutDefaults)),
  }
}

function takeSnapshot(config: ChartConfig, store: Record<string, Partial<ChartTypeOptions>>): string {
  const snapshot: StateSnapshot = {
    config: snapshotConfig(config),
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

function buildConfigSnapshot(chartConfig: ReturnType<typeof useChartConfig>): ChartConfig {
  return {
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
    highlights: chartConfig.highlights.value,
    areaFills: chartConfig.areaFills.value,
    annotations: chartConfig.annotations.value,
    seriesOverrides: chartConfig.seriesOverrides.value,
    layout: chartConfig.layout.value,
  }
}

function watchConfigSources(chartConfig: ReturnType<typeof useChartConfig>) {
  return [
    chartConfig.chartType, chartConfig.title, chartConfig.description,
    chartConfig.byline, chartConfig.note, chartConfig.source, chartConfig.sourceUrl,
    chartConfig.sort, chartConfig.data, chartConfig.selectedColumn,
    chartConfig.highlights, chartConfig.areaFills, chartConfig.annotations,
    chartConfig.layout,
  ]
}

function restoreSnapshot(
  json: string,
  chartConfig: ReturnType<typeof useChartConfig>,
  hydrateOptions: (s: Record<string, Partial<ChartTypeOptions>>) => void,
) {
  isRestoring = true
  const state: StateSnapshot = JSON.parse(json)
  chartConfig.hydrate(state.config)
  hydrateOptions(state.typeOptions)
  nextTick(() => {
    isRestoring = false
  })
}

function undoStep(
  chartConfig: ReturnType<typeof useChartConfig>,
  hydrateOptions: (s: Record<string, Partial<ChartTypeOptions>>) => void,
) {
  const h = historyMap.get(activeSessionId)
  if (!h || h.undoStack.length === 0) {
    return
  }
  h.redoStack.push(h.currentState)
  h.currentState = h.undoStack.pop()!
  updateFlags()
  restoreSnapshot(h.currentState, chartConfig, hydrateOptions)
}

function redoStep(
  chartConfig: ReturnType<typeof useChartConfig>,
  hydrateOptions: (s: Record<string, Partial<ChartTypeOptions>>) => void,
) {
  const h = historyMap.get(activeSessionId)
  if (!h || h.redoStack.length === 0) {
    return
  }
  h.undoStack.push(h.currentState)
  h.currentState = h.redoStack.pop()!
  updateFlags()
  restoreSnapshot(h.currentState, chartConfig, hydrateOptions)
}

export function useChartHistory() {
  const chartConfig = useChartConfig()
  const { store, hydrate: hydrateOptions } = useChartTypeOptions()
  const { sessionId } = useChartSession()
  const currentSnap = () => takeSnapshot(buildConfigSnapshot(chartConfig), store)

  if (!initialized) {
    initialized = true
    initializeWatchers(chartConfig, sessionId, store, currentSnap)
  }

  return {
    canUndo: computed(() => canUndo.value),
    canRedo: computed(() => canRedo.value),
    undo: () => undoStep(chartConfig, hydrateOptions),
    redo: () => redoStep(chartConfig, hydrateOptions),
  }
}

function initializeWatchers(
  chartConfig: ReturnType<typeof useChartConfig>,
  sessionId: ReturnType<typeof useChartSession>['sessionId'],
  store: Record<string, Partial<ChartTypeOptions>>,
  currentSnap: () => string,
) {
  // Use a detached effectScope so watchers survive component unmounts.
  const scope = effectScope(true)
  scope.run(() => {
    watchSessionSwitch(sessionId, currentSnap)
    watchConfigChanges(chartConfig, store, currentSnap)
  })
}

function watchSessionSwitch(
  sessionId: ReturnType<typeof useChartSession>['sessionId'],
  currentSnap: () => string,
) {
  // flush: 'sync' ensures this fires immediately when sessionId changes,
  // BEFORE the config watcher can fire.
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
}

function watchConfigChanges(
  chartConfig: ReturnType<typeof useChartConfig>,
  store: Record<string, Partial<ChartTypeOptions>>,
  currentSnap: () => string,
) {
  watch(
    [...watchConfigSources(chartConfig), () => JSON.stringify(store)],
    () => {
      if (isRestoring || !activeSessionId) {
        return
      }
      pushState(currentSnap())
    },
    { deep: true },
  )
}
