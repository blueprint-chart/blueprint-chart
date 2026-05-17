<script setup lang="ts">
import { ref } from 'vue'
import NavigationStepperChevron from './NavigationStepperChevron.vue'

const currentStep = ref(1)
const steps = [
  { label: 'Data' },
  { label: 'Visualize' },
  { label: 'Export' },
]
</script>

<template>
  <Story title="Navigation/NavigationStepperChevron">
    <Variant title="Mid-flow (Visualize active)">
      <NavigationStepperChevron
        v-model:current-step="currentStep"
        :steps="steps"
      />
    </Variant>

    <Variant title="First step">
      <NavigationStepperChevron
        :current-step="0"
        :steps="steps"
      />
    </Variant>

    <Variant title="Last step">
      <NavigationStepperChevron
        :current-step="2"
        :steps="steps"
      />
    </Variant>

    <Variant title="With disabled final step">
      <NavigationStepperChevron
        :current-step="1"
        :steps="steps"
        :disabled-steps="[2]"
      />
    </Variant>
  </Story>
</template>
