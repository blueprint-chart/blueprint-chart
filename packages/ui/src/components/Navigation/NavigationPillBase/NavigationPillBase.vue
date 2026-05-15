<template>
  <nav
    class="navigation-pill"
    :class="sizeClass"
    :aria-label="ariaLabel"
  >
    <slot />
    <div
      class="navigation-pill__bubble"
      :class="{ 'navigation-pill__bubble--ready': ready }"
      :style="bubbleStyle"
    />
    <button
      v-for="item in items"
      :key="item.key"
      ref="buttonRefs"
      class="navigation-pill__option"
      :class="{
        'navigation-pill__option--active': item.active,
        'navigation-pill__option--done': item.done,
        'navigation-pill__option--disabled': item.disabled,
      }"
      :disabled="item.disabled"
      :aria-current="item.active ? 'step' : undefined"
      @click="onSelect(item)"
    >
      <component
        :is="item.icon"
        v-if="item.icon"
        class="navigation-pill__option__icon"
      />
      <span class="navigation-pill__option__label">{{ item.text }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

export interface NavigationPillItem {
  key: string
  text: string
  icon?: Component
  active: boolean
  disabled?: boolean
  done?: boolean
}

const props = withDefaults(defineProps<{
  items: NavigationPillItem[]
  ariaLabel?: string
  /**
   * Size of the pill nav. Default `md` matches `.btn` height,
   * `sm` matches `.btn-sm` height.
   */
  size?: 'sm' | 'md'
}>(), {
  ariaLabel: undefined,
  size: 'md',
})

const emit = defineEmits<{
  select: [key: string]
}>()

const sizeClass = computed(() => `navigation-pill--${props.size}`)

const buttonRefs = useTemplateRef<Element[]>('buttonRefs')
const bubbleX = shallowRef(0)
const bubbleW = shallowRef(0)
const ready = shallowRef(false)

const bubbleStyle = computed(() => ({
  transform: `translateX(${bubbleX.value}px)`,
  width: `${bubbleW.value}px`,
}))

function updateBubble() {
  const buttons = buttonRefs.value
  if (!buttons) {
    return
  }
  const idx = props.items.findIndex(item => item.active)
  if (idx < 0 || !buttons[idx]) {
    return
  }
  const el = buttons[idx] as HTMLElement
  bubbleX.value = el.offsetLeft
  bubbleW.value = el.offsetWidth
}

onMounted(() => {
  nextTick(() => window.requestAnimationFrame(() => {
    updateBubble()
    window.requestAnimationFrame(() => {
      ready.value = true
    })
  }))
})

watch(() => props.items, () => {
  nextTick(updateBubble)
}, { deep: true })

function onSelect(item: NavigationPillItem) {
  if (!item.disabled) {
    emit('select', item.key)
  }
}
</script>

<style scoped lang="scss">
.navigation-pill {
  display: inline-flex;
  align-items: center;
  gap: 0;
  background: color-mix(in srgb, var(--bs-body-color) 8%, transparent);
  border-radius: 999px;
  position: relative;

  // Matches Bootstrap `.btn` computed height (padding-y 0.375rem, font-size 1rem,
  // line-height 1.5, 1px border each side -> 2.375rem).
  &--md {
    --pill-padding: 0.25rem;
    --pill-option-padding-y: 0.1875rem;
    --pill-option-padding-x: 0.75rem;
    --pill-option-font-size: 1rem;
    --pill-option-gap: 0.5rem;

    padding: var(--pill-padding);
    min-height: 2.375rem;
  }

  // Matches Bootstrap `.btn-sm` computed height (padding-y 0.25rem,
  // font-size 0.875rem, line-height 1.5, 1px border each side -> 1.9375rem).
  &--sm {
    --pill-padding: 0.125rem;
    --pill-option-padding-y: 0.1875rem;
    --pill-option-padding-x: 0.5rem;
    --pill-option-font-size: 0.875rem;
    --pill-option-gap: 0.375rem;

    padding: var(--pill-padding);
    min-height: 1.9375rem;
  }

  &__bubble {
    position: absolute;
    left: 0;
    top: var(--pill-padding);
    height: calc(100% - var(--pill-padding) * 2);
    background: var(--bs-primary);
    border-radius: 999px;
    z-index: 0;
    pointer-events: none;

    &--ready {
      transition: transform 0.2s ease, width 0.2s ease, opacity 0.15s ease;
    }

    &:not(&--ready) {
      visibility: hidden;
    }
  }

  &__option {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: var(--pill-option-gap);
    background: none;
    border: none;
    padding: var(--pill-option-padding-y) var(--pill-option-padding-x);
    cursor: pointer;
    color: var(--bs-body-color);
    font-size: var(--pill-option-font-size);
    line-height: 1.5;
    border-radius: 999px;
    transition: color 0.15s ease;
    white-space: nowrap;

    &:hover:not(:disabled):not(.navigation-pill__option--active) {
      color: var(--bs-emphasis-color);
    }

    &--done {
      color: var(--bs-body-color);
    }

    &--active {
      color: var(--bs-white, #fff);
      font-weight: 600;
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

      &:has(.navigation-pill__option__icon) .navigation-pill__option__label {
        display: none;
      }
    }
  }
}
</style>
