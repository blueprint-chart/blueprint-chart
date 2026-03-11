<template>
  <div class="d-flex flex-column gap-3">
    <FormControlCheckbox
      v-if="hasShowValues"
      :model-value="currentOptions.showValues ?? false"
      label="Show values on axis"
      @update:model-value="(v) => setOption('showValues', v)"
    />

    <FormControlCheckbox
      v-if="hasBarBackground"
      :model-value="currentOptions.barBackground ?? false"
      label="Bar background"
      @update:model-value="(v) => setOption('barBackground', v)"
    />

    <FormControlCheckbox
      v-if="hasBarSeparators"
      :model-value="currentOptions.barSeparators ?? false"
      label="Bar separators"
      @update:model-value="(v) => setOption('barSeparators', v)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useChartTypeOptions } from '@/composables/useChartTypeOptions'
import { FormControlCheckbox } from '@blueprint-chart/ui'

const { currentOptions, availableOptionKeys, setOption } = useChartTypeOptions()

const hasShowValues = computed(() => availableOptionKeys.value.includes('showValues'))
const hasBarBackground = computed(() => availableOptionKeys.value.includes('barBackground'))
const hasBarSeparators = computed(() => availableOptionKeys.value.includes('barSeparators'))
</script>
