import { computed, reactive, watch } from 'vue'
import { useChartConfig, deepEqual } from './useChartConfig'
import { useScenes } from './useScenes'
import { getChartOptions } from '@blueprint-chart/lib'
import type { ChartOptionDef, ChartTypeOptions, ChartTypeOptionKey } from '@blueprint-chart/lib'

export type { LineStyle, ChartTypeOptions, ChartTypeOptionKey } from '@blueprint-chart/lib'

const store = reactive<Record<string, Partial<ChartTypeOptions>>>({})

export function getOptionDefs(chartType: string): ChartOptionDef[] {
  return getChartOptions(chartType)
}

function ensureDefaults(type: string): void {
  if (!store[type]) {
    store[type] = {}
  }
  const defs = getChartOptions(type)
  for (const def of defs) {
    const key = def.key as ChartTypeOptionKey
    if (def.default !== undefined && !(key in store[type]!)) {
      (store[type] as Partial<ChartTypeOptions>)[key] = def.default as ChartTypeOptions[typeof key]
    }
  }
}

export function useChartTypeOptions() {
  const { chartType, _base } = useChartConfig()

  const currentOptions = computed(() => {
    ensureDefaults(chartType.value)
    const base = store[chartType.value] ?? {}
    const { activeScene, activeIndex, scenes: allScenes } = useScenes()
    if (activeIndex.value >= 0) {
      // Merge inherited options from prior scenes, then own overrides
      let merged = { ...base }
      for (let i = 0; i <= activeIndex.value; i++) {
        const sceneOpts = allScenes.value[i]?.chartTypeOptions
        if (sceneOpts) {
          merged = { ...merged, ...sceneOpts }
        }
      }
      return merged
    }
    if (activeScene.value?.chartTypeOptions) {
      return { ...base, ...activeScene.value.chartTypeOptions }
    }
    return base
  })

  const baseOptions = computed(() => {
    const baseType = _base.chartType.value
    ensureDefaults(baseType)
    return store[baseType] ?? {}
  })

  const optionDefs = computed(() => getChartOptions(chartType.value))

  const availableOptionKeys = computed<ChartTypeOptionKey[]>(
    () => optionDefs.value.map(d => d.key as ChartTypeOptionKey),
  )

  function setOption<K extends ChartTypeOptionKey>(key: K, value: ChartTypeOptions[K]) {
    const { activeIndex, activeScene, scenes: allScenes } = useScenes()
    if (activeIndex.value >= 0 && activeScene.value) {
      // Compute the inherited value: walk prior scenes, then fall back to base
      const base = store[chartType.value] ?? {}
      let inherited: unknown = base[key]
      for (let i = activeIndex.value - 1; i >= 0; i--) {
        const prev = allScenes.value[i]?.chartTypeOptions
        if (prev && key in prev) {
          inherited = prev[key]
          break
        }
      }

      if (deepEqual(value, inherited)) {
        // Value matches inherited — remove the key from scene options
        const existing = { ...activeScene.value.chartTypeOptions }
        delete existing[key]
        const opts = Object.keys(existing).length > 0 ? existing : undefined
        const compacted = { ...activeScene.value }
        if (opts) {
          compacted.chartTypeOptions = opts
        }
        else {
          delete compacted.chartTypeOptions
        }
        allScenes.value[activeIndex.value] = compacted
      }
      else {
        const existing = activeScene.value.chartTypeOptions ?? {}
        allScenes.value[activeIndex.value] = {
          ...activeScene.value,
          chartTypeOptions: { ...existing, [key]: value },
        }
      }
      return
    }
    if (!store[chartType.value]) {
      store[chartType.value] = {}
    }
    store[chartType.value][key] = value
  }

  watch(chartType, (newType, oldType) => {
    ensureDefaults(newType)

    const oldEntry = store[oldType]
    if (!oldEntry) {
      return
    }

    const supported = getChartOptions(newType).map(d => d.key as ChartTypeOptionKey)
    if (supported.length === 0) {
      return
    }

    for (const key of supported) {
      if (key in oldEntry && !(key in store[newType]!)) {
        const val = oldEntry[key]
        const target = store[newType] as Partial<ChartTypeOptions>
        if (Array.isArray(val)) {
          (target[key] as ChartTypeOptions[typeof key]) = [...val] as ChartTypeOptions[typeof key]
        }
        else {
          (target[key] as ChartTypeOptions[typeof key]) = val as ChartTypeOptions[typeof key]
        }
      }
    }
  }, { flush: 'sync' })

  function reset() {
    for (const key of Object.keys(store)) {
      delete store[key]
    }
  }

  function hydrate(snapshot: Record<string, Partial<ChartTypeOptions>>) {
    reset()
    for (const [key, value] of Object.entries(snapshot)) {
      store[key] = value
    }
  }

  return {
    currentOptions,
    baseOptions,
    availableOptionKeys,
    optionDefs,
    setOption,
    reset,
    hydrate,
    store,
  }
}
