<template>
  <NavigationPillBase
    :items="pillItems"
    :size="size"
    aria-label="Progress"
    @select="onSelect"
  >
    <slot />
  </NavigationPillBase>
</template>

<script setup lang="ts">
import { type Component, computed } from 'vue'
import { useChildEntriesProvider } from '../../../composables/useChildEntries'
import { StepperEntriesKey } from '../../../composables/injection-keys'
import NavigationPillBase from '../NavigationPillBase/NavigationPillBase.vue'

const currentStepModel = defineModel<number>('currentStep', { required: true })

const props = withDefaults(defineProps<{
  steps?: { label: string, icon?: Component }[]
  disabledSteps?: number[]
  size?: 'sm' | 'md'
}>(), {
  steps: () => [],
  disabledSteps: () => [],
  size: 'sm',
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

const pillItems = computed(() =>
  visibleSteps.value.map((step, idx) => {
    const nextVisible = visibleSteps.value[idx + 1]
    const isCurrent = nextVisible
      ? currentStepModel.value >= step.originalIndex && currentStepModel.value < nextVisible.originalIndex
      : currentStepModel.value >= step.originalIndex
    const isDone = nextVisible
      ? currentStepModel.value >= nextVisible.originalIndex
      : false

    return {
      key: step.originalIndex.toString(),
      text: step.label,
      icon: step.icon,
      active: isCurrent,
      done: isDone,
      disabled: props.disabledSteps.includes(step.originalIndex),
    }
  }),
)

function onSelect(key: string) {
  currentStepModel.value = Number(key)
}
</script>
