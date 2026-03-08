<template>
  <div class="d-flex flex-column gap-4">
    <SettingsSection
      title="Colors"
      :icon="IPhPalette"
    >
      <EditorColorSection />
    </SettingsSection>

    <SettingsSection
      v-if="hasLine"
      title="Line Style"
      :icon="IPhLineSegments"
    >
      <EditorLineSection />
    </SettingsSection>

    <SettingsSection
      v-if="hasLegend"
      title="Legend"
      :icon="IPhListBullets"
    >
      <EditorLegendSection />
    </SettingsSection>

    <SettingsSection
      v-if="hasSlice"
      title="Slices"
      :icon="IPhChartPieSlice"
    >
      <EditorSliceSection />
    </SettingsSection>

    <SettingsSection
      v-if="hasInteraction"
      title="Interactions"
      :icon="IPhCursorClick"
    >
      <EditorInteractionSection />
    </SettingsSection>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SettingsSection } from '@blueprint-chart/ui'
import { useChartTypeOptions } from '@/composables/useChartTypeOptions'
import IPhPalette from '~icons/ph/palette'
import IPhLineSegments from '~icons/ph/line-segments'
import IPhListBullets from '~icons/ph/list-bullets'
import IPhChartPieSlice from '~icons/ph/chart-pie-slice'
import IPhCursorClick from '~icons/ph/cursor-click'
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
