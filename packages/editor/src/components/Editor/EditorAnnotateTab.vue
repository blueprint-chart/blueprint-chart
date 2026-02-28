<template>
  <div class="d-flex flex-column gap-3">
    <EditorAnnotations
      ref="annotationsRef"
      :model-value="annotations"
      :labels="dataLabels"
      :chart-type="chartType"
      :chart-width="chartWidth"
      :chart-height="chartHeight"
      @update:model-value="(v) => annotations = v"
    />

    <hr v-if="isMultiLine">

    <EditorAreaFills
      v-if="isMultiLine"
      :model-value="areaFills"
      :series-names="seriesNames"
      @update:model-value="(v) => areaFills = v"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useChartConfig } from '@/composables/useChartConfig'
import { usePreviewContainer } from '@/composables/usePreviewContainer'
import { useEditorPanel } from '@/composables/useEditorPanel'
import { useAnnotationDrag } from '@/composables/useAnnotationDrag'
import { parseData } from '@blueprint-chart/lib'
import type { AnnotationConfig } from '@blueprint-chart/lib'
import EditorAnnotations from './EditorAnnotations.vue'
import EditorAreaFills from './EditorAreaFills.vue'

const { chartType, data, annotations, areaFills } = useChartConfig()
const { pendingAnnotationIndex } = useEditorPanel()

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
  const copy = annotations.value.map(a => ({ ...a }))
  copy[index] = ann
  annotations.value = copy
}

useAnnotationDrag(containerRef, annotations, selectedIndex, handleDragUpdate)

// Consume pending annotation selection (e.g. from double-click on chart)
watch(pendingAnnotationIndex, async (index) => {
  if (index === null) {
    return
  }
  await nextTick()
  if (annotationsRef.value) {
    // Toggle: deselect if already open
    annotationsRef.value.openIndex = annotationsRef.value.openIndex === index ? null : index
    pendingAnnotationIndex.value = null
  }
}, { immediate: true })
</script>
