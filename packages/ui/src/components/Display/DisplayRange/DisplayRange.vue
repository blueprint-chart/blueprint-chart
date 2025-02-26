<template>
  <span class="display-range">
    <span class="display-range__text">{{ min }}</span>
    <span class="display-range__separator">&ndash;</span>
    <span class="display-range__text">{{ max }}</span>
    <span
      v-if="unit"
      class="display-range__unit"
    >{{ unit }}</span>
  </span>
</template>

<script setup lang="ts">
defineProps<{
  min: number | string
  max: number | string
  unit?: string
}>()
</script>

<style scoped lang="scss">
.display-range {
  display: inline-flex;
  align-items: baseline;
  gap: 0.25rem;
  font-family: var(--bs-font-monospace);
  font-size: 0.875rem;
  color: var(--bs-body-color);

  &__separator {
    color: var(--bs-secondary-color);
  }

  &__unit {
    color: var(--bs-secondary-color);
    font-size: 0.75em;
  }
}
</style>
