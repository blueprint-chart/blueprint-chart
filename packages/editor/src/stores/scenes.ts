import type { ChartColorize } from '@/stores/chartConfig'
import type { ChartTypeOptions } from '@/stores/chartTypeOptions'
import type { TransformStep } from '@/stores/dataTransforms'
import type { AreaFillConfig, AnnotationConfig, SeriesOverride, HighlightConfig } from '@blueprint-chart/lib'

export interface AnnotationVisibility {
  action: 'hide' | 'show'
  kind: 'point' | 'range' | 'free'
  id: string
}

export interface SceneOverride {
  id: string
  name: string | null
  chartType?: string
  properties?: Record<string, string | number>
  data?: string
  chartTypeOptions?: Partial<ChartTypeOptions>
  colorizes?: ChartColorize[]
  highlights?: HighlightConfig[]
  areaFills?: AreaFillConfig[]
  annotations?: AnnotationConfig[]
  annotationVisibility?: AnnotationVisibility[]
  seriesOverrides?: SeriesOverride[]
  transforms?: TransformStep[]
  /** Resolved at render time by resolveScene — not stored */
  hiddenAnnotationIds?: Set<string>
}

export interface ScenesSnapshot {
  scenes: SceneOverride[]
  activeIndex: number
}

const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789'

function generateSceneId(): string {
  let id = ''
  for (let i = 0; i < 8; i++) {
    id += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return id
}

export const useScenesStore = defineStore('scenes', () => {
  const scenes = ref<SceneOverride[]>([])
  const activeIndex = shallowRef(-1)
  const playing = shallowRef(false)

  let playbackTimer: ReturnType<typeof setInterval> | null = null

  const activeScene = computed<SceneOverride | null>(() => {
    if (activeIndex.value < 0 || activeIndex.value >= scenes.value.length) {
      return null
    }
    return scenes.value[activeIndex.value]
  })

  function add(): string {
    const id = generateSceneId()
    scenes.value.push({ id, name: null })
    return id
  }

  function remove(index: number) {
    if (index < 0 || index >= scenes.value.length) {
      return
    }
    scenes.value.splice(index, 1)
    if (activeIndex.value >= scenes.value.length) {
      activeIndex.value = scenes.value.length > 0 ? scenes.value.length - 1 : -1
    }
    if (scenes.value.length === 0) {
      activeIndex.value = -1
    }
  }

  function update(index: number, partial: Partial<SceneOverride>) {
    if (index < 0 || index >= scenes.value.length) {
      return
    }
    scenes.value[index] = { ...scenes.value[index], ...partial }
  }

  function setActive(index: number) {
    if (index === activeIndex.value) {
      return
    }
    if (index === -1 || (index >= 0 && index < scenes.value.length)) {
      activeIndex.value = index
    }
  }

  // Intent-based navigation reads activeIndex synchronously, so rapid
  // bursts of clicks accumulate correctly (one scene per click).
  function nextScene() {
    setActive(activeIndex.value + 1)
  }

  function previousScene() {
    setActive(activeIndex.value - 1)
  }

  function reorder(from: number, to: number) {
    if (from < 0 || from >= scenes.value.length || to < 0 || to >= scenes.value.length) {
      return
    }
    const [item] = scenes.value.splice(from, 1)
    scenes.value.splice(to, 0, item)
    if (activeIndex.value === from) {
      activeIndex.value = to
    }
    else if (from < activeIndex.value && to >= activeIndex.value) {
      activeIndex.value--
    }
    else if (from > activeIndex.value && to <= activeIndex.value) {
      activeIndex.value++
    }
  }

  function startPlayback() {
    if (playing.value) {
      return
    }
    playing.value = true
    if (scenes.value.length === 0) {
      return
    }
    // Start from base (Scene 1)
    activeIndex.value = -1
    playbackTimer = setInterval(() => {
      if (activeIndex.value < scenes.value.length - 1) {
        activeIndex.value++
      }
      else {
        stopPlayback()
      }
    }, 3000)
  }

  function stopPlayback() {
    playing.value = false
    if (playbackTimer !== null) {
      clearInterval(playbackTimer)
      playbackTimer = null
    }
  }

  function reset() {
    stopPlayback()
    scenes.value = []
    activeIndex.value = -1
  }

  function snapshot(): ScenesSnapshot {
    return {
      scenes: scenes.value.map(s => ({ ...s })),
      activeIndex: activeIndex.value,
    }
  }

  function hydrate(data: ScenesSnapshot) {
    stopPlayback()
    scenes.value = data.scenes.map(s => ({ ...s }))
    activeIndex.value = data.activeIndex
  }

  return {
    scenes,
    activeIndex,
    playing,
    activeScene,
    add,
    remove,
    update,
    setActive,
    nextScene,
    previousScene,
    reorder,
    startPlayback,
    stopPlayback,
    reset,
    snapshot,
    hydrate,
  }
})

export function useScenes() {
  const store = useScenesStore()
  const { scenes, activeIndex, playing, activeScene } = storeToRefs(store)
  return {
    scenes,
    activeIndex,
    playing,
    activeScene,
    add: store.add,
    remove: store.remove,
    update: store.update,
    setActive: store.setActive,
    nextScene: store.nextScene,
    previousScene: store.previousScene,
    reorder: store.reorder,
    startPlayback: store.startPlayback,
    stopPlayback: store.stopPlayback,
    reset: store.reset,
    snapshot: store.snapshot,
    hydrate: store.hydrate,
  }
}
