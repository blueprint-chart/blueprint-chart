<script setup lang="ts">
const slots = useSlots()
const hasNamedSlots = computed(() => Boolean(slots.start || slots.end))
</script>

<template>
  <div class="layout-page-header">
    <template v-if="hasNamedSlots">
      <div class="layout-page-header__start">
        <slot name="start" />
      </div>
      <div class="layout-page-header__end">
        <slot name="end" />
      </div>
    </template>
    <slot v-else />
  </div>
</template>

<style scoped lang="scss">
.layout-page-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
  min-height: 3.5rem;
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
    align-self: stretch;
    gap: 0.5rem;
    margin-left: auto;
  }

  @media (max-width: 767.98px) {
    flex-direction: column;
    align-items: stretch;
    padding: 0;

    &__start,
    &__end {
      width: 100%;
      margin-left: 0;
      padding: 0 1rem;
      min-height: 3rem;
    }

    &__start {
      padding-top: 0.5rem;
    }

    &__end {
      padding-bottom: 0;
      border-top: var(--bc-tile-border);
      justify-content: flex-end;
    }
  }
}
</style>
