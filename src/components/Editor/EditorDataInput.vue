<template>
  <BFormGroup
    label="Data"
    label-for="data-input"
  >
    <BFormTextarea
      id="data-input"
      v-model="data"
      rows="8"
      placeholder="&quot;Label&quot; = 42%"
    />
  </BFormGroup>
</template>

<script setup lang="ts">
import { useChartConfig } from '@/composables/useChartConfig'

const { data } = useChartConfig()
</script>
