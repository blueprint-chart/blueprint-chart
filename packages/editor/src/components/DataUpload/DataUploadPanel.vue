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
    />
    <DataUploadPaste v-model="rawInput" />

    <hr class="my-4">

    <h6 class="mb-3 text-muted">
      Or start from a sample
    </h6>
    <div class="row g-2">
      <div
        v-for="sample in samples"
        :key="sample.id"
        class="col-6 col-md-4"
      >
        <DataUploadSampleCard
          :sample="sample"
          @select="onSelectSample(sample)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useDataTable } from '@/composables/useDataTable'
import { useChartSession } from '@/composables/useChartSession'
import { samples } from '@blueprint-chart/lib'
import type { ChartSample } from '@blueprint-chart/lib'
import DataUploadFileDrop from './DataUploadFileDrop.vue'
import DataUploadPaste from './DataUploadPaste.vue'
import DataUploadSampleCard from './DataUploadSampleCard.vue'

const router = useRouter()
const { rawInput } = useDataTable()
const { createSession, loadSample } = useChartSession()

function onSelectSample(sample: ChartSample) {
  const id = createSession()
  loadSample(sample)
  router.replace(`/edit/${id}`)
}
</script>
