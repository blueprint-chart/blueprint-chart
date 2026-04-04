<template>
  <GalleryGrid :layout="layout">
    <DashboardNewCard
      :layout="layout"
      @click="$emit('new')"
    />

    <DashboardChartCard
      v-for="chart in charts"
      :key="chart.id"
      :chart="chart"
      :thumb-src="thumbnails[chart.id]"
      :selected="selectedId === chart.id"
      :layout="layout"
      @select="$emit('select', $event)"
      @edit="$emit('edit', $event)"
    />

    <FeedbackEmptyState
      v-if="charts.length === 0"
      message="No saved charts yet. Create a new chart to get started."
    />
  </GalleryGrid>
</template>

<script setup lang="ts">
import { GalleryGrid, FeedbackEmptyState } from '@blueprint-chart/ui'
import type { SavedChartSummary } from '@/stores/chartSession'

defineProps<{
  charts: SavedChartSummary[]
  thumbnails: Record<string, string>
  selectedId: string | null
  layout: 'grid' | 'row'
}>()

defineEmits<{
  select: [id: string]
  edit: [id: string]
  new: []
}>()
</script>
