<template>
  <div class="layout-panel">
    <div class="layout-panel__header">
      <h2 class="layout-panel__title">
        {{ title }}
      </h2>
      <div
        v-if="$slots.actions"
        class="layout-panel__actions"
      >
        <slot name="actions" />
      </div>
    </div>
    <div class="layout-panel__body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<style scoped lang="scss">
.layout-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bs-body-bg);
  border-left: 1px solid var(--bs-border-color);
}

.layout-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--bs-border-color);
  flex-shrink: 0;
}

.layout-panel__title {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
  color: var(--bs-body-color);
}

.layout-panel__actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.layout-panel__body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}
</style>
