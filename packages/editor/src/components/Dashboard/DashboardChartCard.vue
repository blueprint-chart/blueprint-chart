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
    <template #actions>
      <ButtonIcon
        :icon-left="IPhPencilSimple"
        label="Edit"
        hide-label
        square
        variant="primary"
        size="sm"
        class="dashboard-chart-card__edit-btn"
        @click="$emit('edit', chart.id)"
      />
    </template>
    <template #footer>
      <DisplayDate
        v-if="chart.savedAt"
        :value="chart.savedAt"
      />
    </template>
  </GalleryCard>
</template>

<script setup lang="ts">
import IPhPencilSimple from '~icons/ph/pencil-simple'
import { GalleryCard, DisplayDate, ButtonIcon } from '@blueprint-chart/ui'
import type { SavedChartSummary } from '@/composables/useChartSession'

defineProps<{
  chart: SavedChartSummary
  thumbSrc?: string
  selected: boolean
  layout: 'grid' | 'row'
}>()

defineEmits<{
  select: [id: string]
  edit: [id: string]
}>()
</script>
