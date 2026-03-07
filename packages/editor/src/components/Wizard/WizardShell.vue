<template>
  <div class="wizard-shell">
    <div class="wizard-shell__content">
      <DataPanel v-if="currentStep.key === 'data'" />
      <ChartEditPanel v-else-if="currentStep.key === 'edit'" />
      <ExportPanel v-else-if="currentStep.key === 'export'" />
    </div>
    <SceneTimeline
      v-if="showTimeline"
      :scenes="timelineScenes"
      :active-index="timelineActiveIndex"
      :playing="playing"
      @update:active-index="onTimelineSelect"
      @add="addScene"
      @remove="onTimelineRemove"
      @play="startPlayback"
      @pause="stopPlayback"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import { useWizard } from '@/composables/useWizard'
import { useNavbar } from '@/composables/useNavbar'
import { useDataTable } from '@/composables/useDataTable'
import { useChartConfig } from '@/composables/useChartConfig'
import { useChartSession } from '@/composables/useChartSession'
import { useChartTypeOptions } from '@/composables/useChartTypeOptions'
import { useDataTransforms, type TransformStep } from '@/composables/useDataTransforms'
import { serializeTableData } from '@/composables/useDataTable'
import { useScenes } from '@/composables/useScenes'
import { resolveScene } from '@/composables/useChartPreview'
import { generateThumbnail, renderThumbnailSvg } from '@/composables/useChartThumbnail'
import type { ChartHighlight } from '@/composables/useChartConfig'
import { parseData } from '@blueprint-chart/lib'
import type { SeriesOverride } from '@blueprint-chart/lib'
import { SceneTimeline } from '@blueprint-chart/ui'
import DataPanel from '@/components/Data/DataPanel.vue'
import ChartEditPanel from '@/components/ChartEdit/ChartEditPanel.vue'
import ExportPanel from '@/components/Export/ExportPanel.vue'

const router = useRouter()
const { currentIndex, currentStep } = useWizard()
const { setMode, reset: resetNavbar } = useNavbar()
const dataTable = useDataTable()
const config = useChartConfig()
const { sessionId, createSession } = useChartSession()
const scenesComposable = useScenes()
const { scenes, activeIndex, playing, startPlayback, stopPlayback } = scenesComposable
const { baseOptions } = useChartTypeOptions()
const transforms = useDataTransforms()
const baseTransforms = ref<TransformStep[]>([])

function addScene() {
  scenesComposable.add()
  scenesComposable.setActive(scenes.value.length - 1)
}

// --- Scene thumbnail generation ---
const sceneThumbnails = ref<Record<number, string | null>>({})
const singleSeriesTypes = ['bar-vertical', 'bar-horizontal', 'line', 'vertical-bar', 'horizontal-bar']

function renderOne(
  chartType: string,
  dataStr: string,
  typeOpts: object,
  sort: string,
  highlights?: ChartHighlight[],
  seriesOverrides?: SeriesOverride[],
): string | null {
  const data = parseData(dataStr)
  if (data.series?.length && singleSeriesTypes.includes(chartType)) {
    const match = data.series.find(s => s.name === config._base.selectedColumn.value)
    if (match) {
      data.values = match.values
    }
    delete data.series
  }
  return renderThumbnailSvg(chartType, data, typeOpts, sort as 'ascending' | 'descending' | 'none', {
    highlights: highlights?.length ? highlights : undefined,
    seriesOverrides: seriesOverrides?.length ? seriesOverrides : undefined,
  })
}

function generateSceneThumbnails() {
  const base = config._base
  const result: Record<number, string | null> = {}

  // Base scene (timeline index 0)
  result[0] = renderOne(
    base.chartType.value, base.data.value, baseOptions.value, base.sort.value,
    base.highlights.value, base.seriesOverrides.value,
  )

  // Override scenes (timeline index 1+)
  for (let i = 0; i < scenes.value.length; i++) {
    const resolved = resolveScene(scenes.value, i)
    const chartType = resolved?.chartType ?? base.chartType.value
    let dataStr: string
    if (resolved?.data) {
      dataStr = resolved.data
    }
    else if (resolved?.transforms?.length && dataTable.columns.value.length > 0) {
      const result = transforms.applyStepList(resolved.transforms, dataTable.columns.value, dataTable.rows.value, dataTable.columnTypes.value)
      dataStr = serializeTableData(result.columns, result.rows)
    }
    else {
      dataStr = base.data.value
    }
    const typeOpts = resolved?.chartTypeOptions
      ? { ...baseOptions.value, ...resolved.chartTypeOptions }
      : baseOptions.value
    const highlights = resolved?.highlights ?? base.highlights.value
    const seriesOverrides = resolved?.seriesOverrides ?? base.seriesOverrides.value
    result[i + 1] = renderOne(chartType, dataStr, typeOpts, base.sort.value, highlights, seriesOverrides)
  }

  sceneThumbnails.value = result
}

const debouncedGenerateThumbnails = useDebounceFn(generateSceneThumbnails, 300)

watch(
  [() => scenes.value, config._base.chartType, config._base.data, config._base.sort,
    config._base.highlights, config._base.seriesOverrides, config._base.selectedColumn,
    baseOptions, currentStep],
  () => {
    if (currentStep.value.key === 'edit') {
      debouncedGenerateThumbnails()
    }
  },
  { deep: true },
)

// Scene 1 is virtual (base chart state, index -1 internally).
// Override scenes map to indices 0..N-1 internally but display as Scene 2..N+1.
// Timeline uses 0-based indices where 0 = Scene 1 (base).
const timelineScenes = computed(() => {
  const base = [{ name: null as string | null, index: 0, removable: false, thumbnail: sceneThumbnails.value[0] ?? null }]
  const overrides = scenes.value.map((s, i) => ({
    name: s.name,
    index: i + 1,
    removable: true,
    thumbnail: sceneThumbnails.value[i + 1] ?? null,
  }))
  return [...base, ...overrides]
})

// Map internal activeIndex (-1 = base) to timeline index (0 = base)
const timelineActiveIndex = computed(() => activeIndex.value + 1)

function onTimelineSelect(timelineIndex: number) {
  // Timeline 0 = base (internal -1), timeline 1+ = scene 0+
  scenesComposable.setActive(timelineIndex - 1)
}

function onTimelineRemove(timelineIndex: number) {
  // Timeline 0 = base, cannot remove
  if (timelineIndex <= 0) {
    return
  }
  scenesComposable.remove(timelineIndex - 1)
}

const showTimeline = computed(() => {
  const step = currentStep.value.key
  if (step === 'export') {
    return false
  }
  if (step === 'edit') {
    return true
  }
  // data step: show if 1+ override scenes exist
  return scenes.value.length >= 1
})

// Swap transforms when switching scenes on the data step
watch(activeIndex, (newVal, oldVal) => {
  if (currentStep.value.key !== 'data') {
    return
  }
  // Leaving base → scene
  if (oldVal === -1 && newVal >= 0) {
    baseTransforms.value = transforms.snapshot()
    transforms.hydrate(scenes.value[newVal]?.transforms ?? [])
  }
  // Leaving scene → base
  else if (oldVal >= 0 && newVal === -1) {
    scenesComposable.update(oldVal, { transforms: transforms.snapshot() })
    transforms.hydrate(baseTransforms.value)
  }
  // Switching between scenes
  else if (oldVal >= 0 && newVal >= 0) {
    scenesComposable.update(oldVal, { transforms: transforms.snapshot() })
    transforms.hydrate(scenes.value[newVal]?.transforms ?? [])
  }
})

onMounted(() => {
  setMode('wizard')
  // Generate thumbnails on mount for reload/direct navigation to edit step
  if (currentStep.value.key === 'edit' && config._base.data.value) {
    generateSceneThumbnails()
  }
})
onUnmounted(() => resetNavbar())

// Serialize data when navigating from data step to edit step
watch(currentIndex, (newIndex, oldIndex) => {
  if (oldIndex === 0 && newIndex === 1) {
    // If a scene was active on the data step, save its transforms and restore base
    if (activeIndex.value >= 0) {
      scenesComposable.update(activeIndex.value, { transforms: transforms.snapshot() })
      transforms.hydrate(baseTransforms.value)
      scenesComposable.setActive(-1)
    }
    config._base.data.value = dataTable.serialize()
    if (dataTable.columns.value.length > 2 && !config._base.chartType.value.includes('multi')) {
      const hasDateLabels = dataTable.columnTypes.value[0] === 'date'
      config._base.chartType.value = hasDateLabels ? 'line-multi' : 'bar-multi'
    }
    if (!sessionId.value) {
      const id = createSession()
      router.replace(`/edit/${id}`)
    }
  }
})

onBeforeRouteLeave(() => {
  generateThumbnail()
})
</script>

<style scoped lang="scss">
.wizard-shell {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
  gap: var(--bc-tile-gap);
  padding: 0 var(--bc-tile-gap) var(--bc-tile-gap) ;
}

.wizard-shell__content {
  display: flex;
  flex-grow: 1;
  min-height: 0;
  overflow: auto;
}
</style>
