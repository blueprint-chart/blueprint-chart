<script setup lang="ts">
import { ref } from 'vue'
import NavigationStepperTabs from './NavigationStepperTabs.vue'
import IconPhTable from '~icons/ph/table'
import IconPhChartBar from '~icons/ph/chart-bar'
import IconPhExport from '~icons/ph/export'

const currentStep = ref(1)
const stackedStep = ref(1)
const coldStep = ref(0)
const longStep = ref(1)

const wizardSteps = [
  { label: 'Data', icon: IconPhTable },
  { label: 'Visualize', icon: IconPhChartBar },
  { label: 'Export', icon: IconPhExport },
]

const longLabels = [
  { label: 'Configuration', icon: IconPhTable },
  { label: 'Reconciliation', icon: IconPhChartBar },
  { label: 'Distribution', icon: IconPhExport },
]
</script>

<template>
  <Story title="Navigation/NavigationStepperTabs">
    <Variant title="Inline — mid-flow (Visualize active)">
      <NavigationStepperTabs
        v-model:current-step="currentStep"
        :steps="wizardSteps"
      />
    </Variant>

    <Variant title="Inline — cold start (Visualize & Export disabled)">
      <NavigationStepperTabs
        v-model:current-step="coldStep"
        :steps="wizardSteps"
        :disabled-steps="[1, 2]"
      />
    </Variant>

    <Variant title="Stacked — mid-flow">
      <div style="max-width: 360px; padding: 8px; background: var(--bc-content-bg);">
        <NavigationStepperTabs
          v-model:current-step="stackedStep"
          :steps="wizardSteps"
          layout="stacked"
        />
      </div>
    </Variant>

    <Variant title="Stacked — cold start">
      <div style="max-width: 360px; padding: 8px; background: var(--bc-content-bg);">
        <NavigationStepperTabs
          :current-step="0"
          :steps="wizardSteps"
          :disabled-steps="[1, 2]"
          layout="stacked"
        />
      </div>
    </Variant>

    <Variant title="Inline — long labels stress test">
      <NavigationStepperTabs
        v-model:current-step="longStep"
        :steps="longLabels"
      />
    </Variant>

    <Variant title="Inline — separator disabled">
      <NavigationStepperTabs
        :current-step="1"
        :steps="wizardSteps"
        :separator="false"
      />
    </Variant>
  </Story>
</template>
