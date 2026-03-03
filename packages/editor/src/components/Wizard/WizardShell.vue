<template>
  <div class="wizard-shell">
    <WizardToolbar />
    <div class="wizard-shell__content">
      <DataPanel v-if="currentStep.key === 'data'" />
      <ChartEditPanel v-else-if="currentStep.key === 'edit'" />
      <ExportPanel v-else-if="currentStep.key === 'export'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeRouteLeave } from 'vue-router'
import { useWizard } from '@/composables/useWizard'
import { generateThumbnail } from '@/composables/useChartThumbnail'
import WizardToolbar from './WizardToolbar.vue'
import DataPanel from '@/components/Data/DataPanel.vue'
import ChartEditPanel from '@/components/ChartEdit/ChartEditPanel.vue'
import ExportPanel from '@/components/Export/ExportPanel.vue'

const { currentStep } = useWizard()

onBeforeRouteLeave(() => {
  generateThumbnail()
})
</script>

<style scoped lang="scss">
.wizard-shell {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
}

.wizard-shell__content {
  display: flex;
  flex-grow: 1;
  overflow: auto;
}
</style>
