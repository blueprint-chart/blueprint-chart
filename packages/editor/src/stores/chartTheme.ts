import { listThemes } from '@blueprint-chart/lib'

export interface ChartThemeOption {
  value: string
  label: string
  description?: string
}

export const chartThemeOptions: ChartThemeOption[] = listThemes().map(
  ({ name, label, description }) => ({ value: name, label, description }),
)

export const useChartThemeStore = defineStore('chartTheme', () => {
  const chartTheme = shallowRef<string>('blueprint')

  function reset() {
    chartTheme.value = 'blueprint'
  }

  return {
    chartTheme,
    chartThemeOptions,
    reset,
  }
})

export function useChartTheme() {
  const store = useChartThemeStore()
  const { chartTheme } = storeToRefs(store)
  return {
    chartTheme,
    availableThemes: chartThemeOptions,
    reset: store.reset,
  }
}
