import { computed, reactive, watch } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { useChartConfig, deepEqual } from '@/stores/chartConfig'
import { useScenes } from '@/stores/scenes'
import { getChartOptions } from '@blueprint-chart/lib'
import type { ChartOptionDef, ChartTypeOptions, ChartTypeOptionKey } from '@blueprint-chart/lib'

export type { LineStyle, ChartTypeOptions, ChartTypeOptionKey } from '@blueprint-chart/lib'
export type OptionDef = ChartOptionDef

export function getOptionDefs(chartType: string): ChartOptionDef[] {
  return getChartOptions(chartType)
}

// Non-reactive defaults cache — populated lazily per chart type.
// Keeping defaults here (outside the reactive Pinia store) ensures that
// baseOptions / currentOptions computed getters never write to reactive
// state during evaluation, which would trigger recursive Vue updates.
const defaultsCache: Record<string, Partial<ChartTypeOptions>> = Object.create(null)

function getDefaults(type: string): Partial<ChartTypeOptions> {
  if (!defaultsCache[type]) {
    const cache: Partial<ChartTypeOptions> = {}
    for (const def of getChartOptions(type)) {
      if (def.default !== undefined) {
        (cache as Record<string, unknown>)[def.key] = def.default
      }
    }
    defaultsCache[type] = cache
  }
  return defaultsCache[type]
}

export const useChartTypeOptionsStore = defineStore('chartTypeOptions', () => {
  // Reactive store contains explicit overrides only (no defaults).
  // Defaults are merged in by the computed getters via getDefaults().
  const store = reactive<Record<string, Partial<ChartTypeOptions>>>({})

  function ensureDefaults(type: string): void {
    // Prime the non-reactive defaults cache for this type.
    getDefaults(type)
    // Ensure a store entry exists so callers can write into it.
    if (!store[type]) {
      store[type] = {}
    }
  }

  const { chartType, _base } = useChartConfig()

  const currentOptions = computed(() => {
    // Pure read: merge non-reactive defaults with explicit reactive overrides.
    // No writes to reactive state here — prevents recursive update cycles.
    const defaults = getDefaults(chartType.value)
    const explicit = store[chartType.value] ?? {}
    // Don't let a default colorPalette appear when colors are explicitly set —
    // the renderer should use explicit colors, not the palette default.
    const base = (explicit.colors as string[] | undefined)?.length
      ? { ...defaults, colorPalette: undefined, ...explicit }
      : { ...defaults, ...explicit }
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
    const defaults = getDefaults(_base.chartType.value)
    const explicit = store[_base.chartType.value] ?? {}
    return (explicit.colors as string[] | undefined)?.length
      ? { ...defaults, colorPalette: undefined, ...explicit }
      : { ...defaults, ...explicit }
  })

  const optionDefs = computed(() => getChartOptions(chartType.value))

  const availableOptionKeys = computed<ChartTypeOptionKey[]>(
    () => optionDefs.value.map(d => d.key as ChartTypeOptionKey),
  )

  function setOption<K extends ChartTypeOptionKey>(key: K, value: ChartTypeOptions[K]) {
    const { activeIndex, activeScene, scenes: allScenes } = useScenes()
    if (activeIndex.value >= 0 && activeScene.value) {
      // Compute the inherited value: walk prior scenes, then fall back to explicit base.
      // Intentionally uses explicit store only (not defaults) so that setting a value
      // equal to the default is still treated as an explicit scene override.
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

    const { activeIndex, activeScene, scenes: allScenes } = useScenes()
    const isScene = activeIndex.value >= 0 && activeScene.value != null

    // Resolve the effective old options: explicit base + inherited scene overrides
    let oldEffective: Partial<ChartTypeOptions>
    if (isScene) {
      let merged: Partial<ChartTypeOptions> = { ...(store[oldType] ?? {}) }
      for (let i = 0; i <= activeIndex.value; i++) {
        const sceneOpts = allScenes.value[i]?.chartTypeOptions
        if (sceneOpts) {
          merged = { ...merged, ...sceneOpts }
        }
      }
      oldEffective = merged
    }
    else {
      oldEffective = store[oldType] ?? {}
    }

    if (Object.keys(oldEffective).length === 0) {
      return
    }

    const supported = getChartOptions(newType).map(d => d.key as ChartTypeOptionKey)
    if (supported.length === 0) {
      return
    }

    // Resolve what the new type already has (base + scene)
    const newBase = store[newType] ?? {}

    for (const key of supported) {
      if (!(key in oldEffective)) {
        continue
      }

      if (isScene) {
        // Write to scene chartTypeOptions if the new type doesn't already have this key
        const sceneOpts = activeScene.value!.chartTypeOptions ?? {}
        if (!(key in sceneOpts) && !(key in newBase)) {
          const val = oldEffective[key]
          const copy = Array.isArray(val) ? [...val] : val
          allScenes.value[activeIndex.value] = {
            ...activeScene.value!,
            chartTypeOptions: { ...sceneOpts, [key]: copy },
          }
        }
      }
      else {
        // Write to base store
        if (!(key in newBase)) {
          const val = oldEffective[key]
          const target = store[newType] as Partial<ChartTypeOptions>
          if (Array.isArray(val)) {
            (target[key] as ChartTypeOptions[typeof key]) = [...val] as ChartTypeOptions[typeof key]
          }
          else {
            (target[key] as ChartTypeOptions[typeof key]) = val as ChartTypeOptions[typeof key]
          }
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
    ensureDefaults,
    reset,
    hydrate,
    store,
  }
})

export function useChartTypeOptions() {
  const piniaStore = useChartTypeOptionsStore()
  const { currentOptions, baseOptions, availableOptionKeys, optionDefs } = storeToRefs(piniaStore)
  return {
    currentOptions,
    baseOptions,
    availableOptionKeys,
    optionDefs,
    setOption: piniaStore.setOption,
    ensureDefaults: piniaStore.ensureDefaults,
    reset: piniaStore.reset,
    hydrate: piniaStore.hydrate,
    store: piniaStore.store,
  }
}
