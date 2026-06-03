<template>
  <div class="dashboard-detail-content">
    <div
      v-if="subtitle"
      class="dashboard-detail-content__subtitle"
    >
      {{ subtitle }}
    </div>

    <ButtonIcon
      :icon-left="IPhPencilSimple"
      label="Edit chart"
      variant="primary"
      block
      @click="$emit('edit')"
    />

    <DashboardDetailPreview
      :src="previewSrc"
      :force-light-theme="forceLightTheme"
      :loading="previewLoading"
    />

    <DashboardDetailMeta
      :chart-type="chartType"
      :saved-at="savedAt"
      :scene-count="sceneCount"
      :row-count="rowCount"
    />

    <ButtonIcon
      v-if="showCloud && syncState === 'local'"
      :icon-left="IPhCloudArrowUp"
      label="Sync to cloud"
      variant="secondary"
      block
      class="dashboard-detail-content__sync"
      @click="$emit('sync')"
    />

    <DashboardDetailActions
      :sync-state="syncState"
      @duplicate="$emit('duplicate')"
      @delete="$emit('delete')"
    />
  </div>
</template>

<script setup lang="ts">
import { ButtonIcon } from '@blueprint-chart/ui'
import IPhPencilSimple from '~icons/ph/pencil-simple'
import IPhCloudArrowUp from '~icons/ph/cloud-arrow-up'
import type { SyncState } from '@/composables/useDashboardCharts'

defineProps<{
  title: string
  subtitle?: string
  previewSrc?: string
  previewLoading?: boolean
  forceLightTheme?: boolean
  chartType: string
  savedAt?: string
  sceneCount: number
  rowCount: number
  syncState: SyncState
  /** Whether cloud sync is available (accounts on + signed in). When false the
   *  "Sync to cloud" action is hidden. */
  showCloud: boolean
}>()

defineEmits<{
  edit: []
  duplicate: []
  delete: []
  sync: []
}>()
</script>

<style scoped lang="scss">
.dashboard-detail-content {
  &__subtitle {
    font-size: var(--bs-font-size-sm);
    color: var(--bs-secondary-color);
    line-height: 1.5;
    margin-bottom: 0.75rem;
  }

  &__sync {
    margin-top: 0.5rem;
  }

  :deep(.btn) {
    width: 100%;
  }
}
</style>
