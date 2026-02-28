<template>
  <div
    class="container py-4"
    style="max-width: 640px;"
  >
    <h5 class="mb-3">
      Upload or paste your data
    </h5>
    <DataUploadFileDrop
      class="mb-4"
      @loaded="rawInput = $event"
      @bpc="onBpcLoaded"
    />
    <DataUploadPaste v-model="rawInput" />
  </div>
</template>

<script setup lang="ts">
import { useDataTable } from '@/composables/useDataTable'
import { useDslSync } from '@/composables/useDslSync'
import { useChartConfig } from '@/composables/useChartConfig'
import { useWizard } from '@/composables/useWizard'
import DataUploadFileDrop from './DataUploadFileDrop.vue'
import DataUploadPaste from './DataUploadPaste.vue'

const { rawInput } = useDataTable()
const { applyDsl } = useDslSync()
const chartConfig = useChartConfig()
const wizard = useWizard()

function onBpcLoaded(content: string) {
  applyDsl(content)
  rawInput.value = chartConfig.data.value
  wizard.hydrate({ currentIndex: 2, furthestIndex: 2 })
}
</script>
