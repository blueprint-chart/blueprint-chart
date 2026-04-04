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

  &--auto {
    background: #f0f0f0;
    overflow: hidden;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      inset: 0;
      background: #1a1a1a;
      clip-path: polygon(100% 0, 100% 100%, 0 100%);
    }
  }

  &--light {
    background: #f0f0f0;
  }

  &--dark {
    background: #1a1a1a;
  }
}
</style>
