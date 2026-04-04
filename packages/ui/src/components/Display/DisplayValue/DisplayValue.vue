<template>
  <span
    class="display-value"
    :class="classList"
  >
    <span class="display-value__text">{{ value }}</span>
    <span
      v-if="unit"
      class="display-value__unit"
    >{{ unit }}</span>
  </span>
</template>

<script setup lang="ts">

const props = withDefaults(defineProps<{
  value: string | number
  unit?: string
  size?: 'sm' | 'md'
}>(), {
  unit: undefined,
  size: 'md',
})

const classList = computed(() => ({
  'display-value--sm': props.size === 'sm',
}))
</script>

<style scoped lang="scss">
.display-value {
  display: inline-flex;
  align-items: baseline;
  gap: 0.25rem;
  font-size: var(--bs-font-size-md);

  &--sm {
    font-size: var(--bs-font-size-sm);
  }

  &__text {
    font-family: var(--bs-font-monospace);
    color: var(--bs-body-color);
  }

  &__unit {
    color: var(--bs-secondary-color);
    font-size: 0.75em;
  }
}
</style>
