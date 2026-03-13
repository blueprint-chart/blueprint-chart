<template>
  <span class="display-chart-type">{{ label }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getChartTypeLabel } from '../chartTypeLabels'

const props = defineProps<{
  chartType: string
}>()

const label = computed(() => getChartTypeLabel(props.chartType))
</script>

<style scoped lang="scss">
.display-chart-type {
  font-size: 0.8125rem;
  color: var(--bs-body-color);
}
</style>
