<template>
  <div class="data-insight-badges">
    <span class="data-insight-badge data-insight-badge--shape">
      {{ columns.length }} cols · {{ rows.length }} rows
    </span>
    <span
      class="data-insight-badge"
      :class="qualityClass"
    >
      <span class="data-insight-badge__icon">{{ qualityIcon }}</span>
      {{ qualityLabel }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  columns: string[]
  rows: string[][]
}>()

const missingCount = computed(() => {
  let count = 0
  for (const row of props.rows) {
    for (let i = 0; i < props.columns.length; i++) {
      const v = row[i]
      if (v === undefined || v === null || v === '') {
        count++
      }
    }
  }
  return count
})

const qualityIcon = computed(() => missingCount.value === 0 ? '✓' : '⚠')
const qualityLabel = computed(() => {
  if (missingCount.value === 0) {
    return 'No missing values'
  }
  return `${missingCount.value} missing value${missingCount.value === 1 ? '' : 's'}`
})
const qualityClass = computed(() =>
  missingCount.value === 0 ? 'data-insight-badge--quality-ok' : 'data-insight-badge--quality-warn',
)

</script>

<style scoped lang="scss">
.data-insight-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  align-items: center;
}

.data-insight-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.data-insight-badge__icon {
  font-size: 0.6875rem;
}

.data-insight-badge--shape {
  background: var(--bs-secondary-bg);
  color: var(--bs-body-color);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.data-insight-badge--quality-ok {
  background: var(--bs-success-bg-subtle);
  color: var(--bs-success-text-emphasis);
}

.data-insight-badge--quality-warn {
  background: var(--bs-warning-bg-subtle);
  color: var(--bs-warning-text-emphasis);
}

</style>
