<template>
  <div
    ref="containerRef"
    class="w-100 h-100"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useChartPreview } from '@/composables/useChartPreview'

const containerRef = ref(null)
useChartPreview(containerRef)
</script>
