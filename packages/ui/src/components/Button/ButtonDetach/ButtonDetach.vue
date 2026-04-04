<template>
  <ButtonIcon
    :icon-left="IPhArrowsOutSimple"
    label="Detach"
    hide-label
    square
    variant="link"
    size="sm"
    class="button-panel-action"
    @click="$emit('click')"
  />
</template>

<script setup lang="ts">
import IPhArrowsOutSimple from '~icons/ph/arrows-out-simple'

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
