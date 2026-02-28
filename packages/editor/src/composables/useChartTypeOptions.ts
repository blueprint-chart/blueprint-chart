import { computed, reactive, watch } from 'vue'
import { useChartConfig } from './useChartConfig'
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
  const { chartType } = useChartConfig()

  const currentOptions = computed(() => {
    ensureDefaults(chartType.value)
    return store[chartType.value] ?? {}
  })

  const optionDefs = computed(() => getChartOptions(chartType.value))

  const availableOptionKeys = computed<ChartTypeOptionKey[]>(
    () => optionDefs.value.map(d => d.key as ChartTypeOptionKey),
  )

  function setOption<K extends ChartTypeOptionKey>(key: K, value: ChartTypeOptions[K]) {
    if (!store[chartType.value]) {
      store[chartType.value] = {}
    }
    store[chartType.value][key] = value
  }

  watch(chartType, (newType, oldType) => {
    ensureDefaults(newType)

    const oldEntry = store[oldType]
    if (!oldEntry) { return }

    const supported = getChartOptions(newType).map(d => d.key as ChartTypeOptionKey)
    if (supported.length === 0) { return }

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
    availableOptionKeys,
    optionDefs,
    setOption,
    reset,
    hydrate,
    store,
  }
}
