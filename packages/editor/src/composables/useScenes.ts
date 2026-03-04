import { ref, computed } from 'vue'
import type { ChartHighlight } from './useChartConfig'
import type { ChartTypeOptions } from './useChartTypeOptions'
import type { TransformStep } from './useDataTransforms'
import type { AreaFillConfig, AnnotationConfig, SeriesOverride } from '@blueprint-chart/lib'

export interface SceneOverride {
  id: string
  name: string | null
  chartType?: string
  properties?: Record<string, string | number>
  data?: string
  chartTypeOptions?: Partial<ChartTypeOptions>
  highlights?: ChartHighlight[]
  areaFills?: AreaFillConfig[]
  annotations?: AnnotationConfig[]
  seriesOverrides?: SeriesOverride[]
  transforms?: TransformStep[]
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

const scenes = ref<SceneOverride[]>([])
const activeIndex = ref(-1)
const playing = ref(false)

let playbackTimer: ReturnType<typeof setInterval> | null = null

export function useScenes() {
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
    reorder,
    startPlayback,
    stopPlayback,
    reset,
    snapshot,
    hydrate,
  }
}
