<template>
  <nav
    class="navigation-stepper"
    aria-label="Progress"
  >
    <slot />
    <template
      v-for="(step, i) in resolvedSteps"
      :key="i"
    >
      <div
        v-if="i > 0"
        class="navigation-stepper__connector"
        :class="connectorClassList(i)"
      />
      <ButtonIcon
        :label="step.label"
        variant="link"
        class="navigation-stepper__step"
        :class="stepClassList(i)"
        :aria-current="i === currentStepModel ? 'step' : undefined"
        hide-tooltip
        @click="currentStepModel = i"
      >
        <template #start>
          <span class="navigation-stepper__num">{{ i + 1 }}</span>
        </template>
      </ButtonIcon>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ButtonIcon from '../../Button/ButtonIcon/ButtonIcon.vue'
import { useChildEntriesProvider } from '../../../composables/useChildEntries'
import { StepperEntriesKey } from '../../../composables/injection-keys'

const currentStepModel = defineModel<number>('currentStep', { required: true })

const props = withDefaults(defineProps<{
  steps?: { label: string }[]
}>(), {
  steps: () => [],
})

const { entries } = useChildEntriesProvider(StepperEntriesKey)
const resolvedSteps = computed(() =>
  entries.value.length > 0 ? entries.value : props.steps,
)

function connectorClassList(i: number) {
  return { 'navigation-stepper__connector--done': i <= currentStepModel.value }
}

function stepClassList(i: number) {
  return {
    'navigation-stepper__step--done': i < currentStepModel.value,
    'navigation-stepper__step--current': i === currentStepModel.value,
  }
}
</script>

<style scoped lang="scss">
.navigation-stepper {
  display: flex;
  align-items: center;
  gap: 0;
}

.navigation-stepper__step {
  &.btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    background: none;
    border: none;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    color: var(--bs-secondary-color);
    font-size: 0.8125rem;
    border-radius: var(--bs-border-radius);
    transition: color 0.15s ease;
    text-decoration: none;
  }

  &--done.btn {
    color: var(--bs-primary);
  }

  &--current.btn {
    color: var(--bs-body-color);
    font-weight: 600;
  }
}

.navigation-stepper__num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 0.6875rem;
  font-weight: 600;
  border: 1.5px solid currentColor;

  .navigation-stepper__step--done & {
    background: var(--bs-primary);
    border-color: var(--bs-primary);
    color: var(--bs-body-bg);
  }

  .navigation-stepper__step--current & {
    border-color: var(--bs-body-color);
  }
}

.navigation-stepper__connector {
  width: 24px;
  height: 1.5px;
  background: var(--bs-border-color);
  flex-shrink: 0;

  &--done {
    background: var(--bs-primary);
  }
}
</style>
