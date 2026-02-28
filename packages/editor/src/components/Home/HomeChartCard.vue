<template>
  <div class="card mb-2">
    <div
      class="card-body d-flex align-items-start"
      role="button"
      @click="$emit('select')"
    >
      <div
        v-if="thumbnail"
        class="flex-shrink-0 me-3 chart-thumbnail"
        v-html="thumbnail"
      />
      <div class="flex-grow-1 me-3">
        <div class="fw-semibold">
          {{ chart.title || 'Untitled' }}
        </div>
        <div
          v-if="chart.description"
          class="text-muted small mt-1"
        >
          {{ chart.description }}
        </div>
        <small class="text-muted">
          <span v-if="chart.savedAt">{{ formatDate(chart.savedAt) }}</span>
        </small>
      </div>
      <button
        class="btn btn-sm btn-outline-danger"
        title="Delete chart"
        @click.stop="$emit('delete')"
      >
        Delete
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SavedChartSummary } from '@/composables/useChartSession'

defineProps<{
  chart: SavedChartSummary
  thumbnail?: string
}>()

defineEmits<{
  select: []
  delete: []
}>()

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.chart-thumbnail {
  width: 120px;
  flex-shrink: 0;
}

.chart-thumbnail :deep(svg) {
  width: 100%;
  height: auto;
  display: block;
}
</style>
