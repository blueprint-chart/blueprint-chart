<script setup lang="ts">
import NavigationStepperTabs from './NavigationStepperTabs.vue'

const steps = [
  { label: 'Data' },
  { label: 'Visualize' },
  { label: 'Export' },
]
</script>

<template>
  <Story title="Navigation/NavigationStepperTabs">
    <Variant
      title="Default"
      :init-state="() => ({ currentStep: 1 })"
    >
      <template #default="{ state }">
        <div style="border-bottom: 1px solid var(--bs-border-color); height: 56px;">
          <NavigationStepperTabs
            :current-step="state.currentStep"
            :steps="steps"
            @update:current-step="state.currentStep = $event"
          />
        </div>
      </template>
      <template #controls="{ state }">
        <HstSlider
          v-model="state.currentStep"
          title="currentStep"
          :min="0"
          :max="2"
        />
      </template>
    </Variant>

    <Variant
      title="With disabled steps"
      :init-state="() => ({ currentStep: 0, disabledSteps: [1, 2] })"
    >
      <template #default="{ state }">
        <div style="border-bottom: 1px solid var(--bs-border-color); height: 56px;">
          <NavigationStepperTabs
            :current-step="state.currentStep"
            :steps="steps"
            :disabled-steps="state.disabledSteps"
            @update:current-step="state.currentStep = $event"
          />
        </div>
      </template>
    </Variant>
  </Story>
</template>
