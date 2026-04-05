<template>
  <div
    ref="containerRef"
    class="landing-chart-preview"
  />
</template>

<script setup lang="ts">

const props = defineProps<{
  bpc: string
}>()

const containerRef = useTemplateRef<HTMLElement>('containerRef')

useChartFromDsl(containerRef, toRef(props, 'bpc'), { stripColors: true })
</script>

<style scoped>
.landing-chart-preview {
  width: 100%;
  height: 100%;
}
</style>
