<template>
  <GalleryCard
    :title="chart.title || 'Untitled'"
    :subtitle="chart.description"
    :thumb-src="thumbSrc"
    :selected="selected"
    :layout="layout"
    :force-light-thumb="!chart.allowDarkMode"
    :serif-title="true"
    @click="$emit('select', chart.id)"
  >
    <template #status>
      <button
        type="button"
        class="dashboard-chart-card__status"
        :class="`dashboard-chart-card__status--${chart.syncState}`"
        :title="statusLabel"
        :aria-label="statusLabel"
        @click="onStatusClick"
      >
        <component :is="statusIcon" />
      </button>
    </template>

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
      <DisplayChartTypeBadge
        :chart-type="chart.chartType"
        :theme="resolvedTheme"
      />
      <DisplayDate
        v-if="chart.savedAt"
        :value="chart.savedAt"
      />
    </template>
  </GalleryCard>
</template>

<script setup lang="ts">
import IPhPencilSimple from '~icons/ph/pencil-simple'
import IPhCloudArrowUp from '~icons/ph/cloud-arrow-up'
import IPhCloudArrowDown from '~icons/ph/cloud-arrow-down'
import IPhCloudCheck from '~icons/ph/cloud-check'
import { GalleryCard, DisplayDate, DisplayChartTypeBadge, ButtonIcon } from '@blueprint-chart/ui'
import { useTheme } from '@/stores/theme'
import type { UnifiedChartSummary } from '@/composables/useDashboardCharts'

const { resolvedTheme } = useTheme()

const props = defineProps<{
  chart: UnifiedChartSummary
  thumbSrc?: string
  selected: boolean
  layout: 'grid' | 'row'
}>()

const emit = defineEmits<{
  select: [id: string]
  edit: [id: string]
  sync: [id: string]
  open: [id: string]
}>()

const statusIcon = computed(() => {
  if (props.chart.syncState === 'synced') {
    return IPhCloudCheck
  }
  return props.chart.syncState === 'cloud' ? IPhCloudArrowDown : IPhCloudArrowUp
})

const statusLabel = computed(() => {
  if (props.chart.syncState === 'synced') {
    return 'Synced to cloud'
  }
  return props.chart.syncState === 'cloud'
    ? 'In the cloud — open to download'
    : 'Local only — sync to cloud'
})

function onStatusClick() {
  if (props.chart.syncState === 'local') {
    emit('sync', props.chart.id)
  }
  else if (props.chart.syncState === 'cloud') {
    emit('open', props.chart.id)
  }
}
</script>

<style scoped lang="scss">
.dashboard-chart-card__status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  border-radius: 0.5rem;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(3px);
  color: #fff;
  font-size: 0.95rem;
  cursor: pointer;

  &--synced { color: #5fd29a; cursor: default; }
  &--cloud { color: #9ec2ff; }
  &--local { color: #e6e9f0; }
}
</style>
