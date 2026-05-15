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
    'navigation-stepper-tabs__step': true,
    [`navigation-stepper-tabs__step--${stateOf(index)}`]: true,
    'navigation-stepper-tabs__step--disabled': props.disabledSteps.includes(index),
  }
}

function selectStep(index: number) {
  if (props.disabledSteps.includes(index)) {
    return
  }
  currentStepModel.value = index
}
</script>

<template>
  <div
    class="navigation-stepper-tabs"
    role="tablist"
    aria-label="Progress"
  >
    <button
      v-for="(step, index) in steps"
      :key="step.key ?? index"
      type="button"
      role="tab"
      :aria-selected="index === currentStepModel"
      :aria-disabled="disabledSteps.includes(index) || undefined"
      :tabindex="disabledSteps.includes(index) ? -1 : 0"
      :class="stepClass(index)"
      @click="selectStep(index)"
    >
      <span class="navigation-stepper-tabs__step__marker">
        <IconPhCheck v-if="stateOf(index) === 'done'" />
        <template v-else>{{ index + 1 }}</template>
      </span>
      <span class="navigation-stepper-tabs__step__label">{{ step.label }}</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.navigation-stepper-tabs {
  display: inline-flex;
  align-items: stretch;
  align-self: stretch;
  height: 100%;
  gap: 0;

  &__step {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0 1rem;
    height: 100%;
    background: transparent;
    border: none;
    color: var(--bs-secondary-color);
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.12s ease;

    &:hover:not(&--disabled) {
      color: var(--bs-body-color);
    }

    &--done {
      color: var(--bs-body-color);
    }

    &--current {
      color: var(--bs-body-color);
    }

    &--current::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: -1px;
      height: 2px;
      background: var(--bs-primary);
    }

    &--disabled {
      color: var(--bs-tertiary-color);
      cursor: not-allowed;
    }

    &__marker {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: var(--bs-font-monospace);
      font-size: 0.6875rem;
      width: 0.875rem;
      text-align: center;
      color: var(--bs-tertiary-color);
    }

    &--done &__marker,
    &--current &__marker {
      color: var(--bs-primary);
    }

    &--current &__marker {
      font-weight: 600;
    }
  }
}
</style>
