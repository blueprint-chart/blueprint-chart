<template>
  <ButtonIcon
    :icon-left="IPhDotsNine"
    label="Drag"
    hide-label
    hide-tooltip
    square
    variant="link"
    size="sm"
    class="button-drag"
  />
</template>

<script setup lang="ts">
import IPhDotsNine from '~icons/ph/dots-nine'
</script>

<style scoped lang="scss">
.button-drag {
  &.btn {
    cursor: grab;
    color: var(--bs-secondary-color);

    &:hover,
    &:focus-visible {
      color: var(--bs-body-color);
    }

    &:active {
      cursor: grabbing;
    }
  }
}
</style>
