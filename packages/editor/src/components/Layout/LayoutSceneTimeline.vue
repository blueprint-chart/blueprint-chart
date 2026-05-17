<script setup lang="ts">
// Chrome-surface wrapper for any scene-timeline content. Supplies the
// background, hairline border-top, and height that align with the shell
// grid; the actual scene rendering still lives in @blueprint-chart/ui's
// SceneTimeline.
</script>

<template>
  <div class="layout-scene-timeline">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.layout-scene-timeline {
  height: 3.125rem;
  background: var(--bc-chrome-bg);
  border-top: 1px solid var(--bc-hairline);
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0 0.875rem;
  flex-shrink: 0;
  overflow-x: auto;
}
</style>
