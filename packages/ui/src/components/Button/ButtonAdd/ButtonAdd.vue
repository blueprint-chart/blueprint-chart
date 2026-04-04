<template>
  <ButtonIcon
    :icon-left="PhPlus"
    :label="label"
    variant="outline-secondary"
    class="button-add"
    :class="{ 'button-add--sm': size === 'sm' }"
    @click="$emit('click')"
  >
    <slot />
  </ButtonIcon>
</template>

<script setup lang="ts">
import PhPlus from '~icons/ph/plus'

withDefaults(defineProps<{
  label?: string
  size?: 'default' | 'sm'
}>(), {
  label: 'Add',
  size: 'default',
})

defineEmits<{
  click: []
}>()
</script>

<style scoped lang="scss">
.button-add {
  &.btn {
    width: 100%;
    padding: 0.5rem;
    border: 1px dashed var(--bs-border-color);
    border-radius: var(--bs-border-radius);
    font-size: var(--bs-font-size-sm);
    transition: all 0.15s ease;
    text-align: center;

    --bs-btn-bg: transparent;
    --bs-btn-color: var(--bs-secondary-color);
    --bs-btn-active-bg: transparent;
    --bs-btn-active-color: var(--bs-body-color);
    --bs-btn-active-border-color: var(--bs-body-color);

    &:hover,
    &:focus-visible {
      border-color: var(--bs-secondary-color);
      color: var(--bs-secondary-color);
      background: transparent;
    }
  }

  &--sm.btn {
    width: auto;
    padding: 0 0.6rem;
    height: 26px;
    border-radius: 50rem;
    font-size: var(--bs-font-size-sm);
  }
}
</style>
