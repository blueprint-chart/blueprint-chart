<template>
  <div class="dashboard-detail-actions">
    <div class="dashboard-detail-actions__title">
      Actions
    </div>
    <div class="dashboard-detail-actions__list">
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
import DashboardActionRow from './DashboardActionRow.vue'
import IPhCopy from '~icons/ph/copy'
import IPhTrash from '~icons/ph/trash'

defineEmits<{
  duplicate: []
  delete: []
}>()
</script>

<style scoped lang="scss">
.dashboard-detail-actions {
  &__title {
    font-size: var(--bs-font-size-xs);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--bs-secondary-color);
    margin-bottom: 0.625rem;
    margin-top: 1rem;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }
}
</style>
