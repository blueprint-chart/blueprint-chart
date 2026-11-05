<template>
  <span
    class="canvas-mode-swatch"
    :class="`canvas-mode-swatch--${mode}`"
  />
</template>

<script setup lang="ts">
defineProps<{
  mode: 'auto' | 'light' | 'dark'
}>()
</script>

<style scoped lang="scss">
.canvas-mode-swatch {
  width: 32px;
  height: 32px;
  border-radius: 0.25rem;
  border: 1px solid var(--bs-border-color);
  flex-shrink: 0;

  &--auto {
    background: linear-gradient(135deg, #ffffff 50%, #000000 50%);
  }

  &--light {
    background: #ffffff;
  }

  &--dark {
    background: #000000;
  }
}
</style>
