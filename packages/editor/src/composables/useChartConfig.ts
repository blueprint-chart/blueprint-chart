import { reactive, toRefs, computed, type Ref, type WritableComputedRef } from 'vue'
import type { AreaFillConfig, AnnotationConfig, SeriesOverride } from '@blueprint-chart/lib'
import { useScenes, type SceneOverride } from './useScenes'

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

type DirectSceneKey = 'chartType' | 'data' | 'highlights' | 'areaFills' | 'annotations' | 'seriesOverrides'

function sceneDirectRef<T>(baseRef: Ref<T>, sceneKey: DirectSceneKey): WritableComputedRef<T> {
  return computed({
    get(): T {
      const { activeScene } = useScenes()
      const scene = activeScene.value
      if (scene && sceneKey in scene && scene[sceneKey] !== undefined) {
        return scene[sceneKey] as unknown as T
      }
      return baseRef.value
    },
    set(val: T) {
      const { activeIndex, activeScene, update } = useScenes()
      if (activeIndex.value >= 0 && activeScene.value) {
        update(activeIndex.value, { [sceneKey]: val } as Partial<SceneOverride>)
        return
      }
      baseRef.value = val
    },
  })
}

function scenePropRef<T extends string>(baseRef: Ref<T>, propKey: string): WritableComputedRef<T> {
  return computed({
    get(): T {
      const { activeScene } = useScenes()
      const scene = activeScene.value
      if (scene?.properties && propKey in scene.properties) {
        return String(scene.properties[propKey]) as T
      }
      return baseRef.value
    },
    set(val: T) {
      const { activeIndex, activeScene, update } = useScenes()
      if (activeIndex.value >= 0 && activeScene.value) {
        const existing = activeScene.value.properties ?? {}
        update(activeIndex.value, { properties: { ...existing, [propKey]: val } })
        return
      }
      baseRef.value = val
    },
  })
}

export function useChartConfig() {
  const refs = toRefs(state)

  return {
    ...refs,
    // Scene-aware overrides (reads from scene when active, writes to scene when active)
    chartType: sceneDirectRef(refs.chartType, 'chartType'),
    data: sceneDirectRef(refs.data, 'data'),
    highlights: sceneDirectRef(refs.highlights, 'highlights'),
    areaFills: sceneDirectRef(refs.areaFills, 'areaFills'),
    annotations: sceneDirectRef(refs.annotations, 'annotations'),
    seriesOverrides: sceneDirectRef(refs.seriesOverrides, 'seriesOverrides'),
    title: scenePropRef(refs.title, 'title'),
    description: scenePropRef(refs.description, 'description'),
    byline: scenePropRef(refs.byline, 'byline'),
    source: scenePropRef(refs.source, 'source'),
    sourceUrl: scenePropRef(refs.sourceUrl, 'sourceUrl'),
    note: scenePropRef(refs.note, 'note'),
    sort: scenePropRef(refs.sort, 'sort'),
    sortMode: scenePropRef(refs.sortMode, 'sortMode'),
    // layout and selectedColumn stay as base refs (not scene-specific)
    _base: refs,
    reset() {
      Object.assign(state, { ...defaults, highlights: [], areaFills: [], annotations: [], seriesOverrides: [], layout: { ...layoutDefaults } })
    },
    hydrate(config: ChartConfig) {
      Object.assign(state, { ...config, layout: { ...layoutDefaults, ...config.layout } })
    },
  }
}
