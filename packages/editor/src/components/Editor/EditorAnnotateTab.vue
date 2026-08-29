<template>
  <div class="d-flex flex-column gap-4">
    <SettingsSection
      v-if="hasHighlight"
      title="Highlight"
      :icon="IPhHighlighterCircle"
    >
      <EditorHighlightSection />
    </SettingsSection>

    <EditorAnnotations
      ref="baseAnnotationsRef"
      v-model="baseAnnotations"
      :labels="dataLabels"
      :chart-type="chartType"
      :chart-width="chartWidth"
      :chart-height="chartHeight"
      :show-repeat="showRepeat"
    />

    <SettingsSection
      v-if="isSceneActive"
      title="This scene"
    >
      <EditorAnnotations
        ref="sceneAnnotationsRef"
        v-model="sceneAnnotations"
        :labels="dataLabels"
        :chart-type="chartType"
        :chart-width="chartWidth"
        :chart-height="chartHeight"
        :show-repeat="showRepeat"
      />
    </SettingsSection>

    <SettingsSection
      v-if="isMultiLine"
      title="Area Fills"
      :icon="IPhDropHalf"
    >
      <EditorAreaFills
        v-model="areaFills"
        :series-names="seriesNames"
        :series-overrides="seriesOverrides"
        :global-interpolation="globalInterpolation"
      />
    </SettingsSection>
  </div>
</template>

<script setup lang="ts">
import { useChartConfig } from '@/stores/chartConfig'
import { useChartTypeOptions } from '@/stores/chartTypeOptions'
import { usePreviewContainer } from '@/stores/previewContainer'
import { useEditorPanel } from '@/stores/editorPanel'
import { useScenes } from '@/stores/scenes'
import { ChartType, parseData } from '@blueprint-chart/lib'
import type { AnnotationConfig } from '@blueprint-chart/lib'
import { SettingsSection } from '@blueprint-chart/ui'
import IPhDropHalf from '~icons/ph/drop-half'
import IPhHighlighterCircle from '~icons/ph/highlighter-circle'
import EditorAnnotations from './EditorAnnotations.vue'

const config = useChartConfig()
const { chartType, data, areaFills, seriesOverrides } = config
const { currentOptions } = useChartTypeOptions()
const globalInterpolation = computed(() => (currentOptions.value.interpolation as string) ?? 'linear')
const { pendingAnnotationIndex } = useEditorPanel()
const { scenes, activeIndex, activeScene, update: updateScene } = useScenes()

const isSceneActive = computed(() => activeIndex.value >= 0)

const HIGHLIGHT_TYPES: string[] = [ChartType.BarVertical, ChartType.BarHorizontal, ChartType.LineMulti, ChartType.AreaStacked]
const hasHighlight = computed(() => HIGHLIGHT_TYPES.includes(chartType.value))

// showRepeat = true whenever any scenes exist (repeat controls make sense even
// on the base group so annotations can be configured to repeat into scenes).
const showRepeat = computed(() => scenes.value.length > 0)

// Base annotations — always-present group, directly bound to config._base
const baseAnnotations = computed<AnnotationConfig[]>({
  get: () => config._base.annotations.value,
  set: (val) => { config._base.annotations.value = val },
})

// Scene annotations — only meaningful when a scene is active
const sceneAnnotations = computed<AnnotationConfig[]>({
  get: () => activeScene.value?.annotations ?? [],
  set: (val) => {
    if (activeIndex.value >= 0) {
      updateScene(activeIndex.value, { annotations: val.length > 0 ? val : undefined })
    }
  },
})

const isMultiLine = computed(() => chartType.value === ChartType.LineMulti)

const parsed = computed(() => parseData(data.value))
const dataLabels = computed(() => parsed.value.labels)
const seriesNames = computed(() => parsed.value.series?.map(s => s.name) ?? [])

// Template refs for both EditorAnnotations instances
const baseAnnotationsRef = ref<InstanceType<typeof EditorAnnotations> | null>(null)
const sceneAnnotationsRef = ref<InstanceType<typeof EditorAnnotations> | null>(null)

// Combined read surface for drag: base first, then scene annotations.
// Attach anchor-correct keys matching the preview/lib format so useAnnotationDrag
// can look up SVG elements via data-annotation-id instead of an unreliable index.
const allAnnotations = computed(() => [
  ...baseAnnotations.value.map((a, i) => ({ ...a, key: `base:${i}:${a.kind}` })),
  ...sceneAnnotations.value.map((a, i) => ({ ...a, key: `s${activeIndex.value}:${i}:${a.kind}` })),
])

// selectedIndex tracks the currently open annotation across both groups.
// Drag uses the combined allAnnotations array, so the index is into that list.
// We synthesise a combined selectedIndex: if base group has an open item, use
// that index directly; if scene group has an open item, offset by base length.
const selectedIndex = computed(() => {
  const baseOpen = baseAnnotationsRef.value?.openIndex ?? null
  if (baseOpen !== null) {
    return baseOpen
  }
  const sceneOpen = sceneAnnotationsRef.value?.openIndex ?? null
  if (sceneOpen !== null) {
    return baseAnnotations.value.length + sceneOpen
  }
  return null
})

const { containerRef } = usePreviewContainer()

const chartWidth = shallowRef(600)
const chartHeight = shallowRef(400)

function readChartDimensions() {
  const svg = containerRef.value?.querySelector('svg')
  if (svg) {
    chartWidth.value = parseFloat(svg.getAttribute('width') || '600') || 600
    chartHeight.value = parseFloat(svg.getAttribute('height') || '400') || 400
  }
}

let resizeObserver: ResizeObserver | undefined
onMounted(() => {
  readChartDimensions()
  resizeObserver = new ResizeObserver(readChartDimensions)
  if (containerRef.value) {
    resizeObserver.observe(containerRef.value)
  }
})
onBeforeUnmount(() => resizeObserver?.disconnect())

// Drag update: route by index position in the combined array.
// Indices 0..(baseLen-1) map to the base group; the rest map to the scene group.
// Strip the synthetic `key` added by allAnnotations before persisting.
function handleDragUpdate(index: number, ann: AnnotationConfig) {
  const { key: _key, ...clean } = ann as AnnotationConfig & { key?: string }
  const baseLen = baseAnnotations.value.length
  if (index < baseLen) {
    const copy = baseAnnotations.value.map(a => ({ ...a }))
    copy[index] = clean
    baseAnnotations.value = copy
  }
  else {
    const sceneIndex = index - baseLen
    const copy = sceneAnnotations.value.map(a => ({ ...a }))
    copy[sceneIndex] = clean
    sceneAnnotations.value = copy
  }
}

useAnnotationDrag(containerRef, allAnnotations, selectedIndex, handleDragUpdate)

// Parse a data-annotation-id key into the group + row it belongs to.
// Keys are formatted as:  base:${i}:${kind}  or  s${j}:${i}:${kind}
function rowFromKey(key: string): { group: 'base' | 'scene', index: number } | null {
  const m = /^(base|s(\d+)):(\d+):/.exec(key)
  if (!m) {
    return null
  }
  const index = Number(m[3])
  if (m[1] === 'base') {
    return { group: 'base', index }
  }
  const j = Number(m[2])
  // Only open the scene group if the scene index matches the active scene.
  // A key from a different scene index is a pass-through — no-op.
  return j === activeIndex.value ? { group: 'scene', index } : null
}

// Consume pending annotation selection (e.g. from double-click on chart).
// pendingAnnotationIndex is now a data-annotation-id string key (or null).
watch(pendingAnnotationIndex, async (pending) => {
  if (pending === null) {
    return
  }
  await nextTick()

  if (typeof pending === 'string') {
    const row = rowFromKey(pending)
    if (!row) {
      pendingAnnotationIndex.value = null
      return
    }
    if (row.group === 'base' && baseAnnotationsRef.value) {
      const cur = baseAnnotationsRef.value.openIndex
      baseAnnotationsRef.value.openIndex = cur === row.index ? null : row.index
    }
    else if (row.group === 'scene' && sceneAnnotationsRef.value) {
      const cur = sceneAnnotationsRef.value.openIndex
      sceneAnnotationsRef.value.openIndex = cur === row.index ? null : row.index
    }
    pendingAnnotationIndex.value = null
    return
  }

  // Numeric fallback: treat as an index into the base group (legacy path)
  if (typeof pending === 'number' && baseAnnotationsRef.value) {
    const index = pending
    if (index < 0 || index >= baseAnnotations.value.length) {
      pendingAnnotationIndex.value = null
      return
    }
    const cur = baseAnnotationsRef.value.openIndex
    baseAnnotationsRef.value.openIndex = cur === index ? null : index
    pendingAnnotationIndex.value = null
  }
}, { immediate: true })
</script>
