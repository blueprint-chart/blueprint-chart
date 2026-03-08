<template>
  <div class="d-flex flex-column gap-4">
    <EditorAnnotations
      ref="annotationsRef"
      :model-value="resolvedAnnotations"
      :labels="dataLabels"
      :chart-type="chartType"
      :chart-width="chartWidth"
      :chart-height="chartHeight"
      :hidden-annotation-ids="hiddenAnnotationIds"
      :can-toggle-visibility="isSceneActive"
      @update:model-value="(v) => resolvedAnnotations = v"
      @toggle-visibility="handleToggleVisibility"
    />

    <SettingsSection
      v-if="isMultiLine"
      title="Area Fills"
      :icon="IPhDropHalf"
    >
      <EditorAreaFills
        :model-value="areaFills"
        :series-names="seriesNames"
        @update:model-value="(v) => areaFills = v"
      />
    </SettingsSection>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useChartConfig } from '@/composables/useChartConfig'
import { usePreviewContainer } from '@/composables/usePreviewContainer'
import { useEditorPanel } from '@/composables/useEditorPanel'
import { useAnnotationDrag } from '@/composables/useAnnotationDrag'
import { useScenes } from '@/composables/useScenes'
import { resolveScene } from '@/composables/useChartPreview'
import { parseData } from '@blueprint-chart/lib'
import type { AnnotationConfig } from '@blueprint-chart/lib'
import { SettingsSection } from '@blueprint-chart/ui'
import IPhDropHalf from '~icons/ph/drop-half'
import EditorAnnotations from './EditorAnnotations.vue'
import EditorAreaFills from './EditorAreaFills.vue'

const config = useChartConfig()
const { chartType, data, areaFills } = config
const { pendingAnnotationIndex } = useEditorPanel()
const { scenes, activeIndex, activeScene, update: updateScene } = useScenes()

const isSceneActive = computed(() => activeIndex.value >= 0)

// Base annotations are always the foundation; scene annotations are additions.
// resolveScene cascades scene annotations across scenes 0..N, then we merge
// with base so annotations defined in base + any scene are all visible.
const resolvedAnnotations = computed<AnnotationConfig[]>({
  get() {
    const base = config._base.annotations.value
    if (activeIndex.value >= 0) {
      const resolved = resolveScene(scenes.value, activeIndex.value)
      const sceneAnns = resolved?.annotations ?? []
      return [...base, ...sceneAnns]
    }
    return base
  },
  set(val: AnnotationConfig[]) {
    if (activeIndex.value >= 0 && activeScene.value) {
      // Split: annotations with ids from base stay in base, the rest go to scene
      const baseIds = new Set(config._base.annotations.value.map(a => a.id).filter(Boolean))
      const baseUpdates = val.filter(a => a.id && baseIds.has(a.id))
      const sceneUpdates = val.filter(a => !a.id || !baseIds.has(a.id))
      config._base.annotations.value = baseUpdates
      updateScene(activeIndex.value, { annotations: sceneUpdates.length > 0 ? sceneUpdates : undefined })
      return
    }
    config._base.annotations.value = val
  },
})

const hiddenAnnotationIds = computed(() => {
  if (activeIndex.value < 0) {
    return undefined
  }
  const resolved = resolveScene(scenes.value, activeIndex.value)
  return resolved?.hiddenAnnotationIds
})

function handleToggleVisibility(id: string, kind: 'point' | 'range' | 'free') {
  if (activeIndex.value < 0) {
    return
  }
  const scene = activeScene.value
  if (!scene) {
    return
  }

  const existing = scene.annotationVisibility ?? []
  const isHidden = hiddenAnnotationIds.value?.has(id)

  if (isHidden) {
    // Add show directive (or remove hide from this scene)
    const inThisScene = existing.find(v => v.id === id && v.action === 'hide')
    if (inThisScene) {
      updateScene(activeIndex.value, {
        annotationVisibility: existing.filter(v => !(v.id === id && v.action === 'hide')),
      })
    }
    else {
      updateScene(activeIndex.value, {
        annotationVisibility: [...existing, { action: 'show', kind, id }],
      })
    }
  }
  else {
    // Add hide directive (or remove show from this scene)
    const inThisScene = existing.find(v => v.id === id && v.action === 'show')
    if (inThisScene) {
      updateScene(activeIndex.value, {
        annotationVisibility: existing.filter(v => !(v.id === id && v.action === 'show')),
      })
    }
    else {
      updateScene(activeIndex.value, {
        annotationVisibility: [...existing, { action: 'hide', kind, id }],
      })
    }
  }
}

const isMultiLine = computed(() => chartType.value === 'line-multi')

const parsed = computed(() => parseData(data.value))
const dataLabels = computed(() => parsed.value.labels)
const seriesNames = computed(() => parsed.value.series?.map(s => s.name) ?? [])

const annotationsRef = ref<InstanceType<typeof EditorAnnotations> | null>(null)
const selectedIndex = computed(() => annotationsRef.value?.openIndex ?? null)

const { containerRef } = usePreviewContainer()

const chartWidth = ref(600)
const chartHeight = ref(400)

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

function handleDragUpdate(index: number, ann: AnnotationConfig) {
  const copy = resolvedAnnotations.value.map(a => ({ ...a }))
  copy[index] = ann
  resolvedAnnotations.value = copy
}

useAnnotationDrag(containerRef, resolvedAnnotations, selectedIndex, handleDragUpdate)

// Consume pending annotation selection (e.g. from double-click on chart)
watch(pendingAnnotationIndex, async (pending) => {
  if (pending === null) {
    return
  }
  await nextTick()
  if (annotationsRef.value) {
    // Resolve annotation id (string) to index in resolvedAnnotations
    const index = typeof pending === 'string'
      ? resolvedAnnotations.value.findIndex(a => a.id === pending)
      : pending
    if (index < 0) {
      pendingAnnotationIndex.value = null
      return
    }
    // Toggle: deselect if already open
    annotationsRef.value.openIndex = annotationsRef.value.openIndex === index ? null : index
    pendingAnnotationIndex.value = null
  }
}, { immediate: true })
</script>
