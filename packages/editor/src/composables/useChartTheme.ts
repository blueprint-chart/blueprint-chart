import { ref } from 'vue'

export interface ChartThemeOption {
  value: string
  label: string
  description?: string
}

const availableThemes: ChartThemeOption[] = [
  { value: 'blueprint', label: 'Blueprint', description: 'The default Blueprint Chart theme' },
]

const chartTheme = ref<string>('blueprint')

export function useChartTheme() {
  return { chartTheme, availableThemes }
}
