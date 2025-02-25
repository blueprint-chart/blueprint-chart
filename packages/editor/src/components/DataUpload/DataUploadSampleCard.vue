<template>
  <div
    class="card h-100"
    role="button"
    @click="$emit('select')"
  >
    <div class="card-body py-2 px-3">
      <div class="d-flex align-items-center gap-2 mb-1">
        <span
          class="badge bg-secondary text-uppercase"
          style="font-size: 0.65rem;"
        >{{ chartLabel }}</span>
      </div>
      <h6 class="card-title mb-0 small fw-bold">
        {{ sample.title }}
      </h6>
      <p
        class="card-text text-muted mb-0"
        style="font-size: 0.75rem;"
      >
        {{ sample.description }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChartSample } from '@blueprint-chart/lib'

const props = defineProps<{
  sample: ChartSample
}>()

defineEmits<{
  select: []
}>()

const chartLabel = computed(() => {
  const map: Record<string, string> = {
    'bar-vertical': 'Bar',
    'bar-horizontal': 'H. Bar',
    'bar-multi': 'Grouped Bar',
    'line': 'Line',
    'line-multi': 'Multi Line',
    'donut': 'Donut',
  }
  return map[props.sample.chartType] ?? props.sample.chartType
})
</script>
