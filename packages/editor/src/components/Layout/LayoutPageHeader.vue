<script setup lang="ts"></script>

<template>
  <div class="layout-page-header">
    <template v-if="$slots.start || $slots.end">
      <div class="layout-page-header__start">
        <slot name="start" />
      </div>
      <div class="layout-page-header__end">
        <slot name="end" />
      </div>
    </template>
    <template v-else>
      <slot />
    </template>
  </div>
</template>

<style scoped lang="scss">
.layout-page-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
  height: 3.5rem;
  padding: 0 1.25rem;
  background: var(--bc-tile-bg);
  border-bottom: var(--bc-tile-border);
  flex-shrink: 0;

  &__start {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
  }

  &__end {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: auto;
  }
}
</style>
