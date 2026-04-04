<template>
  <nav
    class="navigation-icon-rail"
    :class="railClassList"
  >
    <slot />
    <ButtonIcon
      v-for="item in resolvedItems"
      :key="item.value"
      :icon-left="item.icon"
      :label="item.tooltip"
      tooltip-placement="left"
      hide-label
      square
      size="lg"
      variant="link"
      class="navigation-icon-rail__button"
      :class="buttonClassList(item.value)"
      :aria-pressed="model === item.value"
      @click="model = item.value"
    />
    <div class="navigation-icon-rail__spacer" />
    <div
      v-if="$slots.footer"
      class="navigation-icon-rail__footer"
    >
      <slot name="footer" />
    </div>
  </nav>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

const model = defineModel<string>({ required: true })

const props = withDefaults(defineProps<{
  items?: { value: string, icon: Component, tooltip: string }[]
  horizontal?: boolean
}>(), {
  items: () => [],
  horizontal: false,
})

const { entries } = useChildEntriesProvider(IconRailEntriesKey)
const resolvedItems = computed(() =>
  entries.value.length > 0 ? entries.value : props.items,
)

const railClassList = computed(() => ({
  'navigation-icon-rail--horizontal': props.horizontal,
}))

function buttonClassList(value: string) {
  return { 'navigation-icon-rail__button--active': model.value === value }
}
</script>

<style scoped lang="scss">
.navigation-icon-rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 48px;
  padding: 0.5rem 0;
  background: transparent;
  border-left: none;
  gap: 0.25rem;

  &__button {
    &.btn {
      border-radius: var(--bs-border-radius);
      border: none;
      background: transparent;
      color: var(--bs-secondary-color);
      transition: color 0.15s ease, opacity 0.15s ease;
    }

    &:hover.btn {
      background: transparent;
      color: var(--bs-body-color);
      opacity: 0.85;
    }

    &--active.btn {
      background: transparent;
      color: var(--bs-body-color);
    }
  }

  &--horizontal {
    flex-direction: row;
    width: auto;
    height: auto;
    padding: 0.25rem 0.5rem;
    border-left: none;
    border-bottom: none;
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__spacer {
    flex: 1;
  }

  &__footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;

    .navigation-icon-rail--horizontal & {
      flex-direction: row;
    }

    :deep(.btn) {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--bs-border-radius);
      border: none;
      background: transparent;
      color: var(--bs-secondary-color);
      transition: color 0.15s ease, opacity 0.15s ease;

      &:hover {
        background: transparent;
        color: var(--bs-body-color);
        opacity: 0.85;
      }
    }
  }
}
</style>
