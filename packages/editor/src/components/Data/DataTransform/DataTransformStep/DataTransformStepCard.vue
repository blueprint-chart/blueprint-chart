<template>
  <div
    class="step-card"
    :class="{ 'step-card--active': active, 'step-card--error': error }"
    @click="$emit('select')"
  >
    <div class="step-card__number">
      {{ index + 1 }}
    </div>
    <div class="step-card__body">
      <span
        class="step-card__body__icon"
        :class="iconClass"
      >
        <component
          :is="iconComponent"
          v-if="iconComponent"
        />
        <span v-else>{{ iconFallback }}</span>
      </span>
      <div class="step-card__body__text">
        <div class="step-card__body__text__name">
          {{ label }}
        </div>
        <div
          class="step-card__body__text__desc"
          :class="{ 'step-card__body__text__desc--error': error }"
        >
          {{ error || description }}
        </div>
      </div>
    </div>
    <div class="step-card__actions">
      <button
        class="step-card__actions__btn"
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
import type { TransformStep } from '@/stores/dataTransforms'
import { stepMeta } from '../transformStepIcons'

const props = defineProps<{
  step: TransformStep
  index: number
  active: boolean
  error?: string | null
}>()

defineEmits<{
  select: []
  delete: []
}>()

const meta = computed(() => stepMeta[props.step.type])
const iconClass = computed(() => meta.value.iconClass)
const iconComponent = computed(() => meta.value.iconComponent ?? null)
const iconFallback = computed(() => meta.value.fallback)
const label = computed(() => meta.value.label)

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
  if (step.type === 'parse' && step.config.column && step.config.operation) {
    return `${step.config.column} → ${step.config.operation}`
  }
  if (step.type === 'rename' && step.config.column && step.config.newName) {
    return `${step.config.column} → ${step.config.newName}`
  }
  if (step.type === 'group-by' && step.config.groupColumns && step.config.aggregates) {
    const groups = step.config.groupColumns.split(',').map(c => c.trim()).filter(Boolean).join(', ')
    const aggs = step.config.aggregates.split(',').map((a) => {
      const sep = a.lastIndexOf(':')
      if (sep < 0) {
        return a.trim()
      }
      return `${a.slice(sep + 1).trim()}(${a.slice(0, sep).trim()})`
    }).join(', ')
    return `Group by ${groups} — ${aggs}`
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

  &--error {
    border-color: var(--bs-danger-border-subtle);

    &:hover {
      border-color: var(--bs-danger);
      box-shadow: 0 0 0 2px var(--bs-danger-bg-subtle);
    }

    &.step-card--active {
      border-color: var(--bs-danger);
      box-shadow: 0 0 0 2px var(--bs-danger-bg-subtle);
    }
  }

  &__number {
    width: 2rem;
    min-width: 2rem;
    background: var(--bs-tertiary-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--bs-font-size-xs);
    font-weight: 700;
    color: var(--bs-secondary-color);
    border-right: 1px solid var(--bs-border-color);

    .step-card--active & {
      background: var(--bs-primary-bg-subtle);
      color: var(--bs-primary);
    }

    .step-card--error & {
      background: var(--bs-danger-bg-subtle);
      color: var(--bs-danger);
    }
  }

  &__body {
    flex: 1;
    min-width: 0;
    padding: 0.5rem 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &__icon {
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: var(--bs-font-size-xs);
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

      &--parse {
        background: var(--bs-success-bg-subtle);
        color: var(--bs-success-text-emphasis);
      }

      &--rename {
        background: var(--bs-primary-bg-subtle);
        color: var(--bs-primary-text-emphasis);
      }

      &--group {
        background: hsl(270 90% 95%);
        color: hsl(270 70% 50%);
      }

      &--computed {
        background: var(--bs-info-bg-subtle);
        color: var(--bs-info-text-emphasis);
      }
    }

    &__text {
      flex: 1;
      min-width: 0;

      &__name {
        font-size: var(--bs-font-size-sm);
        font-weight: 600;
        color: var(--bs-body-color);
      }

      &__desc {
        font-size: var(--bs-font-size-xs);
        color: var(--bs-secondary-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        &--error {
          color: var(--bs-danger);
        }
      }
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.125rem;
    padding-right: 0.25rem;

    &__btn {
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
  }

  &__config {
    width: 100%;
    padding: 0.75rem;
    border-top: 1px solid var(--bs-border-color);
    background: var(--bs-tertiary-bg);
    cursor: default;
  }
}
</style>
