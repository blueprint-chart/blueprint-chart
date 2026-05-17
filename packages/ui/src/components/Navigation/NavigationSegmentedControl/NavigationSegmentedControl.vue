<template>
  <nav
    class="navigation-segmented-control"
    :class="sizeClass"
    :aria-label="ariaLabel"
  >
    <slot />
    <button
      v-for="item in items"
      :key="item.key"
      class="navigation-segmented-control__option"
      :class="{
        'navigation-segmented-control__option--active': item.active,
        'navigation-segmented-control__option--disabled': item.disabled,
      }"
      :disabled="item.disabled"
      :aria-current="item.active ? 'true' : undefined"
      type="button"
      @click="onSelect(item)"
    >
      <component
        :is="item.icon"
        v-if="item.icon"
        class="navigation-segmented-control__option__icon"
      />
      <span class="navigation-segmented-control__option__label">{{ item.text }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

export interface NavigationSegmentedControlItem {
  key: string
  text: string
  icon?: Component
  active: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  items: NavigationSegmentedControlItem[]
  ariaLabel?: string
  size?: 'sm' | 'md'
}>(), {
  ariaLabel: undefined,
  size: 'md',
})

const emit = defineEmits<{
  select: [key: string]
}>()

const sizeClass = computed(() => `navigation-segmented-control--${props.size}`)

function onSelect(item: NavigationSegmentedControlItem) {
  if (!item.disabled) {
    emit('select', item.key)
  }
}
</script>

<style scoped lang="scss">
.navigation-segmented-control {
  display: inline-flex;
  align-items: center;
  gap: 0;
  background: var(--bc-wash-soft);
  border: 1px solid var(--bc-hairline);
  border-radius: var(--bc-radius-sm);

  // Match Bootstrap `.btn` computed height: padding-y 0.375rem + font-size 1rem
  // × line-height 1.5 + 1px border each side → 2.375rem (38 px).
  &--md {
    --segmented-padding: 2px;
    --segmented-option-padding-y: calc(0.375rem - 2px);
    --segmented-option-padding-x: 0.75rem;
    --segmented-option-font-size: 1rem;
    --segmented-option-gap: 0.5rem;

    padding: var(--segmented-padding);
    min-height: 2.375rem;
  }

  // Match Bootstrap `.btn-sm` computed height: padding-y 0.25rem + font-size
  // 0.875rem × line-height 1.5 + 1px border each side → 1.9375rem (31 px).
  &--sm {
    --segmented-padding: 2px;
    --segmented-option-padding-y: calc(0.25rem - 2px);
    --segmented-option-padding-x: 0.5rem;
    --segmented-option-font-size: 0.875rem;
    --segmented-option-gap: 0.375rem;

    padding: var(--segmented-padding);
    min-height: 1.9375rem;
  }

  &__option {
    display: inline-flex;
    align-items: center;
    gap: var(--segmented-option-gap);
    background: transparent;
    border: none;
    padding: var(--segmented-option-padding-y) var(--segmented-option-padding-x);
    cursor: pointer;
    color: var(--bs-secondary-color);
    font-size: var(--segmented-option-font-size);
    line-height: 1.5;
    border-radius: var(--bc-radius-xs);
    transition: background var(--bc-duration-base) var(--bc-ease),
                color var(--bc-duration-base) var(--bc-ease);
    white-space: nowrap;

    &:hover:not(:disabled):not(&--active) {
      color: var(--bs-body-color);
    }

    &--active {
      background: var(--bc-wash-firm);
      color: var(--bs-body-color);
      font-weight: 500;
    }

    &--disabled {
      opacity: 0.4;
      cursor: not-allowed;
      pointer-events: none;
    }

    &__icon {
      width: 1em;
      height: 1em;
      flex-shrink: 0;
    }
  }

  @media (max-width: 575.98px) {
    &__option {
      padding-left: 0.5rem;
      padding-right: 0.5rem;

      &:has(.navigation-segmented-control__option__icon) .navigation-segmented-control__option__label {
        display: none;
      }
    }
  }
}
</style>
