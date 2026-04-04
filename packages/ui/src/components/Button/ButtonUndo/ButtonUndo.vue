<template>
  <ButtonIcon
    :icon-left="IPhArrowCounterClockwise"
    label="Undo"
    hide-label
    square
    variant="outline-secondary"
    size="sm"
    :disabled="disabled"
    @click="$emit('click')"
  />
</template>

<script setup lang="ts">
import IPhArrowCounterClockwise from '~icons/ph/arrow-counter-clockwise'

withDefaults(defineProps<{
  disabled?: boolean
}>(), {
  disabled: false,
})

defineEmits<{
  click: []
}>()
</script>
