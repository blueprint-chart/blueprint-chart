<template>
  <span class="display-number">
    <span class="display-number__text">{{ formatted }}</span>
    <span
      v-if="unit"
      class="display-number__unit"
    >{{ unit }}</span>
  </span>
</template>

<script setup lang="ts">

const props = defineProps<{
  value: number
  precision?: number
  unit?: string
}>()

const formatted = computed(() => {
  if (props.precision != null) {
    return props.value.toFixed(props.precision)
  }
  return String(props.value)
})
</script>

<style scoped lang="scss">
.display-number {
  display: inline-flex;
  align-items: baseline;
  gap: 0.25rem;
  font-family: var(--bs-font-monospace);
  font-size: var(--bs-font-size-md);
  color: var(--bs-body-color);

  &__unit {
    color: var(--bs-secondary-color);
    font-size: 0.75em;
  }
}
</style>
