export interface ChartThemeOption {
  value: string
  label: string
  description?: string
}

export const chartThemeOptions: ChartThemeOption[] = [
  { value: 'blueprint', label: 'Blueprint', description: 'The default Blueprint Chart theme' },
  { value: 'blueprint-framed', label: 'Blueprint Framed', description: 'Adds borders and a tinted footer' },
]

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
