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
    />

    <DashboardDetailMeta
      :chart-type="chartType"
      :saved-at="savedAt"
      :scene-count="sceneCount"
      :row-count="rowCount"
    />

    <DashboardDetailActions
      @duplicate="$emit('duplicate')"
      @delete="$emit('delete')"
    />
  </div>
</template>

<script setup lang="ts">
import { ButtonIcon } from '@blueprint-chart/ui'
import DashboardDetailPreview from './DashboardDetailPreview.vue'
import DashboardDetailMeta from './DashboardDetailMeta.vue'
import DashboardDetailActions from './DashboardDetailActions.vue'
import IPhPencilSimple from '~icons/ph/pencil-simple'

defineProps<{
  title: string
  subtitle?: string
  previewSrc?: string
  forceLightTheme?: boolean
  chartType: string
  savedAt?: string
  sceneCount: number
  rowCount: number
}>()

defineEmits<{
  edit: []
  duplicate: []
  delete: []
}>()
</script>

<style scoped lang="scss">
.dashboard-detail-content {
  &__subtitle {
    font-size: 0.75rem;
    color: var(--bs-secondary-color);
    line-height: 1.5;
    margin-bottom: 0.75rem;
  }

  :deep(.btn) {
    width: 100%;
  }
}
</style>
