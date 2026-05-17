<template>
  <div
    class="navigation-stepper-chevron"
    role="tablist"
    aria-label="Progress"
  >
    <template
      v-for="(step, index) in steps"
      :key="step.key ?? index"
    >
      <button
        type="button"
        role="tab"
        :aria-selected="index === currentStepModel"
        :aria-disabled="disabledSteps.includes(index) || undefined"
        :tabindex="disabledSteps.includes(index) ? -1 : 0"
        :class="stepClass(index)"
        :title="step.label"
        @click="selectStep(index)"
      >
        <span class="navigation-stepper-chevron__step__chip">
          <IconPhCheck v-if="stateOf(index) === 'done'" />
          <template v-else>{{ index + 1 }}</template>
        </span>
        <span class="navigation-stepper-chevron__step__label">{{ step.label }}</span>
      </button>
      <span
        v-if="index < steps.length - 1"
        class="navigation-stepper-chevron__sep"
        aria-hidden="true"
      >›</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import IconPhCheck from '~icons/ph/check'

interface StepEntry {
  label: string
  key?: string
}

const currentStepModel = defineModel<number>('currentStep', { required: true })

const props = withDefaults(defineProps<{
  steps: StepEntry[]
  disabledSteps?: number[]
}>(), {
  disabledSteps: () => [],
})

function stateOf(index: number): 'done' | 'current' | 'pending' {
  if (index < currentStepModel.value) {
    return 'done'
  }
  if (index === currentStepModel.value) {
    return 'current'
  }
  return 'pending'
}

function stepClass(index: number) {
  return {
    'navigation-stepper-chevron__step': true,
    [`navigation-stepper-chevron__step--${stateOf(index)}`]: true,
    'navigation-stepper-chevron__step--disabled': props.disabledSteps.includes(index),
  }
}

function selectStep(index: number) {
  if (props.disabledSteps.includes(index)) {
    return
  }
  currentStepModel.value = index
}
</script>

<style scoped lang="scss">
.navigation-stepper-chevron {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &__sep {
    color: var(--bs-tertiary-color);
    font-family: var(--bs-font-monospace, ui-monospace, monospace);
    font-size: 0.875rem;
    user-select: none;
  }

  &__step {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
    background: transparent;
    border: none;
    border-radius: var(--bc-radius-sm);
    font-size: var(--bs-font-size-sm, 0.8125rem);
    color: var(--bs-secondary-color);
    cursor: pointer;
    transition: color var(--bc-duration-base) var(--bc-ease);

    &:hover:not(&--disabled):not(&--current) {
      color: var(--bs-body-color);
    }

    &--done,
    &--current {
      color: var(--bs-body-color);
    }

    &--current {
      font-weight: 500;
    }

    &--disabled {
      color: var(--bs-tertiary-color);
      cursor: not-allowed;
    }

    &__chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1rem;
      height: 1rem;
      border-radius: 999px;
      background: var(--bc-wash-soft);
      color: var(--bs-secondary-color);
      font-family: var(--bs-font-monospace, ui-monospace, monospace);
      font-size: 0.6875rem;
      flex-shrink: 0;
    }

    &--done &__chip,
    &--current &__chip {
      background: rgba(37, 99, 160, 0.18);
      color: #a3c9e8;
    }

    &__label {
      white-space: nowrap;
    }
  }

  @media (max-width: 479.98px) {
    &__step__label {
      display: none;
    }
  }
}
</style>
