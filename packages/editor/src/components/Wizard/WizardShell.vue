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
import { BBadge } from 'bootstrap-vue-next'
import { NavigationStepperChevron, SceneTimeline } from '@blueprint-chart/ui'
import LayoutPageHeader from '@/components/Layout/LayoutPageHeader.vue'
import LayoutBreadcrumb from '@/components/Layout/LayoutBreadcrumb.vue'
import LayoutSceneTimeline from '@/components/Layout/LayoutSceneTimeline.vue'

const { currentStep, currentIndex, steps, registerCreateSession } = useWizard()
const dataTable = useDataTable()
const config = useChartConfig()
const { sessionId, createSession, lastSavedAt } = useChartSession()
const scenesComposable = useScenes()
const { scenes, activeIndex, playing, startPlayback, stopPlayback } = scenesComposable
const { baseOptions } = useChartTypeOptions()
const transforms = useDataTransforms()
const baseTransforms = ref<TransformStep[]>([])

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

const sceneThumbnails = ref<Record<number, string | null>>({})
const singleSeriesTypes: string[] = [ChartType.BarVertical, ChartType.BarHorizontal, ChartType.Line, ChartType.VerticalBar, ChartType.HorizontalBar]

type RenderOneOpts = {
  chartType: string
  dataStr: string
  typeOpts: object
  sort: string
  colorizes?: ChartColorize[]
  seriesOverrides?: SeriesOverride[]
}

function renderOne(opts: RenderOneOpts): string | null {
  const data = parseData(opts.dataStr)
  if (data.series?.length && singleSeriesTypes.includes(opts.chartType)) {
    const match = data.series.find(s => s.name === config._base.selectedColumn.value)
    if (match) {
      data.values = match.values
    }
    delete data.series
  }
  return renderThumbnailSvg(opts.chartType, data, opts.typeOpts, opts.sort as SortDirection, {
    colorizes: opts.colorizes?.length ? opts.colorizes : undefined,
    seriesOverrides: opts.seriesOverrides?.length ? opts.seriesOverrides : undefined,
  })
}

function resolveSceneDataStr(resolved: ReturnType<typeof resolveScene>, fallback: string): string {
  if (resolved?.data !== undefined) {
    return resolved.data
  }
  if (resolved?.transforms?.length && dataTable.columns.value.length > 0) {
    const out = transforms.applyStepList(resolved.transforms, dataTable.columns.value, dataTable.rows.value, dataTable.columnTypes.value)
    return serializeTableData(out.columns, out.rows)
  }
  return fallback
}

function generateSceneThumbnails() {
  const base = config._base
  const result: Record<number, string | null> = {}

  result[0] = renderOne({
    chartType: base.chartType.value,
    dataStr: base.data.value,
    typeOpts: baseOptions.value,
    sort: base.sort.value,
    colorizes: base.colorizes.value,
    seriesOverrides: base.seriesOverrides.value,
  })

  for (let i = 0; i < scenes.value.length; i++) {
    const resolved = resolveScene(scenes.value, i)
    result[i + 1] = renderOne({
      chartType: resolved?.chartType ?? base.chartType.value,
      dataStr: resolveSceneDataStr(resolved, base.data.value),
      typeOpts: resolved?.chartTypeOptions
        ? { ...baseOptions.value, ...resolved.chartTypeOptions }
        : baseOptions.value,
      sort: resolveSortFromTransforms(resolved) ?? base.sort.value,
      colorizes: resolved?.colorizes ?? base.colorizes.value,
      seriesOverrides: resolved?.seriesOverrides ?? base.seriesOverrides.value,
    })
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

// Base scene is internal index -1, displayed as timeline index 0.
// Override scenes are internal 0..N-1, displayed as timeline 1..N.
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

const timelineActiveIndex = computed(() => activeIndex.value + 1)

function onTimelineSelect(timelineIndex: number) {
  scenesComposable.setActive(timelineIndex - 1)
}

function onTimelineRemove(timelineIndex: number) {
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
  return scenes.value.length >= 1
})

watch(activeIndex, (newVal, oldVal) => {
  if (currentStep.value.key !== 'data') {
    return
  }
  if (oldVal === -1 && newVal >= 0) {
    baseTransforms.value = transforms.snapshot()
    transforms.hydrate(scenes.value[newVal]?.transforms ?? [])
  }
  else if (oldVal >= 0 && newVal === -1) {
    scenesComposable.update(oldVal, { transforms: transforms.snapshot() })
    transforms.hydrate(baseTransforms.value)
  }
  else if (oldVal >= 0 && newVal >= 0) {
    scenesComposable.update(oldVal, { transforms: transforms.snapshot() })
    transforms.hydrate(scenes.value[newVal]?.transforms ?? [])
  }
})

onMounted(() => {
  if (currentStep.value.key === 'edit' && config._base.data.value) {
    generateSceneThumbnails()
  }
})

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

registerCreateSession(() => {
  prepareDataForEdit()
  return createSession()
})

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
        <LayoutBreadcrumb />
        <BBadge
          v-if="savedLabel"
          variant="success"
          pill
          class="wizard-shell__saved"
          role="status"
          aria-live="polite"
        >
          <span class="wizard-shell__saved__dot" />
          {{ savedLabel }}
        </BBadge>
      </template>
      <template #center>
        <NavigationStepperChevron
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
      <LayoutSceneTimeline v-if="showTimeline">
        <SceneTimeline
          :scenes="timelineScenes"
          :active-index="timelineActiveIndex"
          :playing="playing"
          @update:active-index="onTimelineSelect"
          @add="addScene"
          @remove="onTimelineRemove"
          @play="startPlayback"
          @pause="stopPlayback"
        />
      </LayoutSceneTimeline>
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

  @media (max-width: 767.98px) {
    &__header :deep(.navigation-stepper-tabs) {
      width: 100%;
    }

    &__header :deep(.navigation-stepper-tabs__step) {
      flex: 1;
      padding: 0 0.5rem;
      justify-content: center;
    }
  }

  &__saved {
    flex-shrink: 0;

    &__dot {
      width: 6px;
      height: 6px;
      background: var(--bs-success);
      border-radius: 50%;
      box-shadow: 0 0 0 4px rgba(var(--bs-success-rgb), 0.18);
    }
  }
}
</style>
