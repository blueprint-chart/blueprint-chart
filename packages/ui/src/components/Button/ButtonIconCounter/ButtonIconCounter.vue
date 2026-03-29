<script setup lang="ts">
import type { TextColorVariant, ColorVariant } from 'bootstrap-vue-next'

export interface ButtonIconCounterProps {
  counter?: number | null
  variant?: TextColorVariant
}

withDefaults(defineProps<ButtonIconCounterProps>(), {
  counter: null,
  variant: 'secondary',
})
</script>

<template>
  <BBadge
    v-if="counter != null"
    :variant="(variant as ColorVariant)"
    class="button-icon-counter text-nowrap"
    pill
  >
    <slot>{{ counter }}</slot>
  </BBadge>
</template>

<style lang="scss">
.button-icon-counter {
  .btn &.badge {
    top: 0;
  }
}
</style>
