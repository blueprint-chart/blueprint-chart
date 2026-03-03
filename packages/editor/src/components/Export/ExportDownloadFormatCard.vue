<template>
  <div
    class="format-card"
    :class="{ 'format-card--selected': selected }"
    @click="$emit('select')"
  >
    <div class="format-card__header">
      <span
        class="format-card__icon"
        :style="{ background: iconBg, color: iconColor }"
      >
        <component :is="icon" />
      </span>
      <div class="format-card__text">
        <div class="format-card__label">
          {{ label }}
        </div>
        <div class="format-card__desc">
          {{ description }}
        </div>
      </div>
      <ButtonIcon
        :icon-left="IPhDownloadSimple"
        label="Download"
        hide-label
        variant="primary"
        size="sm"
        square
        @click.stop="$emit('download')"
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
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:hover {
    border-color: var(--bs-primary-border-subtle);
  }

  &--selected {
    border-color: var(--bs-primary);
    box-shadow: 0 0 0 2px var(--bs-primary-bg-subtle);
  }
}

.format-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
}

.format-card__icon {
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

.format-card__text {
  flex: 1;
  min-width: 0;
}

.format-card__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--bs-body-color);
}

.format-card__desc {
  font-size: 0.6875rem;
  color: var(--bs-secondary-color);
}

.format-card__options {
  padding: 0.75rem;
  border-top: 1px solid var(--bs-border-color);
  background: var(--bs-tertiary-bg);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-radius: 0 0 var(--bs-border-radius) var(--bs-border-radius);
}
</style>
