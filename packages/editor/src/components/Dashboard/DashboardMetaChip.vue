<template>
  <div class="dashboard-meta-chip">
    <div class="dashboard-meta-chip__label">
      {{ label }}
    </div>
    <div class="dashboard-meta-chip__value">
      {{ value }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string
}>()
</script>

<style scoped lang="scss">
.dashboard-meta-chip {
  background: var(--bc-tile-bg-elevated);
  border-radius: var(--bc-radius-xs);
  padding: 0.5rem 0.75rem;

  &__label {
    font-size: var(--bs-font-size-xs);
    color: var(--bs-secondary-color);
    font-weight: 500;
    margin-bottom: 0.125rem;
  }

  &__value {
    font-size: var(--bs-font-size-sm);
    font-weight: 700;
    color: var(--bs-body-color);
  }
}
</style>
