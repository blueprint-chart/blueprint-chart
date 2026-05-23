import { computed } from 'vue'
import { recommendCharts, type ChartRecommendation } from '@blueprint-chart/lib'
import { useDataTable } from './useDataTable'

export type { ChartRecommendation } from '@blueprint-chart/lib'

export function useChartRecommendations() {
  const { displayRows, displayColumnTypes } = useDataTable()

  const dataSummary = computed(() => {
    const types = displayColumnTypes.value
    const strings = types.filter(t => t === 'string').length
    const numbers = types.filter(t => t === 'number').length
    const dates = types.filter(t => t === 'date').length
    const parts: string[] = []
    if (strings > 0) {
      parts.push(`${strings} categorical`)
    }
    if (dates > 0) {
      parts.push(`${dates} date`)
    }
    if (numbers > 0) {
      parts.push(`${numbers} numeric`)
    }
    return parts.length > 0 ? `${parts.join(' + ')} column${types.length !== 1 ? 's' : ''}` : 'No data'
  })

  const recommendations = computed<ChartRecommendation[]>(() =>
    recommendCharts(displayColumnTypes.value as Array<'string' | 'number' | 'date'>, displayRows.value.length),
  )

  return { recommendations, dataSummary }
}
