<script setup lang="ts">
import type { Component } from 'vue'
import IPhSidebarSimple from '~icons/ph/sidebar-simple'

withDefaults(defineProps<{
  label: string
  icon?: Component
  disabled?: boolean
}>(), {
  icon: () => IPhSidebarSimple,
  disabled: false,
})

const emit = defineEmits<{
  open: []
}>()

function onClick() {
  emit('open')
}
</script>

<template>
  <button
    class="panel-open-button"
    type="button"
    :aria-label="label"
    :aria-disabled="disabled ? 'true' : undefined"
    :disabled="disabled"
    @click="onClick"
  >
    <component
      :is="icon"
      class="panel-open-button__icon"
      aria-hidden="true"
    />
    <span class="panel-open-button__label">{{ label }}</span>
  </button>
</template>

<style scoped lang="scss">
.panel-open-button {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0 0.875rem 0 0.625rem;
  height: 2rem;
  border: none;
  border-radius: 999px;
  background: var(--bs-primary);
  color: var(--bs-white, #fff);
  font-size: var(--bs-font-size-sm);
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition:
    background-color var(--bc-duration-base, 0.15s) var(--bc-ease, ease),
    box-shadow var(--bc-duration-base, 0.15s) var(--bc-ease, ease),
    opacity var(--bc-duration-base, 0.15s) var(--bc-ease, ease);

  &:hover {
    background: var(--bs-primary);
    box-shadow: 0 0 0 4px rgba(var(--bs-primary-rgb), 0.18);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 4px rgba(var(--bs-primary-rgb), 0.32);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &__icon {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }

  &__label {
    white-space: nowrap;
  }
}
</style>
