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
        v-if="showCloud"
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
import IPhCloudCheck from '~icons/ph/cloud-check'
import { GalleryCard, DisplayDate, DisplayChartTypeBadge, ButtonIcon } from '@blueprint-chart/ui'
import { useTheme } from '@/stores/theme'
import type { UnifiedChartSummary } from '@/composables/useDashboardCharts'

const { resolvedTheme } = useTheme()

const props = withDefaults(defineProps<{
  chart: UnifiedChartSummary
  thumbSrc?: string
  selected: boolean
  layout: 'grid' | 'row'
  /** Whether cloud sync is available (accounts on + signed in). When false the
   *  sync-state pill is hidden — there's no cloud to sync to. */
  showCloud?: boolean
}>(), { showCloud: true })

const emit = defineEmits<{
  select: [id: string]
  edit: [id: string]
  sync: [id: string]
  open: [id: string]
}>()

const statusIcon = computed(() => {
  // A chart that lives in the cloud reads the same to the user whether or not
  // it's also been pulled to this device ('synced') — both are simply "in the
  // cloud", so they share the check icon. Only a chart that exists *only*
  // locally (not backed up yet) gets the distinct upload icon.
  if (props.chart.syncState === 'local') {
    return IPhCloudArrowUp
  }
  return IPhCloudCheck
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
  // Translucent body-bg so the pill blends into the page in both themes,
  // instead of the heavy dark scrim that was too prominent on light mode.
  background: color-mix(in srgb, var(--bs-body-bg) 70%, transparent);
  backdrop-filter: blur(3px);
  color: var(--bs-body-color);
  font-size: 0.95rem;
  cursor: pointer;

  // 'synced' and 'cloud' both mean "in the cloud" — same green. 'synced' is
  // non-interactive (already here); 'cloud' stays clickable to pull it down.
  &--synced { color: #2d8659; cursor: default; }
  &--cloud { color: #2d8659; }
  &--local { color: #163a65; }
}
</style>
