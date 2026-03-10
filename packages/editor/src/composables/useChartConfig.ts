import { reactive, toRefs, computed, type Ref, type WritableComputedRef } from 'vue'
import type { AreaFillConfig, AnnotationConfig, SeriesOverride } from '@blueprint-chart/lib'
import { useScenes, type SceneOverride } from './useScenes'

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true
  }
  if (a == null || b == null) {
    return false
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false
    }
    return a.every((v, i) => deepEqual(v, b[i]))
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a as Record<string, unknown>)
    const keysB = Object.keys(b as Record<string, unknown>)
    if (keysA.length !== keysB.length) {
      return false
    }
    return keysA.every(k =>
      deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]),
    )
  }
  return false
}

/**
 * Compute the effective inherited value for a direct scene key.
 * Walks prior scenes (like resolveScene) to find the last override,
 * falling back to the base value.
 */
function isNonEmptyOverride(val: unknown): boolean {
  if (val === undefined) {
    return false
  }
  if (Array.isArray(val) && val.length === 0) {
    return false
  }
  return true
}

function inheritedDirectValue<T>(baseVal: T, sceneKey: DirectSceneKey, scenes: SceneOverride[], activeIndex: number): T {
  for (let i = activeIndex - 1; i >= 0; i--) {
    const s = scenes[i]
    if (s && sceneKey in s && isNonEmptyOverride(s[sceneKey])) {
      return s[sceneKey] as unknown as T
    }
  }
  return baseVal
}

/**
 * Compute the effective inherited value for a property key.
 * Walks prior scenes to find the last property override,
 * falling back to the base value.
 */
function inheritedPropValue<T extends string>(baseVal: T, propKey: string, scenes: SceneOverride[], activeIndex: number): T {
  for (let i = activeIndex - 1; i >= 0; i--) {
    const s = scenes[i]
    if (s?.properties && propKey in s.properties) {
      return String(s.properties[propKey]) as T
    }
  }
  return baseVal
}

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
  playerType: 'buttons' | 'progress-bar' | 'dot-stepper' | 'minimal-arrows' | 'none'
  playerPosition: 'left' | 'center' | 'right'
}

export const layoutDefaults: ChartLayout = {
  sizing: 'max-width',
  fixedWidth: 600,
  maxWidth: 660,
  heightMode: 'auto',
  fixedHeight: 400,
  aspectRatio: '16:9',
  padding: 16,
  transparentBackground: false,
  showCredit: true,
  playerType: 'buttons',
  playerPosition: 'left',
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
      const { activeScene, activeIndex, scenes: allScenes } = useScenes()
      const scene = activeScene.value
      if (scene && sceneKey in scene && isNonEmptyOverride(scene[sceneKey])) {
        return scene[sceneKey] as unknown as T
      }
      if (activeIndex.value >= 0) {
        return inheritedDirectValue(baseRef.value, sceneKey, allScenes.value, activeIndex.value)
      }
      return baseRef.value
    },
    set(val: T) {
      const { activeIndex, activeScene, update, scenes: allScenes } = useScenes()
      if (activeIndex.value >= 0 && activeScene.value) {
        const inherited = inheritedDirectValue(baseRef.value, sceneKey, allScenes.value, activeIndex.value)
        if (deepEqual(val, inherited)) {
          // Value matches inherited — remove the override
          const compacted = { ...activeScene.value }
          delete (compacted as Record<string, unknown>)[sceneKey]
          allScenes.value[activeIndex.value] = compacted
        }
        else {
          update(activeIndex.value, { [sceneKey]: val } as Partial<SceneOverride>)
        }
        return
      }
      baseRef.value = val
    },
  })
}

function scenePropRef<T extends string>(baseRef: Ref<T>, propKey: string): WritableComputedRef<T> {
  return computed({
    get(): T {
      const { activeScene, activeIndex, scenes: allScenes } = useScenes()
      const scene = activeScene.value
      if (scene?.properties && propKey in scene.properties) {
        return String(scene.properties[propKey]) as T
      }
      if (activeIndex.value >= 0) {
        return inheritedPropValue(baseRef.value, propKey, allScenes.value, activeIndex.value)
      }
      return baseRef.value
    },
    set(val: T) {
      const { activeIndex, activeScene, update, scenes: allScenes } = useScenes()
      if (activeIndex.value >= 0 && activeScene.value) {
        const inherited = inheritedPropValue(baseRef.value, propKey, allScenes.value, activeIndex.value)
        if (val === inherited) {
          // Value matches inherited — remove the property override
          const existing = { ...activeScene.value.properties }
          delete existing[propKey]
          const props = Object.keys(existing).length > 0 ? existing : undefined
          const compacted = { ...activeScene.value, properties: props }
          if (!props) {
            delete (compacted as Record<string, unknown>).properties
          }
          allScenes.value[activeIndex.value] = compacted
        }
        else {
          const existing = activeScene.value.properties ?? {}
          update(activeIndex.value, { properties: { ...existing, [propKey]: val } })
        }
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
