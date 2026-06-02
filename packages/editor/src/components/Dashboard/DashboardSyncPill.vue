<template>
  <span
    v-if="count > 0"
    class="dashboard-sync-pill"
    :class="{ 'dashboard-sync-pill--busy': syncing }"
  >
    <IPhCloudArrowUp class="dashboard-sync-pill__icon" aria-hidden="true" />
    <template v-if="syncing">
      <span>Backing up…</span>
    </template>
    <template v-else>
      <span class="dashboard-sync-pill__label">{{ count }} on this device</span>
      <button
        type="button"
        class="dashboard-sync-pill__btn"
        @click="emit('sync')"
      >
        {{ count === 1 ? 'Back up' : 'Back up all' }}
      </button>
    </template>
  </span>
</template>

<script setup lang="ts">
import IPhCloudArrowUp from '~icons/ph/cloud-arrow-up'

defineProps<{ count: number, syncing: boolean }>()
const emit = defineEmits<{ sync: [] }>()
</script>

<style scoped lang="scss">
.dashboard-sync-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.3rem 0.25rem 0.7rem;
  border-radius: var(--bc-radius-pill);
  background: #e1eef7; // $prussian-50 — light brand tint
  color: #102e55; // $prussian-700
  font-size: 0.78rem;
  font-weight: 500;
  line-height: 1;

  &--busy {
    padding-right: 0.7rem;
    background: #eef1f4;
    color: var(--bs-secondary-color);
  }

  &__icon {
    font-size: 0.95rem;
    flex-shrink: 0;
  }

  &__btn {
    border: none;
    border-radius: var(--bc-radius-pill);
    background: var(--bs-primary);
    color: #fff;
    padding: 0.28rem 0.7rem;
    font-size: 0.72rem;
    font-weight: 500;
    cursor: pointer;

    &:hover {
      background: #163a65; // $prussian-600
    }
  }
}
</style>
