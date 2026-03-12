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
  background: var(--bs-tertiary-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  margin-top: 1rem;
  margin-bottom: 1rem;
  height: min(300px, 30vh);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem;
}

.dashboard-detail-preview__img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  box-shadow: var(--bs-box-shadow-sm);
}
</style>
