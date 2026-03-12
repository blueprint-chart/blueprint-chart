<template>
  <button
    class="dashboard-action-row"
    :class="actionClassList"
    @click="$emit('click')"
  >
    <component
      :is="icon"
      class="dashboard-action-row__icon"
    />
    <div>
      <div class="dashboard-action-row__label">
        {{ label }}
      </div>
      <div
        v-if="description"
        class="dashboard-action-row__description"
      >
        {{ description }}
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { type Component, computed } from 'vue'

const props = defineProps<{
  icon: Component
  label: string
  description?: string
  danger?: boolean
}>()

defineEmits<{
  click: []
}>()

const actionClassList = computed(() => ({
  'dashboard-action-row--danger': props.danger,
}))
</script>

<style scoped lang="scss">
.dashboard-action-row {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5625rem 0.75rem;
  border-radius: var(--bs-border-radius);
  border: 1px solid var(--bs-border-color);
  background: var(--bc-tile-bg);
  cursor: pointer;
  transition: all 0.13s;
  text-align: left;
  width: 100%;

  &:hover {
    background: var(--bs-tertiary-bg);
  }

  &--danger {
    &:hover {
      border-color: var(--bs-danger);
      background: color-mix(in srgb, var(--bs-danger) 5%, transparent);
    }

    .dashboard-action-row__icon,
    .dashboard-action-row__label {
      color: var(--bs-danger);
    }
  }

  &__icon {
    width: 0.875rem;
    height: 0.875rem;
    color: var(--bs-secondary-color);
    flex-shrink: 0;
  }

  &__label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--bs-body-color);
  }

  &__description {
    font-size: 0.6875rem;
    color: var(--bs-secondary-color);
    margin-top: 0.0625rem;
  }
}
</style>
