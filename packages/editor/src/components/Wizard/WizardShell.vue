<script setup lang="ts">
import { onBeforeRouteLeave } from 'vue-router'
import { useWizard } from '@/stores/wizard'
import { useDataTable } from '@/stores/dataTable'
import { useChartConfig } from '@/stores/chartConfig'
import { useChartSession } from '@/stores/chartSession'
import { useChartTypeOptions } from '@/stores/chartTypeOptions'
import { useDataTransforms, type TransformStep } from '@/stores/dataTransforms'
import { serializeTableData } from '@/stores/dataTable'
import { useScenes } from '@/stores/scenes'
import { resolveScene, resolveSortFromTransforms } from '@/utils/scenes'
import type { ChartColorize } from '@/stores/chartConfig'
import { ChartType, SortDirection, parseData } from '@blueprint-chart/lib'
import type { SeriesOverride } from '@blueprint-chart/lib'
import { NavigationStepperTabs, SceneTimeline, ButtonIcon } from '@blueprint-chart/ui'
import LayoutPageHeader from '@/components/Layout/LayoutPageHeader.vue'
import IPhArrowLeft from '~icons/ph/arrow-left'

const { currentStep, currentIndex, steps, registerCreateSession } = useWizard()
const dataTable = useDataTable()
const config = useChartConfig()
const { sessionId, createSession, lastSavedAt } = useChartSession()
const scenesComposable = useScenes()
const { scenes, activeIndex, playing, startPlayback, stopPlayback } = scenesComposable
const { baseOptions } = useChartTypeOptions()
const transforms = useDataTransforms()
const baseTransforms = ref<TransformStep[]>([])

const chartTitle = computed(() => config._base.title.value || 'Untitled chart')

const savedAtDate = computed<Date | ''>(() => lastSavedAt.value ? new Date(lastSavedAt.value) : '')
const savedAgo = useTimeAgo(savedAtDate)
const savedLabel = computed(() => savedAtDate.value ? `saved ${savedAgo.value}` : null)

const stepLabels = steps.map(s => ({ label: s.label, key: s.key }))

const disabledSteps = computed(() => {
  const hasParsed = dataTable.rows.value.length > 0
  if (!hasParsed) {
    return [1, 2]
  }
  return []
})

function addScene() {
  scenesComposable.add()
  scenesComposable.setActive(scenes.value.length - 1)
}

// --- Scene thumbnail generation ---
const sceneThumbnails = ref<Record<number, string | null>>({})
const singleSeriesTypes: string[] = [ChartType.BarVertical, ChartType.BarHorizontal, ChartType.Line, ChartType.VerticalBar, ChartType.HorizontalBar]

function renderOne(
  chartType: string,
  dataStr: string,
  typeOpts: object,
  sort: string,
  colorizes?: ChartColorize[],
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
  return renderThumbnailSvg(chartType, data, typeOpts, sort as SortDirection, {
    colorizes: colorizes?.length ? colorizes : undefined,
    seriesOverrides: seriesOverrides?.length ? seriesOverrides : undefined,
  })
}

function generateSceneThumbnails() {
  const base = config._base
  const result: Record<number, string | null> = {}

  // Base scene (timeline index 0)
  result[0] = renderOne(
    base.chartType.value, base.data.value, baseOptions.value, base.sort.value,
    base.colorizes.value, base.seriesOverrides.value,
  )

  // Override scenes (timeline index 1+)
  for (let i = 0; i < scenes.value.length; i++) {
    const resolved = resolveScene(scenes.value, i)
    const chartType = resolved?.chartType ?? base.chartType.value
    let dataStr: string
    if (resolved?.data !== undefined) {
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
    const colorizes = resolved?.colorizes ?? base.colorizes.value
    const seriesOverrides = resolved?.seriesOverrides ?? base.seriesOverrides.value
    const sort = resolveSortFromTransforms(resolved) ?? base.sort.value
    result[i + 1] = renderOne(chartType, dataStr, typeOpts, sort, colorizes, seriesOverrides)
  }

  sceneThumbnails.value = result
}

const debouncedGenerateThumbnails = useDebounceFn(generateSceneThumbnails, 300)

watch(
  [() => scenes.value, config._base.chartType, config._base.data, config._base.sort,
    config._base.colorizes, config._base.seriesOverrides, config._base.selectedColumn,
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
function resolveSceneTitle(index: number): string {
  const baseTitle = config._base.title.value
  if (index < 0) {
    return baseTitle || ' '
  }
  const resolved = resolveScene(scenes.value, index)
  const title = resolved?.properties?.title as string | undefined
  if (title !== undefined) {
    return title || ' '
  }
  return baseTitle || ' '
}

const timelineScenes = computed(() => {
  const base = [{ name: resolveSceneTitle(-1), index: 0, removable: false, thumbnail: sceneThumbnails.value[0] ?? null }]
  const overrides = scenes.value.map((s, i) => ({
    name: resolveSceneTitle(i),
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
  // Generate thumbnails on mount for reload/direct navigation to edit step
  if (currentStep.value.key === 'edit' && config._base.data.value) {
    generateSceneThumbnails()
  }
})

// Serialize data when leaving the data step (before session creation or navigation)
function prepareDataForEdit() {
  if (activeIndex.value >= 0) {
    scenesComposable.update(activeIndex.value, { transforms: transforms.snapshot() })
    transforms.hydrate(baseTransforms.value)
    scenesComposable.setActive(-1)
  }
  config._base.data.value = dataTable.serialize()
  const ct = config._base.chartType.value
  const isMultiSeries = ct.includes('multi') || ct.includes('stacked') || ct === ChartType.BarSplit || ct === ChartType.BarGrouped
  if (dataTable.columns.value.length > 2 && !isMultiSeries) {
    const hasDateLabels = dataTable.columnTypes.value[0] === 'date'
    config._base.chartType.value = hasDateLabels ? ChartType.LineMulti : ChartType.BarMulti
  }
}

// Register hook for when wizard needs to create a session (advancing from /new)
registerCreateSession(() => {
  prepareDataForEdit()
  return createSession()
})

// Also serialize data when navigating from data to edit within an existing session
watch(() => currentStep.value.key, (newKey, oldKey) => {
  if (oldKey === 'data' && newKey === 'edit' && sessionId.value) {
    prepareDataForEdit()
  }
})

onBeforeRouteLeave(() => {
  generateThumbnail()
})
</script>

<template>
  <div class="wizard-shell">
    <LayoutPageHeader class="wizard-shell__header">
      <template #start>
        <ButtonIcon
          class="wizard-shell__back"
          :icon-left="IPhArrowLeft"
          label="Back to My Charts"
          hide-label
          variant="outline-secondary"
          size="sm"
          tag="a"
          href="#/charts"
        />
        <h1 class="wizard-shell__title">
          {{ chartTitle }}
        </h1>
        <span
          v-if="savedLabel"
          class="wizard-shell__saved"
          role="status"
          aria-live="polite"
        >
          <span class="wizard-shell__saved__dot" />
          {{ savedLabel }}
        </span>
      </template>
      <template #end>
        <NavigationStepperTabs
          v-model:current-step="currentIndex"
          :steps="stepLabels"
          :disabled-steps="disabledSteps"
        />
      </template>
    </LayoutPageHeader>

    <div class="wizard-shell__main">
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
  </div>
</template>

<style scoped lang="scss">
.wizard-shell {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;

  &__main {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: 0;
    gap: var(--bc-tile-gap);
    padding: var(--bc-tile-gap);
  }

  &__content {
    display: flex;
    flex-grow: 1;
    min-height: 0;
    overflow: auto;
  }

  &__back :deep(.button-icon) {
    border-radius: 50%;
  }

  &__title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--bs-body-color);
    margin: 0;
    line-height: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  &__saved {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: var(--bs-font-monospace);
    font-size: 0.6875rem;
    color: var(--bs-secondary-color);
    flex-shrink: 0;

    &__dot {
      width: 6px;
      height: 6px;
      background: var(--bs-success);
      border-radius: 50%;
    }
  }
}
</style>
