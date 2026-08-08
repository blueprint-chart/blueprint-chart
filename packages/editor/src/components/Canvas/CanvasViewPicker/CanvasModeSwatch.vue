<template>
  <span
    class="canvas-mode-swatch"
    :class="`canvas-mode-swatch--${mode}`"
  />
</template>

<script setup lang="ts">
defineProps<{
  mode: 'blueprint' | 'auto' | 'light' | 'dark'
}>()
</script>

<style scoped lang="scss">
.canvas-mode-swatch {
  width: 32px;
  height: 32px;
  border-radius: 0.25rem;
  border: 1px solid var(--bs-border-color);
  flex-shrink: 0;

  &--blueprint {
    background: var(--bc-canvas-bg);
    background-image:
      linear-gradient(var(--bc-canvas-grid-color) 1px, transparent 1px),
      linear-gradient(90deg, var(--bc-canvas-grid-color) 1px, transparent 1px);
    background-size: 8px 8px;
  }

  // Auto resolves to the explicit light/dark surface for the current theme, so
  // its swatch mirrors that token: #ffffff in light, #000000 in dark.
  &--auto {
    background: var(--bc-chrome-bg);
  }

  &--light {
    background: #f0f0f0;
  }

  &--dark {
    background: #000000;
  }
}
</style>
