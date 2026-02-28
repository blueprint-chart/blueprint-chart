<template>
  <div
    ref="containerRef"
    class="w-100 h-100"
    :style="cvdFilterStyle"
  />
  <svg
    v-if="cvdMode"
    class="position-absolute"
    width="0"
    height="0"
    aria-hidden="true"
  >
    <defs ref="cvdDefsRef" />
  </svg>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount, useTemplateRef } from 'vue'
import { useChartPreview } from '@/composables/useChartPreview'
import { useCvdMode } from '@/composables/useCvdMode'
import { usePreviewContainer } from '@/composables/usePreviewContainer'
import { useEditorPanel } from '@/composables/useEditorPanel'
import { getCvdFilterId, createCvdSvgFilter, type CvdType } from '@blueprint-chart/lib'

const containerRef = ref(null)
useChartPreview(containerRef)

const { containerRef: sharedContainerRef } = usePreviewContainer()
watch(containerRef, (el) => { sharedContainerRef.value = el }, { immediate: true })

const { selectAnnotation, pendingAnnotationIndex } = useEditorPanel()

function onDblClick(e: MouseEvent) {
  const target = e.target as Element
  const annG = target.closest('g[data-annotation-index]')
  if (!annG) return
  e.preventDefault()
  window.getSelection()?.removeAllRanges()
  const index = parseInt(annG.getAttribute('data-annotation-index') || '', 10)
  if (!isNaN(index)) selectAnnotation(index)
}

onMounted(() => {
  (containerRef.value as HTMLElement | null)?.addEventListener('dblclick', onDblClick)
})
onBeforeUnmount(() => {
  (containerRef.value as HTMLElement | null)?.removeEventListener('dblclick', onDblClick)
})

const { cvdMode } = useCvdMode()
const cvdDefsRef = useTemplateRef<SVGElement>('cvdDefsRef')

watch([cvdMode, cvdDefsRef], ([mode, defs]) => {
  if (!defs) return
  while (defs.firstChild) defs.removeChild(defs.firstChild)
  if (mode) {
    defs.appendChild(createCvdSvgFilter(mode as CvdType))
  }
}, { immediate: true })

const cvdFilterStyle = computed(() => {
  if (!cvdMode.value) return undefined
  return { filter: `url(#${getCvdFilterId(cvdMode.value as CvdType)})` }
})
</script>
