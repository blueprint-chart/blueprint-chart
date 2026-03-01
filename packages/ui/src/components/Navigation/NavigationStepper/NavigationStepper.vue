<template>
  <nav
    class="navigation-stepper"
    aria-label="Progress"
  >
    <slot />
    <template
      v-for="(step, _i) in visibleSteps"
      :key="_i"
    >
      <button
        class="navigation-stepper__step"
        :class="stepClassList(step.originalIndex)"
        :aria-current="step.originalIndex === currentStepModel ? 'step' : undefined"
        :disabled="isStepDisabled(step.originalIndex)"
        @click="onStepClick(step.originalIndex)"
      >
        <component
          :is="step.icon"
          v-if="step.icon"
          class="navigation-stepper__icon"
        />
        {{ step.label }}
      </button>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { type Component, computed } from 'vue'
import { useChildEntriesProvider } from '../../../composables/useChildEntries'
import { StepperEntriesKey } from '../../../composables/injection-keys'

const currentStepModel = defineModel<number>('currentStep', { required: true })

const props = withDefaults(defineProps<{
  steps?: { label: string, icon?: Component }[]
  disabledSteps?: number[]
}>(), {
  steps: () => [],
  disabledSteps: () => [],
})

const { entries } = useChildEntriesProvider(StepperEntriesKey)
const resolvedSteps = computed(() =>
  entries.value.length > 0 ? entries.value : props.steps,
)

// Deduplicate consecutive steps with the same label, keeping the first occurrence
const visibleSteps = computed(() => {
  const result: { label: string, icon?: Component, originalIndex: number }[] = []
  for (let i = 0; i < resolvedSteps.value.length; i++) {
    const step = resolvedSteps.value[i]
    if (result.length === 0 || result[result.length - 1].label !== step.label) {
      result.push({ label: step.label, icon: (step as { icon?: Component }).icon, originalIndex: i })
    }
  }
  return result
})

function isStepDisabled(i: number) {
  return props.disabledSteps.includes(i)
}

function onStepClick(i: number) {
  if (!isStepDisabled(i)) {
    currentStepModel.value = i
  }
}

function stepClassList(i: number) {
  const visibleStep = visibleSteps.value.find(s => s.originalIndex === i)
  const nextVisible = visibleSteps.value[visibleSteps.value.indexOf(visibleStep!) + 1]
  const isCurrent = nextVisible
    ? currentStepModel.value >= i && currentStepModel.value < nextVisible.originalIndex
    : currentStepModel.value >= i
  const isDone = nextVisible
    ? currentStepModel.value >= nextVisible.originalIndex
    : false

  return {
    'navigation-stepper__step--done': isDone,
    'navigation-stepper__step--current': isCurrent,
    'navigation-stepper__step--disabled': isStepDisabled(i),
  }
}
</script>

<style scoped lang="scss">
.navigation-stepper {
  display: flex;
  align-items: center;
  gap: 0;
  background: var(--bs-border-color);
  border-radius: 999px;
  padding: 0.125rem;
}

.navigation-stepper__step {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: none;
  border: none;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  color: var(--bs-body-color);
  font-size: 0.8125rem;
  border-radius: 999px;
  transition: color 0.15s ease, background 0.15s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    color: var(--bs-emphasis-color);
  }

  &--done {
    color: var(--bs-body-color);
  }

  &--current {
    color: var(--bs-white, #fff);
    font-weight: 600;
    background: var(--bs-primary);
  }

  &--disabled {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
  }
}

.navigation-stepper__icon {
  width: 1em;
  height: 1em;
  flex-shrink: 0;
}
</style>
