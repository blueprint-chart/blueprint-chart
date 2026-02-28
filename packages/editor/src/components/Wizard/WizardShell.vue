<template>
  <div class="wizard-shell">
    <WizardToolbar />
    <div class="wizard-shell__content">
      <DataUploadPanel v-if="currentStep.key === 'upload'" />
      <DataCheckPanel v-else-if="currentStep.key === 'check'" />
      <ChartEditPanel v-else-if="currentStep.key === 'edit'" />
      <PublishPanel v-else-if="currentStep.key === 'export'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeRouteLeave } from 'vue-router'
import { useWizard } from '@/composables/useWizard'
import { generateThumbnail } from '@/composables/useChartThumbnail'
import WizardToolbar from './WizardToolbar.vue'
import DataUploadPanel from '@/components/DataUpload/DataUploadPanel.vue'
import DataCheckPanel from '@/components/DataCheck/DataCheckPanel.vue'
import ChartEditPanel from '@/components/ChartEdit/ChartEditPanel.vue'
import PublishPanel from '@/components/Publish/PublishPanel.vue'

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
