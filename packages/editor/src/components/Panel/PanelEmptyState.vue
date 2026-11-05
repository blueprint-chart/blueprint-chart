<template>
  <div class="panel-empty-state">
    <IPhCursorClick class="panel-empty-state__icon" />
    <p class="panel-empty-state__text">
      {{ message }}
    </p>
  </div>
</template>

<script setup lang="ts">
import IPhCursorClick from '~icons/ph/cursor-click'

defineProps<{
  message: string
}>()
</script>

<style scoped lang="scss">
.panel-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
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
    font-size: var(--bs-font-size-sm);
    color: var(--bs-secondary-color);
    margin: 0;
  }
}
</style>
