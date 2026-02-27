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
import { computed, ref, watch, useTemplateRef } from 'vue'
import { useChartPreview } from '@/composables/useChartPreview'
import { useCvdMode } from '@/composables/useCvdMode'
import { getCvdFilterId, createCvdSvgFilter, type CvdType } from '@blueprint-chart/lib'

const containerRef = ref(null)
useChartPreview(containerRef)

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
