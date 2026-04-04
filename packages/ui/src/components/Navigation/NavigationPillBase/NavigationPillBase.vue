<template>
  <nav
    class="navigation-pill"
    :class="{ 'navigation-pill--md': size === 'md' }"
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
      {{ item.text }}
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
  size?: 'sm' | 'md'
}>(), {
  ariaLabel: undefined,
  size: 'sm',
})

const emit = defineEmits<{
  select: [key: string]
}>()

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
  display: flex;
  align-items: center;
  gap: 0;
  background: color-mix(in srgb, var(--bs-body-color) 8%, transparent);
  border-radius: 999px;
  padding: 0.125rem;
  position: relative;

  &__bubble {
    position: absolute;
    left: 0;
    background: var(--bs-primary);
    border-radius: 999px;
    height: calc(100% - 0.25rem);
    top: 0.125rem;
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
    gap: 0.375rem;
    background: none;
    border: none;
    padding: 0.25rem 0.75rem;
    cursor: pointer;
    color: var(--bs-body-color);
    font-size: var(--bs-font-size-sm);
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

  &--md {
    padding: 0.25rem;

    .navigation-pill__option {
      padding: 0.375rem 1rem;
      font-size: var(--bs-font-size-md);
      gap: 0.5rem;
    }

    .navigation-pill__bubble {
      height: calc(100% - 0.375rem);
      top: 0.25rem;
    }
  }
}
</style>
