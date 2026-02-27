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
  </div>
</template>

<script setup lang="ts">
import { useDataTable } from '@/composables/useDataTable'
import DataUploadFileDrop from './DataUploadFileDrop.vue'
import DataUploadPaste from './DataUploadPaste.vue'

const { rawInput } = useDataTable()
</script>
