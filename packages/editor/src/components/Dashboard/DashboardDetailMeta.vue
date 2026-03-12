<template>
  <div class="dashboard-detail-meta">
    <div class="dashboard-detail-meta__title">
      Details
    </div>
    <div class="dashboard-detail-meta__grid">
      <DashboardMetaChip
        label="Chart type"
        :value="chartType"
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
import DashboardMetaChip from './DashboardMetaChip.vue'

const props = defineProps<{
  chartType: string
  savedAt?: string
  sceneCount: number
  rowCount: number
}>()

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
.dashboard-detail-meta__title {
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--bs-secondary-color);
  margin-bottom: 0.625rem;
}

.dashboard-detail-meta__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}
</style>
