<template>
  <div
    class="format-card"
    :class="{ 'format-card--selected': selected }"
  >
    <div class="format-card__header">
      <button
        type="button"
        class="format-card__header__select"
        :aria-expanded="selected"
        @click="$emit('select')"
      >
        <span
          class="format-card__header__select__icon"
          :style="{ background: iconBg, color: iconColor }"
        >
          <component :is="icon" />
        </span>
        <span class="format-card__header__select__text">
          <span class="format-card__header__select__text__label">
            {{ label }}
          </span>
          <span class="format-card__header__select__text__desc">
            {{ description }}
          </span>
        </span>
      </button>
      <ButtonIcon
        :icon-left="IPhDownloadSimple"
        label="Download"
        hide-label
        variant="primary"
        size="sm"
        square
        @click="$emit('download')"
      />
    </div>
    <div
      v-if="selected && $slots.default"
      class="format-card__options"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { ButtonIcon } from '@blueprint-chart/ui'
import IPhDownloadSimple from '~icons/ph/download-simple'

defineProps<{
  selected: boolean
  icon: Component
  label: string
  description: string
  iconBg: string
  iconColor: string
}>()

defineEmits<{
  select: []
  download: []
}>()
</script>

<style scoped lang="scss">
.format-card {
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  background: var(--bs-body-bg);
  transition: border-color var(--bc-duration-base), box-shadow var(--bc-duration-base);

  &:hover {
    border-color: var(--bs-primary-border-subtle);
  }

  &--selected {
    border-color: var(--bs-primary);
    box-shadow: 0 0 0 2px var(--bs-primary-bg-subtle);
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;

    &__select {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0;
      border: 0;
      background: none;
      color: inherit;
      text-align: left;
      cursor: pointer;
      border-radius: var(--bs-border-radius-sm);

      &:focus-visible {
        outline: 2px solid var(--bs-emphasis-color);
        outline-offset: -2px;
      }

      &__icon {
        width: 2rem;
        height: 2rem;
        border-radius: 0.375rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        :deep(svg) {
          width: 1.125rem;
          height: 1.125rem;
        }
      }

      &__text {
        flex: 1;
        min-width: 0;

        &__label,
        &__desc {
          display: block;
        }

        &__label {
          font-size: var(--bs-font-size-sm);
          font-weight: 600;
          color: var(--bs-body-color);
        }

        &__desc {
          font-size: var(--bs-font-size-xs);
          color: var(--bs-secondary-color);
        }
      }
    }
  }

  &__options {
    padding: 0.75rem;
    border-top: 1px solid var(--bs-border-color);
    background: var(--bc-tile-bg-elevated);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border-radius: 0 0 var(--bs-border-radius) var(--bs-border-radius);
  }
}
</style>
