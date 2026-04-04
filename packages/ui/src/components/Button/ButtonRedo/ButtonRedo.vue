<template>
  <ButtonIcon
    :icon-left="IPhArrowClockwise"
    label="Redo"
    hide-label
    square
    variant="outline-secondary"
    size="sm"
    :disabled="disabled"
    @click="$emit('click')"
  />
</template>

<script setup lang="ts">
import IPhArrowClockwise from '~icons/ph/arrow-clockwise'

withDefaults(defineProps<{
  disabled?: boolean
}>(), {
  disabled: false,
})

defineEmits<{
  click: []
}>()
</script>
