<template>
  <ButtonIcon
    :icon-left="IPhArrowsInSimple"
    label="Dock"
    hide-label
    square
    variant="link"
    size="sm"
    class="button-panel-action"
    @click="$emit('click')"
  />
</template>

<script setup lang="ts">
import IPhArrowsInSimple from '~icons/ph/arrows-in-simple'
import ButtonIcon from '../ButtonIcon/ButtonIcon.vue'

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
