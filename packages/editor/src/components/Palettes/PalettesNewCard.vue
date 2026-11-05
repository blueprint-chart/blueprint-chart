<script setup lang="ts">
import IPhPlus from '~icons/ph/plus'
</script>

<template>
  <button
    type="button"
    class="palettes-new-card"
  >
    <IPhPlus class="palettes-new-card__icon" />
    <span class="palettes-new-card__label">New palette</span>
  </button>
</template>

<style scoped lang="scss">
.palettes-new-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 9.5rem;
  background: var(--bc-tile-bg);
  border: 1px dashed var(--bc-hairline-strong);
  border-radius: var(--bc-radius-md);
  color: var(--bs-secondary-color);
  transition: color var(--bc-duration-base) var(--bc-ease),
              border-color var(--bc-duration-base) var(--bc-ease),
              background var(--bc-duration-base) var(--bc-ease);
  outline: none;

  &:hover {
    border-color: var(--bs-primary);
    color: var(--bs-primary);
    background: color-mix(in srgb, var(--bs-primary) 5%, transparent);
  }

  &:focus-visible {
    box-shadow: var(--bc-focus-ring);
  }

  &__icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  &__label {
    font-size: var(--bs-font-size-sm);
    font-weight: 600;
  }
}
</style>
