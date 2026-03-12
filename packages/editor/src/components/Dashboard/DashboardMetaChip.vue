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
  background: var(--bs-tertiary-bg);
  border-radius: var(--bs-border-radius);
  padding: 0.5625rem 0.6875rem;

  &__label {
    font-size: 0.625rem;
    color: var(--bs-secondary-color);
    font-weight: 500;
    margin-bottom: 0.125rem;
  }

  &__value {
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--bs-body-color);
  }
}
</style>
