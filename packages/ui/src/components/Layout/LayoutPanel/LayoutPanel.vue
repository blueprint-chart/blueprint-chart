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
    <div
      v-if="$slots.toolbar"
      class="layout-panel__toolbar"
    >
      <slot name="toolbar" />
    </div>
    <div class="layout-panel__body">
      <slot />
    </div>
    <div
      v-if="$slots.footer"
      class="layout-panel__footer"
    >
      <slot name="footer" />
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
  flex: 1;
  min-height: 0;
  background: var(--bc-tile-bg, #ffffff);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    flex-shrink: 0;
  }

  &__title {
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0;
    color: var(--bs-body-color);
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  &__toolbar {
    flex-shrink: 0;
    padding: 0.375rem 0.75rem;
    background: var(--bc-tile-bg-elevated, var(--bs-tertiary-bg));
    border-top: 1px solid var(--bs-border-color);
    border-bottom: 1px solid var(--bs-border-color);
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }

  &__footer {
    flex-shrink: 0;
    padding: 0.75rem 1rem;
  }
}
</style>
