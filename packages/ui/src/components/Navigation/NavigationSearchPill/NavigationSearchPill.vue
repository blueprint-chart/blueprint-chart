<script setup lang="ts">
const props = withDefaults(defineProps<{
  placeholder: string
  shortcutLabel: string
  shortcutKeys?: string
  ariaLabel?: string
  compact?: boolean
}>(), {
  shortcutKeys: undefined,
  ariaLabel: 'Open search',
  compact: false,
})

defineEmits<{
  click: []
}>()

const rootClass = computed(() => ({
  'navigation-search-pill': true,
  'navigation-search-pill--compact': props.compact,
}))
</script>

<template>
  <button
    type="button"
    :class="rootClass"
    aria-haspopup="dialog"
    :aria-keyshortcuts="shortcutKeys"
    :aria-label="ariaLabel"
    @click="$emit('click')"
  >
    <IconPhMagnifyingGlass
      class="navigation-search-pill__icon"
      aria-hidden="true"
    />
    <span
      v-if="!compact"
      class="navigation-search-pill__text"
    >{{ placeholder }}</span>
    <kbd
      v-if="!compact"
      class="navigation-search-pill__kbd"
    >{{ shortcutLabel }}</kbd>
  </button>
</template>

<style scoped lang="scss">
.navigation-search-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  height: 2rem;
  width: 13.75rem;
  padding: 0 0.75rem;
  border-radius: 999px;
  border: 1px solid var(--bc-tile-border, var(--bs-border-color));
  background: var(--bc-tile-bg, var(--bs-tertiary-bg));
  color: var(--bs-secondary-color);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.12s ease, color 0.12s ease;

  &:hover {
    background: var(--bs-tertiary-bg);
    color: var(--bs-body-color);
  }

  &--compact {
    width: 2rem;
    padding: 0;
    justify-content: center;
  }

  &__icon {
    width: 0.875rem;
    height: 0.875rem;
    flex-shrink: 0;
  }

  &__text {
    flex: 1;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__kbd {
    font-family: var(--bs-font-monospace);
    font-size: 0.75rem;
    padding: 0.0625rem 0.3125rem;
    border: 1px solid var(--bc-tile-border, var(--bs-border-color));
    border-radius: 0.25rem;
    background: var(--bs-body-bg);
    color: var(--bs-secondary-color);
    white-space: nowrap;
    flex-shrink: 0;
  }
}
</style>
