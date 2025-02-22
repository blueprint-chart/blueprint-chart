import { reactive, toRefs } from 'vue'

export interface ChartHighlight {
  target: string
  color: string
  label: string
}

export interface ChartConfig {
  chartType: string
  title: string
  description: string
  byline: string
  source: string
  sourceUrl: string
  sort: 'ascending' | 'descending' | 'none'
  data: string
  highlights: ChartHighlight[]
}

const defaults: ChartConfig = {
  chartType: 'bar-vertical',
  title: '',
  description: '',
  byline: '',
  source: '',
  sourceUrl: '',
  sort: 'none',
  data: '',
  highlights: [],
}

const state = reactive<ChartConfig>({ ...defaults })

export function useChartConfig() {
  return {
    ...toRefs(state),
    reset() {
      Object.assign(state, { ...defaults, highlights: [] })
    },
  }
}
