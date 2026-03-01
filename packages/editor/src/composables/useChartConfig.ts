import { reactive, toRefs } from 'vue'
import type { AreaFillConfig, AnnotationConfig, SeriesOverride } from '@blueprint-chart/lib'

export interface ChartHighlight {
  target: string
  color: string
  label: string
}

export interface ChartLayout {
  sizing: 'responsive' | 'fixed' | 'max-width'
  fixedWidth: number
  maxWidth: number
  heightMode: 'auto' | 'fixed' | 'aspect-ratio'
  fixedHeight: number
  aspectRatio: string
  padding: number
  transparentBackground: boolean
  showCredit: boolean
}

export const layoutDefaults: ChartLayout = {
  sizing: 'max-width',
  fixedWidth: 600,
  maxWidth: 660,
  heightMode: 'auto',
  fixedHeight: 400,
  aspectRatio: '16:9',
  padding: 24,
  transparentBackground: false,
  showCredit: true,
}

export interface ChartConfig {
  chartType: string
  title: string
  description: string
  byline: string
  source: string
  sourceUrl: string
  note: string
  sort: 'ascending' | 'descending' | 'none'
  sortMode: 'total' | 'within-groups' | 'none'
  data: string
  selectedColumn: string
  highlights: ChartHighlight[]
  areaFills: AreaFillConfig[]
  annotations: AnnotationConfig[]
  seriesOverrides: SeriesOverride[]
  layout: ChartLayout
}

const defaults: ChartConfig = {
  chartType: 'bar-vertical',
  title: '',
  description: '',
  byline: '',
  source: '',
  sourceUrl: '',
  note: '',
  sort: 'none',
  sortMode: 'none',
  data: '',
  selectedColumn: '',
  highlights: [],
  areaFills: [],
  annotations: [],
  seriesOverrides: [],
  layout: { ...layoutDefaults },
}

const state = reactive<ChartConfig>({ ...defaults })

export function useChartConfig() {
  return {
    ...toRefs(state),
    reset() {
      Object.assign(state, { ...defaults, highlights: [], areaFills: [], annotations: [], seriesOverrides: [], layout: { ...layoutDefaults } })
    },
    hydrate(config: ChartConfig) {
      Object.assign(state, { ...config, layout: { ...layoutDefaults, ...config.layout } })
    },
  }
}
