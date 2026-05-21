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
  if (index < currentStep.value) {
    return 'done'
  }
  if (index === currentStep.value) {
    return 'current'
  }
  return 'pending'
}

function isDisabled(index: number): boolean {
  return props.disabledSteps.includes(index)
}

function iconFor(step: StepEntry, index: number): Component | undefined {
  if (stateOf(index) === 'done') {
    return IconPhCheck
  }
  return step.icon
}

function selectStep(index: number) {
  if (isDisabled(index)) {
    return
  }
  currentStep.value = index
}

function onKeydown(event: KeyboardEvent, index: number) {
  const enabled: number[] = []
  for (let i = 0; i < props.steps.length; i++) {
    if (!isDisabled(i)) {
      enabled.push(i)
    }
  }
  if (enabled.length === 0) {
    return
  }

  const position = enabled.indexOf(index)
  let target: number | null = null

  switch (event.key) {
    case 'ArrowRight':
      target = enabled[(position + 1) % enabled.length]
      break
    case 'ArrowLeft':
      target = enabled[(position - 1 + enabled.length) % enabled.length]
      break
    case 'Home':
      target = enabled[0]
      break
    case 'End':
      target = enabled[enabled.length - 1]
      break
    default:
      return
  }

  event.preventDefault()
  if (target === null) {
    return
  }
  const root = (event.currentTarget as HTMLElement).closest('[role="tablist"]')
  if (!root) {
    return
  }
  const tabs = root.querySelectorAll<HTMLElement>('[role="tab"]')
  tabs[target]?.focus()
}
</script>

<template>
  <div
    class="navigation-stepper-tabs"
    :class="`navigation-stepper-tabs--${layout}`"
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
        @keydown="onKeydown($event, index)"
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
      <span
        v-if="layout === 'inline' && separator && index < steps.length - 1"
        class="navigation-stepper-tabs__sep"
        aria-hidden="true"
      >›</span>
    </template>
  </div>
</template>

<style scoped lang="scss">
.navigation-stepper-tabs {
  display: flex;
  align-items: stretch;

  &__sep {
    display: inline-flex;
    align-items: center;
    color: var(--bs-tertiary-color);
    font-family: var(--bs-font-monospace, ui-monospace, monospace);
    font-size: 0.875rem;
    user-select: none;
    padding: 0 4px;
  }

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

  &--stacked {
    width: 100%;

    .navigation-stepper-tabs__step {
      flex: 1;
      flex-direction: column;
      gap: 4px;
      padding: 8px 6px;
      --navigation-stepper-tabs-icon-size: 18px;
      font-weight: 500;
    }

    .navigation-stepper-tabs__step--current {
      font-weight: 600;
    }
  }
}
</style>
