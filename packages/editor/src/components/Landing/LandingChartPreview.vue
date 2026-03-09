<template>
  <div
    ref="containerRef"
    class="landing-chart-preview"
  />
</template>

<script setup lang="ts">
import { ref, toRef } from 'vue'
import { useChartFromDsl } from '@/composables/useChartFromDsl'

const props = defineProps<{
  bpc: string
}>()

const containerRef = ref<HTMLElement | null>(null)

useChartFromDsl(containerRef, toRef(props, 'bpc'), { stripColors: true, padding: '24px' })
</script>

<style scoped>
.landing-chart-preview {
  width: 100%;
  height: 100%;
}
</style>
