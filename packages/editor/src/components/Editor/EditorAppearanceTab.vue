<template>
  <div class="d-flex flex-column gap-3">
    <EditorColorSection />

    <template v-if="hasLine">
      <hr>
      <EditorLineSection />
    </template>

    <template v-if="hasLegend">
      <hr>
      <EditorLegendSection />
    </template>

    <template v-if="hasSlice">
      <hr>
      <EditorSliceSection />
    </template>

    <template v-if="hasInteraction">
      <hr>
      <EditorInteractionSection />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useChartTypeOptions } from '@/composables/useChartTypeOptions'
import EditorColorSection from './EditorColorSection.vue'
import EditorLineSection from './EditorLineSection.vue'
import EditorLegendSection from './EditorLegendSection.vue'
import EditorSliceSection from './EditorSliceSection.vue'
import EditorInteractionSection from './EditorInteractionSection.vue'

const { availableOptionKeys } = useChartTypeOptions()

const hasLine = computed(() =>
  availableOptionKeys.value.includes('interpolation')
  || availableOptionKeys.value.includes('lineSymbols'),
)

const hasLegend = computed(() => availableOptionKeys.value.includes('legend'))

const hasSlice = computed(() => availableOptionKeys.value.includes('displayAsPercentage'))

const hasInteraction = computed(() =>
  availableOptionKeys.value.includes('valueLabels')
  || availableOptionKeys.value.includes('tooltips')
  || availableOptionKeys.value.includes('crosshair'),
)
</script>
