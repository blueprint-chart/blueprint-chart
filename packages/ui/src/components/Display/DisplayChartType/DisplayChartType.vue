<template>
  <span class="display-chart-type">{{ label }}</span>
</template>

<script setup lang="ts">
import { getChartTypeLabel } from '../../../utils/chartType'

const props = defineProps<{
  chartType: string
}>()

const label = computed(() => getChartTypeLabel(props.chartType))
</script>

<style scoped lang="scss">
.display-chart-type {
  font-size: var(--bs-font-size-sm);
  color: var(--bs-body-color);
}
</style>
