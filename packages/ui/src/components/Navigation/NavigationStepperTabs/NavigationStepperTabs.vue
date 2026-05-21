<script setup lang="ts">
import IconPhCheck from '~icons/ph/check'
import type { Component } from 'vue'

interface StepEntry {
  label: string
  key?: string
  icon?: Component
}

const props = withDefaults(defineProps<{
  steps: StepEntry[]
  disabledSteps?: number[]
  layout?: 'inline' | 'stacked'
  separator?: boolean
}>(), {
  disabledSteps: () => [],
  layout: 'inline',
  separator: true,
})

const currentStep = defineModel<number>('currentStep', { required: true })

function stateOf(index: number): 'done' | 'current' | 'pending' {
  if (index < currentStep.value) return 'done'
  if (index === currentStep.value) return 'current'
  return 'pending'
}

function isDisabled(index: number): boolean {
  return props.disabledSteps.includes(index)
}

function iconFor(step: StepEntry, index: number): Component | undefined {
  if (stateOf(index) === 'done') return IconPhCheck
  return step.icon
}

function selectStep(index: number) {
  if (isDisabled(index)) return
  currentStep.value = index
}
</script>

<template>
  <div
    class="navigation-stepper-tabs"
    :class="`navigation-stepper-tabs--${layout}`"
    role="tablist"
    aria-label="Progress"
  >
    <template v-for="(step, index) in steps" :key="step.key ?? index">
      <button
        type="button"
        role="tab"
        :aria-selected="index === currentStep ? 'true' : 'false'"
        :aria-disabled="isDisabled(index) || undefined"
        :tabindex="isDisabled(index) ? -1 : 0"
        :class="[
          'navigation-stepper-tabs__step',
          `navigation-stepper-tabs__step--${stateOf(index)}`,
          { 'navigation-stepper-tabs__step--disabled': isDisabled(index) },
        ]"
        :title="step.label"
        @click="selectStep(index)"
      >
        <span
          v-if="iconFor(step, index)"
          class="navigation-stepper-tabs__step__icon"
          aria-hidden="true"
        >
          <component :is="iconFor(step, index)" />
        </span>
        <span class="navigation-stepper-tabs__step__label">{{ step.label }}</span>
      </button>
    </template>
  </div>
</template>

<style scoped lang="scss">
.navigation-stepper-tabs {
  display: flex;
  align-items: stretch;

  &__step {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--bs-secondary-color);
    font-size: var(--bs-font-size-sm, 0.75rem);
    line-height: 1;
    font-weight: 500;
    padding: 10px 12px;
    border-bottom: 2px solid transparent;
    transition: color var(--bc-duration-base, 150ms) var(--bc-ease, cubic-bezier(0.4, 0, 0.2, 1));

    &:hover:not(&--disabled):not(&--current) {
      color: var(--bs-body-color);
    }

    &--done {
      color: var(--bs-body-color);
    }

    &--current {
      color: var(--bs-body-color);
      border-bottom-color: var(--bs-primary);
      font-weight: 600;
    }

    &--disabled {
      color: var(--bs-tertiary-color);
      opacity: 0.4;
      cursor: not-allowed;
      pointer-events: none;
    }

    &__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--navigation-stepper-tabs-icon-size, 16px);
      height: var(--navigation-stepper-tabs-icon-size, 16px);
      flex-shrink: 0;

      svg {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
