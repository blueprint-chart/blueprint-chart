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
import { computed, watch, onMounted, onUnmounted } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { useWizard } from '@/composables/useWizard'
import { useNavbar } from '@/composables/useNavbar'
import { useDataTable } from '@/composables/useDataTable'
import { useChartConfig } from '@/composables/useChartConfig'
import { useChartSession } from '@/composables/useChartSession'
import { useScenes } from '@/composables/useScenes'
import { generateThumbnail } from '@/composables/useChartThumbnail'
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

function addScene() {
  scenesComposable.add()
  scenesComposable.setActive(scenes.value.length - 1)
}

function countChanges(s: (typeof scenes.value)[number]): number {
  let n = 0
  if (s.chartType) {
    n++
  }
  if (s.data) {
    n++
  }
  if (s.highlights?.length) {
    n += s.highlights.length
  }
  if (s.areaFills?.length) {
    n += s.areaFills.length
  }
  if (s.annotations?.length) {
    n += s.annotations.length
  }
  if (s.seriesOverrides?.length) {
    n += s.seriesOverrides.length
  }
  if (s.transforms?.length) {
    n += s.transforms.length
  }
  if (s.chartTypeOptions) {
    n += Object.keys(s.chartTypeOptions).length
  }
  if (s.properties) {
    n += Object.keys(s.properties).length
  }
  return n
}

// Scene 1 is virtual (base chart state, index -1 internally).
// Override scenes map to indices 0..N-1 internally but display as Scene 2..N+1.
// Timeline uses 0-based indices where 0 = Scene 1 (base).
const timelineScenes = computed(() => {
  const base = [{ name: null as string | null, index: 0, changes: 0, removable: false }]
  const overrides = scenes.value.map((s, i) => ({
    name: s.name,
    index: i + 1,
    changes: countChanges(s),
    removable: true,
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
  // data step: only show if 2+ scenes
  return scenes.value.length >= 2
})

onMounted(() => setMode('wizard'))
onUnmounted(() => resetNavbar())

// Serialize data when navigating from data step to edit step
watch(currentIndex, (newIndex, oldIndex) => {
  if (oldIndex === 0 && newIndex === 1) {
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
}

.wizard-shell__content {
  display: flex;
  flex-grow: 1;
  overflow: auto;
}
</style>
