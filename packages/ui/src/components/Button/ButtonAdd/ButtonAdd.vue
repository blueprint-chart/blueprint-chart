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
import ButtonIcon from '../ButtonIcon/ButtonIcon.vue'

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
    border: 1px dashed var(--bs-secondary-color);
    border-radius: var(--bs-border-radius);
    font-size: 0.8125rem;
    transition: all 0.15s ease;
    text-align: center;

    --bs-btn-bg: transparent;
    --bs-btn-color: var(--bs-secondary-color);
    --bs-btn-active-bg: transparent;
    --bs-btn-active-border-color: var(--bs-primary);

    &:hover,
    &:focus-visible {
      border-color: var(--bs-primary);
      color: var(--bs-primary);
      background: transparent;
    }
  }

  &--sm.btn {
    width: auto;
    padding: 0 0.6rem;
    height: 26px;
    border-radius: 50rem;
    font-size: 0.75rem;
  }
}
</style>
