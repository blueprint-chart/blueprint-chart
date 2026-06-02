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
        v-if="!confirming"
        :icon="IPhTrash"
        label="Delete chart"
        :description="deleteHint"
        danger
        data-test="delete"
        @click="confirming = true"
      />
      <div
        v-else
        class="dashboard-detail-actions__confirm"
      >
        <p class="dashboard-detail-actions__confirm-text">
          {{ confirmText }}
        </p>
        <div class="dashboard-detail-actions__confirm-buttons">
          <button
            type="button"
            class="btn btn-link btn-sm"
            data-test="cancel-delete"
            @click="confirming = false"
          >
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-danger btn-sm"
            data-test="confirm-delete"
            @click="onConfirm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IPhCopy from '~icons/ph/copy'
import IPhTrash from '~icons/ph/trash'
import type { SyncState } from '@/composables/useDashboardCharts'

const props = defineProps<{ syncState: SyncState }>()

const emit = defineEmits<{
  duplicate: []
  delete: []
}>()

const confirming = ref(false)

const scope = computed(() =>
  props.syncState === 'local' ? 'this device' : 'your account and every device',
)
const deleteHint = 'This cannot be undone'
const confirmText = computed(() => `Delete this chart from ${scope.value}? This can't be undone.`)

function onConfirm() {
  confirming.value = false
  emit('delete')
}
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

  &__confirm {
    border: 1px solid var(--bs-border-color);
    border-radius: var(--bc-radius-md, 0.5rem);
    padding: 0.75rem;
  }

  &__confirm-text {
    font-size: var(--bs-font-size-sm);
    margin: 0 0 0.5rem;
  }

  &__confirm-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
}
</style>
