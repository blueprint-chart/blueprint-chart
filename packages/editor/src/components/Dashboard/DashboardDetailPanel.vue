<template>
  <div
    class="dashboard-detail-panel"
    :class="panelClassList"
  >
    <div class="dashboard-detail-panel__head">
      <div class="dashboard-detail-panel__head-top">
        <div class="dashboard-detail-panel__title">
          {{ title }}
        </div>
        <ButtonIcon
          :icon-left="IPhX"
          label="Close"
          hide-label
          square
          variant="outline-secondary"
          size="sm"
          @click="$emit('close')"
        />
      </div>
      <div
        v-if="subtitle"
        class="dashboard-detail-panel__subtitle"
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
    </div>
    <div class="dashboard-detail-panel__body">
      <div class="dashboard-detail-panel__preview">
        <div
          class="dashboard-detail-panel__preview-inner"
          v-html="thumbnailHtml"
        />
      </div>

      <div class="dashboard-detail-panel__section-title">
        Details
      </div>
      <div class="dashboard-detail-panel__meta-grid">
        <DashboardMetaChip
          label="Chart type"
          :value="chartType"
        />
        <DashboardMetaChip
          label="Scenes"
          :value="sceneCount > 0 ? String(sceneCount) : '\u2014'"
        />
        <DashboardMetaChip
          label="Last edited"
          :value="formattedDate"
        />
      </div>

      <div class="dashboard-detail-panel__section-title">
        Actions
      </div>
      <div class="dashboard-detail-panel__actions">
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ButtonIcon } from '@blueprint-chart/ui'
import DashboardMetaChip from './DashboardMetaChip.vue'
import DashboardActionRow from './DashboardActionRow.vue'
import IPhX from '~icons/ph/x'
import IPhPencilSimple from '~icons/ph/pencil-simple'
import IPhCopy from '~icons/ph/copy'
import IPhTrash from '~icons/ph/trash'

const props = defineProps<{
  open: boolean
  title: string
  subtitle?: string
  thumbnailHtml?: string
  chartType: string
  savedAt?: string
  sceneCount?: number
}>()

defineEmits<{
  close: []
  edit: []
  duplicate: []
  delete: []
}>()

const panelClassList = computed(() => ({
  'dashboard-detail-panel--open': props.open,
}))

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
.dashboard-detail-panel {
  position: fixed;
  top: 3.5rem;
  right: 0;
  bottom: 0;
  width: 380px;
  background: var(--bc-tile-bg);
  border-left: var(--bc-tile-border);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 50;
  overflow: hidden;
}

.dashboard-detail-panel--open {
  transform: translateX(0);
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.07);
}

.dashboard-detail-panel__head {
  padding: 1rem 1.125rem 0.875rem;
  border-bottom: 1px solid var(--bs-border-color);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dashboard-detail-panel__head-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.625rem;
}

.dashboard-detail-panel__title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--bs-body-color);
  line-height: 1.35;
}

.dashboard-detail-panel__subtitle {
  font-size: 0.75rem;
  color: var(--bs-secondary-color);
  line-height: 1.5;
}

.dashboard-detail-panel__body {
  flex: 1;
  overflow-y: auto;
  padding: 1.125rem;
}

.dashboard-detail-panel__preview {
  background: var(--bs-tertiary-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  padding: 0.875rem;
  margin-bottom: 1rem;
  overflow: hidden;
}

.dashboard-detail-panel__preview-inner {
  :deep(svg) {
    width: 100%;
    height: auto;
    display: block;
  }
}

.dashboard-detail-panel__section-title {
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

.dashboard-detail-panel__meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.dashboard-detail-panel__actions {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
</style>
