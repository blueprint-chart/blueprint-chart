<script setup lang="ts">
import IPhPalette from '~icons/ph/palette'
</script>

<template>
  <div class="palettes-empty-state">
    <IPhPalette class="palettes-empty-state__icon" />
    <p class="palettes-empty-state__text">
      Select a palette to edit it
    </p>
  </div>
</template>

<style scoped lang="scss">
.palettes-empty-state {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem 1rem;
  text-align: center;

  &__icon {
    width: 2rem;
    height: 2rem;
    color: var(--bs-secondary-color);
    opacity: 0.5;
  }

  &__text {
    margin: 0;
    font-size: var(--bs-font-size-sm);
    color: var(--bs-secondary-color);
  }
}
</style>
