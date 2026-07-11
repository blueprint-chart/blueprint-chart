<template>
  <div
    ref="containerRef"
    class="landing-chart-preview"
  />
</template>

<script setup lang="ts">

const props = withDefaults(defineProps<{
  bpc: string
  transparentBackground?: boolean
}>(), {
  transparentBackground: false,
})

const containerRef = useTemplateRef<HTMLElement>('containerRef')

useChartFromDsl(containerRef, toRef(props, 'bpc'), {
  stripColors: true,
  transparentBackground: props.transparentBackground,
})
</script>

<style scoped>
.landing-chart-preview {
  width: 100%;
  height: 100%;
}
</style>
