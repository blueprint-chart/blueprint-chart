<template>
  <GalleryCard
    :title="chart.title || 'Untitled'"
    :subtitle="chart.description"
    :thumb-src="thumbSrc"
    :selected="selected"
    :layout="layout"
    :force-light-thumb="!chart.allowDarkMode"
    @click="$emit('select', chart.id)"
  >
    <template #footer>
      <DisplayDate
        v-if="chart.savedAt"
        :value="chart.savedAt"
      />
    </template>
  </GalleryCard>
</template>

<script setup lang="ts">
import { GalleryCard, DisplayDate } from '@blueprint-chart/ui'
import type { SavedChartSummary } from '@/composables/useChartSession'

defineProps<{
  chart: SavedChartSummary
  thumbSrc?: string
  selected: boolean
  layout: 'grid' | 'row'
}>()

defineEmits<{
  select: [id: string]
}>()
</script>
