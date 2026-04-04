<template>
  <ButtonIcon
    :icon-left="IPhX"
    label="Close"
    hide-label
    square
    variant="link"
    size="sm"
    class="button-panel-action"
    @click="$emit('click')"
  />
</template>

<script setup lang="ts">
import IPhX from '~icons/ph/x'

defineEmits<{
  click: []
}>()
</script>

<style scoped lang="scss">
.button-panel-action {
  &.btn {
    color: var(--bs-secondary-color);

    &:hover,
    &:focus-visible {
      color: var(--bs-body-color);
    }
  }
}
</style>
