<script setup lang="ts">
import Stepper from './NavigationStepper.vue'
import StepperStep from './NavigationStepperStep.vue'
</script>

<template>
  <Story title="Navigation/NavigationStepper">
    <Variant
      title="Default"
      :init-state="() => ({ currentStep: 1 })"
    >
      <template #default="{ state }">
        <Stepper
          :current-step="state.currentStep"
          @update:current-step="state.currentStep = $event"
        >
          <StepperStep label="Upload" />
          <StepperStep label="Check" />
          <StepperStep label="Edit" />
          <StepperStep label="Export" />
        </Stepper>
      </template>
      <template #controls="{ state }">
        <HstSlider
          v-model="state.currentStep"
          title="currentStep"
          :min="0"
          :max="3"
        />
      </template>
    </Variant>

    <Variant
      title="Disabled Steps"
      :init-state="() => ({ currentStep: 0, disabledSteps: [1, 2, 3] })"
    >
      <template #default="{ state }">
        <Stepper
          :current-step="state.currentStep"
          :disabled-steps="state.disabledSteps"
          @update:current-step="state.currentStep = $event"
        >
          <StepperStep label="Upload" />
          <StepperStep label="Check" />
          <StepperStep label="Edit" />
          <StepperStep label="Export" />
        </Stepper>
      </template>
      <template #controls="{ state }">
        <HstSlider
          v-model="state.currentStep"
          title="currentStep"
          :min="0"
          :max="3"
        />
      </template>
    </Variant>
  </Story>
</template>
