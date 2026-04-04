<template>
  <span
    class="display-color-swatch"
    :class="classList"
    :style="{ backgroundColor: color }"
  />
</template>

<script setup lang="ts">

const props = withDefaults(defineProps<{
  color: string
  bordered?: boolean
  size?: 'sm' | 'md'
}>(), {
  size: 'md',
})

const classList = computed(() => ({
  'display-color-swatch--sm': props.size === 'sm',
  'display-color-swatch--bordered': props.bordered,
}))
</script>

<style scoped lang="scss">
.display-color-swatch {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 3px;
  border: 1px solid var(--bs-border-color-translucent);

  &--sm {
    width: 14px;
    height: 14px;
    border: none;
  }

  &--bordered {
    border: 1px solid var(--bs-border-color-translucent);
  }
}
</style>
