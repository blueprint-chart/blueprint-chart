<template>
  <div class="dashboard-detail-content">
    <ButtonIcon
      :icon-left="IPhPencilSimple"
      label="Edit chart"
      variant="primary"
      block
      @click="$emit('edit')"
    />

    <div
      v-if="subtitle"
      class="dashboard-detail-content__subtitle"
    >
      {{ subtitle }}
    </div>

    <div class="dashboard-detail-content__preview">
      <div
        class="dashboard-detail-content__preview-inner"
        v-html="thumbnailHtml"
      />
    </div>

    <div class="dashboard-detail-content__section-title">
      Details
    </div>
    <div class="dashboard-detail-content__meta-grid">
      <DashboardMetaChip
        label="Chart type"
        :value="chartType"
      />
      <DashboardMetaChip
        label="Last edited"
        :value="formattedDate"
      />
    </div>

    <div class="dashboard-detail-content__section-title">
      Actions
    </div>
    <div class="dashboard-detail-content__actions">
      <DashboardActionRow
        :icon="IPhCopy"
        label="Duplicate"
        description="Create a copy to edit"
        @click="$emit('duplicate')"
      />
      <DashboardActionRow
        :icon="IPhTrash"
        label="Delete chart"
        description="This cannot be undone"
        danger
        @click="$emit('delete')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ButtonIcon } from '@blueprint-chart/ui'
import DashboardMetaChip from './DashboardMetaChip.vue'
import DashboardActionRow from './DashboardActionRow.vue'
import IPhPencilSimple from '~icons/ph/pencil-simple'
import IPhCopy from '~icons/ph/copy'
import IPhTrash from '~icons/ph/trash'

const props = defineProps<{
  title: string
  subtitle?: string
  thumbnailHtml?: string
  chartType: string
  savedAt?: string
}>()

defineEmits<{
  edit: []
  duplicate: []
  delete: []
}>()

const formattedDate = computed(() => {
  if (!props.savedAt) {
    return '\u2014'
  }
  const d = new Date(props.savedAt)
  if (Number.isNaN(d.getTime())) {
    return props.savedAt
  }
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
})
</script>

<style scoped lang="scss">
.dashboard-detail-content__subtitle {
  font-size: 0.75rem;
  color: var(--bs-secondary-color);
  line-height: 1.5;
  margin-top: 0.75rem;
}

.dashboard-detail-content__preview {
  background: var(--bs-tertiary-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  padding: 0.875rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
  overflow: hidden;
}

.dashboard-detail-content__preview-inner {
  :deep(svg) {
    width: 100%;
    height: auto;
    display: block;
  }
}

.dashboard-detail-content__section-title {
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--bs-secondary-color);
  margin-bottom: 0.625rem;
  margin-top: 1rem;

  &:first-of-type {
    margin-top: 0;
  }
}

.dashboard-detail-content__meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.dashboard-detail-content__actions {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
</style>
