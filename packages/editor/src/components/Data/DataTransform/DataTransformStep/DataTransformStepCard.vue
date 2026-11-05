<template>
  <div
    class="step-card"
    :class="{ 'step-card--active': active, 'step-card--error': error }"
  >
    <button
      type="button"
      class="step-card__header"
      :aria-expanded="active"
      @click="$emit('select')"
    >
      <span class="step-card__header__number">
        {{ index + 1 }}
      </span>
      <span class="step-card__header__body">
        <span
          class="step-card__header__body__icon"
          :class="iconClass"
        >
          <component
            :is="iconComponent"
            v-if="iconComponent"
          />
          <span v-else>{{ iconFallback }}</span>
        </span>
        <span class="step-card__header__body__text">
          <span class="step-card__header__body__text__name">
            {{ label }}
          </span>
          <span
            class="step-card__header__body__text__desc"
            :class="descClassList"
          >
            {{ error || description }}
          </span>
        </span>
      </span>
    </button>
    <div class="step-card__actions">
      <button
        type="button"
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
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TransformStep } from '@/stores/dataTransforms'
import { stepMeta } from '../transformStepIcons'
import { describeStep } from '../describeStep'

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
const descClassList = computed(() => ({ 'step-card__header__body__text__desc--error': Boolean(props.error) }))

const description = computed(() => describeStep(props.step))
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
  transition: all var(--bc-duration-base);

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

  &__header {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: stretch;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    text-align: left;
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid var(--bs-emphasis-color);
      outline-offset: -2px;
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
        display: block;

        &__name {
          display: block;
          font-size: var(--bs-font-size-sm);
          font-weight: 600;
          color: var(--bs-body-color);
        }

        &__desc {
          display: block;
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
      transition: all var(--bc-duration-fast);

      .step-card:hover &,
      &:focus-visible {
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
