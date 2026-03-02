<template>
  <div
    class="step-card"
    :class="{ 'step-card--active': active }"
    @click="$emit('select')"
  >
    <div class="step-card__number">
      {{ index + 1 }}
    </div>
    <div class="step-card__body">
      <span
        class="step-card__icon"
        :class="iconClass"
      >
        <component
          :is="iconComponent"
          v-if="iconComponent"
        />
        <span v-else>{{ iconFallback }}</span>
      </span>
      <div class="step-card__text">
        <div class="step-card__name">
          {{ label }}
        </div>
        <div class="step-card__desc">
          {{ description }}
        </div>
      </div>
    </div>
    <div class="step-card__actions">
      <button
        class="step-card__action"
        aria-label="Remove step"
        @click.stop="$emit('delete')"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        ><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
      </button>
    </div>
    <div
      v-if="active && $slots.default"
      class="step-card__config"
      @click.stop
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import type { TransformStep } from '@/composables/useDataTransforms'
import IPhSortAscending from '~icons/ph/sort-ascending'
import IPhFunnel from '~icons/ph/funnel'
import IPhArrowsClockwise from '~icons/ph/arrows-clockwise'
import IPhEyeSlash from '~icons/ph/eye-slash'

const props = defineProps<{
  step: TransformStep
  index: number
  active: boolean
}>()

defineEmits<{
  select: []
  delete: []
}>()

const iconClassMap: Record<string, string> = {
  'sort': 'step-card__icon--sort',
  'filter': 'step-card__icon--filter',
  'hide-columns': 'step-card__icon--hide-columns',
  'transpose': 'step-card__icon--transpose',
  'group-by': 'step-card__icon--group',
  'computed': 'step-card__icon--computed',
  'pivot': 'step-card__icon--pivot',
}

const iconComponentMap: Record<string, Component> = {
  'sort': IPhSortAscending,
  'filter': IPhFunnel,
  'hide-columns': IPhEyeSlash,
  'transpose': IPhArrowsClockwise,
}

const iconFallbackMap: Record<string, string> = {
  'sort': 'S',
  'filter': 'F',
  'hide-columns': 'H',
  'transpose': 'T',
  'group-by': 'G',
  'computed': 'C',
  'pivot': 'P',
}

const labelMap: Record<string, string> = {
  'sort': 'Sort',
  'filter': 'Filter',
  'hide-columns': 'Hide Columns',
  'transpose': 'Transpose',
  'group-by': 'Group By',
  'computed': 'Computed',
  'pivot': 'Pivot',
}

const iconClass = computed(() => iconClassMap[props.step.type] ?? '')
const iconComponent = computed(() => iconComponentMap[props.step.type] ?? null)
const iconFallback = computed(() => iconFallbackMap[props.step.type] ?? '?')
const label = computed(() => labelMap[props.step.type] ?? props.step.type)

const description = computed(() => {
  const { step } = props
  if (step.type === 'sort' && step.config.column) {
    return `${step.config.column} ${step.config.direction ?? 'ascending'}`
  }
  if (step.type === 'filter' && step.config.column) {
    return `${step.config.column} ${step.config.condition ?? 'equals'} ${step.config.value ?? ''}`
  }
  if (step.type === 'hide-columns') {
    const cols = step.config.columns ? step.config.columns.split(',').map(c => c.trim()).filter(Boolean) : []
    return cols.length > 0 ? `Hiding ${cols.join(', ')}` : 'Configure...'
  }
  if (step.type === 'transpose') {
    return 'Swap rows \u2194 columns'
  }
  return 'Configure...'
})
</script>

<style scoped lang="scss">
.step-card {
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
  position: relative;
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  background: var(--bs-body-bg);
  overflow: hidden;
  transition: all 0.15s;
  cursor: pointer;

  &:hover {
    border-color: var(--bs-primary-border-subtle);
    box-shadow: 0 0 0 2px var(--bs-primary-bg-subtle);
  }

  &--active {
    border-color: var(--bs-primary);
    box-shadow: 0 0 0 2px var(--bs-primary-bg-subtle);
  }
}

.step-card__number {
  width: 2rem;
  min-width: 2rem;
  background: var(--bs-tertiary-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--bs-secondary-color);
  border-right: 1px solid var(--bs-border-color);

  .step-card--active & {
    background: var(--bs-primary-bg-subtle);
    color: var(--bs-primary);
  }
}

.step-card__body {
  flex: 1;
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.step-card__icon {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.3125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.6875rem;
  font-weight: 700;

  :deep(svg) {
    width: 1rem;
    height: 1rem;
  }

  &--sort {
    background: var(--bs-warning-bg-subtle);
    color: var(--bs-warning-text-emphasis);
  }

  &--filter {
    background: var(--bs-danger-bg-subtle);
    color: var(--bs-danger-text-emphasis);
  }

  &--hide-columns {
    background: var(--bs-secondary-bg);
    color: var(--bs-secondary-text-emphasis);
  }

  &--transpose {
    background: var(--bs-info-bg-subtle);
    color: var(--bs-info-text-emphasis);
  }

  &--group {
    background: hsl(270 90% 95%);
    color: hsl(270 70% 50%);
  }

  &--computed {
    background: var(--bs-info-bg-subtle);
    color: var(--bs-info-text-emphasis);
  }

  &--pivot {
    background: hsl(30 100% 93%);
    color: hsl(25 90% 48%);
  }
}

.step-card__text {
  flex: 1;
  min-width: 0;
}

.step-card__name {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--bs-body-color);
}

.step-card__desc {
  font-size: 0.6875rem;
  color: var(--bs-secondary-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.step-card__actions {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  padding-right: 0.25rem;
}

.step-card__action {
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  background: none;
  border-radius: 0.25rem;
  cursor: pointer;
  color: var(--bs-secondary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.1s;

  .step-card:hover & {
    opacity: 1;
  }

  &:hover {
    background: var(--bs-tertiary-bg);
    color: var(--bs-secondary-text-emphasis);
  }

  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
}

.step-card__config {
  width: 100%;
  padding: 0.75rem;
  border-top: 1px solid var(--bs-border-color);
  background: var(--bs-tertiary-bg);
  cursor: default;
}
</style>
