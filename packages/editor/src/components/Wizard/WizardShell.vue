<template>
  <div class="wizard-shell">
    <div class="wizard-shell__content">
      <DataPanel v-if="currentStep.key === 'data'" />
      <ChartEditPanel v-else-if="currentStep.key === 'edit'" />
      <ExportPanel v-else-if="currentStep.key === 'export'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { useWizard } from '@/composables/useWizard'
import { useNavbar } from '@/composables/useNavbar'
import { useDataTable } from '@/composables/useDataTable'
import { useChartConfig } from '@/composables/useChartConfig'
import { useChartSession } from '@/composables/useChartSession'
import { generateThumbnail } from '@/composables/useChartThumbnail'
import DataPanel from '@/components/Data/DataPanel.vue'
import ChartEditPanel from '@/components/ChartEdit/ChartEditPanel.vue'
import ExportPanel from '@/components/Export/ExportPanel.vue'

const router = useRouter()
const { currentIndex, currentStep } = useWizard()
const { setMode, reset: resetNavbar } = useNavbar()
const dataTable = useDataTable()
const config = useChartConfig()
const { sessionId, createSession } = useChartSession()

onMounted(() => setMode('wizard'))
onUnmounted(() => resetNavbar())

// Serialize data when navigating from data step to edit step
watch(currentIndex, (newIndex, oldIndex) => {
  if (oldIndex === 0 && newIndex === 1) {
    config.data.value = dataTable.serialize()
    if (dataTable.columns.value.length > 2 && !config.chartType.value.includes('multi')) {
      const hasDateLabels = dataTable.columnTypes.value[0] === 'date'
      config.chartType.value = hasDateLabels ? 'line-multi' : 'bar-multi'
    }
    if (!sessionId.value) {
      const id = createSession()
      router.replace(`/edit/${id}`)
    }
  }
})

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
