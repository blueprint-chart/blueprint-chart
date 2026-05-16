<template>
  <div
    v-if="src"
    class="dashboard-detail-preview"
    :data-bs-theme="forceLightTheme ? 'light' : undefined"
  >
    <img
      :src="src"
      alt=""
      class="dashboard-detail-preview__img"
    >
  </div>
</template>

<script setup lang="ts">
defineProps<{
  src?: string
  forceLightTheme?: boolean
}>()
</script>

<style scoped lang="scss">
.dashboard-detail-preview {
  background: var(--bc-tile-bg-elevated);
  border-radius: var(--bc-tile-radius-sm);
  margin-top: 1rem;
  margin-bottom: 1rem;
  height: min(300px, 30vh);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem;

  &__img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    display: block;
    border-radius: var(--bc-tile-radius-xs);
  }
}
</style>
