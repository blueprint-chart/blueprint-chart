<template>
  <div class="section-card">
    <div
      v-if="label"
      class="section-card__label"
    >
      {{ label }}
    </div>
    <div class="section-card__body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label?: string
}>()
</script>

<style scoped lang="scss">
.section-card {
  background: var(--bs-tertiary-bg);
  border-radius: var(--bs-border-radius);
  padding: 0.75rem;

  &__label {
    font-size: 0.6875rem;
    color: var(--bs-secondary-color);
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
