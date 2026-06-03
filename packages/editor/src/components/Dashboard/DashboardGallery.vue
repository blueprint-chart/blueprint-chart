<template>
  <GalleryGrid
    :layout="layout"
    :aria-busy="listLoading || undefined"
  >
    <DashboardNewCard
      :layout="layout"
      @click="$emit('new')"
    />

    <template v-if="listLoading && charts.length === 0">
      <GalleryCard
        v-for="n in SKELETON_COUNT"
        :key="`skeleton-${n}`"
        title=""
        loading
        :layout="layout"
      />
    </template>
    <template v-else>
      <DashboardChartCard
        v-for="chart in charts"
        :key="chart.id"
        :chart="chart"
        :thumb-src="thumbnails[chart.id]"
        :selected="selectedId === chart.id"
        :layout="layout"
        :show-cloud="showCloud"
        @select="$emit('select', $event)"
        @edit="$emit('edit', $event)"
        @sync="$emit('sync', $event)"
        @open="$emit('open', $event)"
      />

      <FeedbackEmptyState
        v-if="charts.length === 0"
        message="No saved charts yet. Create a new chart to get started."
      />
    </template>
  </GalleryGrid>
</template>

<script setup lang="ts">
import { GalleryGrid, GalleryCard, FeedbackEmptyState } from '@blueprint-chart/ui'
import type { UnifiedChartSummary } from '@/composables/useDashboardCharts'

const SKELETON_COUNT = 6

defineProps<{
  charts: UnifiedChartSummary[]
  thumbnails: Record<string, string>
  selectedId: string | null
  layout: 'grid' | 'row'
  showCloud: boolean
}>()

defineEmits<{
  select: [id: string]
  edit: [id: string]
  sync: [id: string]
  open: [id: string]
  new: []
}>()

const wait = useWait()
const listLoading = computed(() => wait.waiting('dashboard-charts'))
</script>
