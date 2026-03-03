<template>
  <label class="toggle-switch">
    <input
      type="checkbox"
      class="toggle-switch__input"
      :checked="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    >
    <span class="toggle-switch__track" />
    <span class="toggle-switch__label">{{ label }}</span>
  </label>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  label: string
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<style scoped lang="scss">
.toggle-switch {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.toggle-switch__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch__track {
  position: relative;
  width: 2rem;
  height: 1.125rem;
  background: var(--bs-secondary-bg);
  border-radius: 1rem;
  border: 1px solid var(--bs-border-color);
  transition: background 0.15s, border-color 0.15s;
  flex-shrink: 0;

  &::after {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    background: var(--bs-body-color);
    transition: transform 0.15s;
  }

  .toggle-switch__input:checked + & {
    background: var(--bs-primary);
    border-color: var(--bs-primary);

    &::after {
      transform: translateX(0.875rem);
      background: #fff;
    }
  }

  .toggle-switch__input:focus-visible + & {
    box-shadow: 0 0 0 2px var(--bs-primary-bg-subtle);
  }
}

.toggle-switch__label {
  font-size: 0.75rem;
  color: var(--bs-body-color);
}
</style>
