<template>
  <div class="dashboard-detail-meta">
    <div class="dashboard-detail-meta__title">
      Details
    </div>
    <div class="dashboard-detail-meta__grid">
      <DashboardMetaChip
        label="Chart type"
        :value="chartTypeLabel"
      />
      <DashboardMetaChip
        label="Last edited"
        :value="formattedDate"
      />
      <DashboardMetaChip
        label="Scenes"
        :value="String(sceneCount)"
      />
      <DashboardMetaChip
        label="Data rows"
        :value="String(rowCount)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getChartTypeLabel } from '@blueprint-chart/ui'
import DashboardMetaChip from './DashboardMetaChip.vue'

const props = defineProps<{
  chartType: string
  savedAt?: string
  sceneCount: number
  rowCount: number
}>()

const chartTypeLabel = computed(() => getChartTypeLabel(props.chartType))

const formattedDate = computed(() => {
  if (!props.savedAt) {
    return '\u2014'
  }
  const d = new Date(props.savedAt)
  if (Number.isNaN(d.getTime())) {
    return props.savedAt
  }
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
})
</script>

<style scoped lang="scss">
.dashboard-detail-meta {
  &__title {
    font-size: var(--bs-font-size-xs);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--bs-secondary-color);
    margin-bottom: 0.625rem;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }
}
</style>
